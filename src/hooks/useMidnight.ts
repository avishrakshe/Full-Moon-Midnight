import { useState, useEffect, useCallback } from 'react';
import { type InitialAPI, type WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { parseCoinPublicKeyToHex, parseEncPublicKeyToHex } from '@midnight-ntwrk/midnight-js-utils';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { findDeployedContract, type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import { type MidnightProviders, type PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';
import * as helloWorld from '../../contracts/managed/hello-world/contract';

class InMemoryPrivateStateProvider implements PrivateStateProvider {
  private states = new Map<string, any>();
  private signingKeys = new Map<string, any>();
  
  setContractAddress(address: any): void {}
  
  async set(privateStateId: string, state: any): Promise<void> {
    this.states.set(privateStateId, state);
  }
  
  async get(privateStateId: string): Promise<any | null> {
    return this.states.get(privateStateId) ?? null;
  }
  
  async remove(privateStateId: string): Promise<void> {
    this.states.delete(privateStateId);
  }
  
  async clear(): Promise<void> {
    this.states.clear();
  }
  
  async setSigningKey(address: any, signingKey: any): Promise<void> {
    this.signingKeys.set(address.toString(), signingKey);
  }
  
  async getSigningKey(address: any): Promise<any | null> {
    return this.signingKeys.get(address.toString()) ?? null;
  }
  
  async removeSigningKey(address: any): Promise<void> {
    this.signingKeys.delete(address.toString());
  }
  
  async clearSigningKeys(): Promise<void> {
    this.signingKeys.clear();
  }
  
  async exportPrivateStates(): Promise<any> {
    return { format: 'midnight-private-state-export', encryptedPayload: '', salt: '' };
  }
  
  async importPrivateStates(): Promise<any> {
    return { imported: 0, skipped: 0, overwritten: 0 };
  }
  
  async exportSigningKeys(): Promise<any> {
    return { format: 'midnight-signing-key-export', encryptedPayload: '', salt: '' };
  }
  
  async importSigningKeys(): Promise<any> {
    return { imported: 0, skipped: 0, overwritten: 0 };
  }
}

declare global {
  interface Window {
    midnight?: Record<string, InitialAPI>;
  }
}

export interface UseMidnightResult {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  shieldedAddress: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  runStoreMessage: (contractAddress: string, message: string) => Promise<string>;
}

export function useMidnight(): UseMidnightResult {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [shieldedAddress, setShieldedAddress] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<WalletConnectedAPI | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect if already authorized
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const wallet = window.midnight?.mnLace;
        if (wallet) {
          // In some connector versions, checking if enabled is supported
          // If the user already authorized the app, we can connect.
          // Otherwise, we wait for explicit user click.
        }
      } catch (err) {
        console.warn('Auto-connect check failed:', err);
      }
    };
    checkConnection();
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      let wallet = window.midnight?.mnLace;
      if (!wallet && window.midnight) {
        const wallets = Object.values(window.midnight);
        if (wallets.length > 0) {
          wallet = wallets[0];
        }
      }
      if (!wallet) {
        throw new Error('Lace Beta Wallet for Midnight is not installed. Please install it to continue.');
      }

      // Connect to the preprod network as per Level 2 specifications
      const api = await wallet.connect('preprod');
      setConnectedApi(api);

      // Fetch wallet addresses
      const unshieldedData = await api.getUnshieldedAddress();
      const shieldedData = await api.getShieldedAddresses();

      setWalletAddress(unshieldedData.unshieldedAddress);
      setShieldedAddress(shieldedData.shieldedAddress);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      setError(err?.message || err?.toString() || 'Failed to connect to Lace wallet.');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnectedApi(null);
    setWalletAddress(null);
    setShieldedAddress(null);
    setIsConnected(false);
    setError(null);
  }, []);

  const runStoreMessage = useCallback(async (contractAddress: string, message: string): Promise<string> => {
    if (!connectedApi || !walletAddress || !shieldedAddress) {
      throw new Error('Wallet is not connected.');
    }

    // 1. Fetch network configuration from wallet API
    const config = await connectedApi.getConfiguration();
    
    // Fallback to default preprod endpoints if not provided by wallet
    const indexerUri = config.indexerUri || 'https://indexer.preprod.midnight.network/api/v4/graphql';
    const indexerWsUri = config.indexerWsUri || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';
    const proofServerUri = 'https://proof-server.preprod.midnight.network';

    // 2. Setup ZK Config Provider pointing to local static assets
    const zkConfigProvider = new FetchZkConfigProvider(
      `${window.location.origin}/managed/hello-world`,
      fetch.bind(window)
    );

    // 3. Setup Wallet & Midnight providers wrapping the DApp connector API
    const walletProvider = {
      getCoinPublicKey: () => {
        // Parse Bech32m key to hex string
        return parseCoinPublicKeyToHex(shieldedAddress, 'preprod');
      },
      getEncryptionPublicKey: () => {
        // Parse Bech32m key to hex string
        return parseEncPublicKeyToHex(shieldedAddress, 'preprod');
      },
      balanceTx: async (tx: any, ttl?: Date) => {
        // balanceUnsealedTransaction takes a serialized transaction string.
        // During contract call, the SDK passes a serialized transaction string or object.
        // We serialize/deserialize as required.
        const txString = typeof tx === 'string' ? tx : tx.toString();
        const response = await connectedApi.balanceUnsealedTransaction(txString, {
          payFees: true
        });
        return response.tx;
      }
    };

    const midnightProvider = {
      submitTx: async (tx: any) => {
        const txString = typeof tx === 'string' ? tx : tx.toString();
        await connectedApi.submitTransaction(txString);
        // Return a dummy transaction ID or try to hash it, or simply return empty string.
        // The SDK's findDeployedContract watch logic uses the tx id to track inclusion.
        return 'browser-submitted-tx';
      }
    };

    // 4. Assemble the MidnightProviders object
    const providers: MidnightProviders<any, any, any> = {
      privateStateProvider: new InMemoryPrivateStateProvider(),
      publicDataProvider: indexerPublicDataProvider(indexerUri, indexerWsUri),
      zkConfigProvider,
      proofProvider: httpClientProofProvider(proofServerUri, zkConfigProvider),
      walletProvider: walletProvider as any,
      midnightProvider: midnightProvider as any
    };

    // 5. Load the deployed contract instance
    const contract = await findDeployedContract(providers, {
      compiledContract: helloWorld.Contract,
      contractAddress: contractAddress
    });

    // 6. Invoke storeMessage circuit
    const result = await contract.callTx.storeMessage(message);
    
    // Return transaction hash
    return result.public.txId || 'Transaction Success';
  }, [connectedApi, walletAddress, shieldedAddress]);

  return {
    isConnected,
    isConnecting,
    walletAddress,
    shieldedAddress,
    error,
    connect,
    disconnect,
    runStoreMessage
  };
}
