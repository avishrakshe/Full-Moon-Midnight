import React from 'react';

interface WalletConnectProps {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  shieldedAddress: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  isConnecting,
  walletAddress,
  shieldedAddress,
  error,
  connect,
  disconnect,
}) => {
  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 10)}...${addr.slice(-10)}`;
  };

  const copyToClipboard = (text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Address copied to clipboard!');
  };

  return (
    <div
      style={{
        background: 'rgba(17, 24, 39, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        margin: '0 auto 24px auto',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#f3f4f6' }}>Wallet Connection</h2>
        <span
          style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#f59e0b',
            boxShadow: isConnected ? '0 0 10px #10b981' : '0 0 10px #f59e0b',
          }}
        />
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '14px',
            marginBottom: '16px',
            lineHeight: 1.4,
          }}
        >
          <strong>Error: </strong> {error}
        </div>
      )}

      {!isConnected ? (
        <button
          onClick={connect}
          disabled={isConnecting}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: isConnecting ? 'rgba(79, 70, 229, 0.5)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
          }}
        >
          {isConnecting ? 'Connecting to Lace...' : 'Connect Lace Wallet'}
        </button>
      ) : (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Public Address (Unshielded)</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <code
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#e5e7eb',
                  fontFamily: 'monospace',
                  flex: 1,
                  wordBreak: 'break-all',
                }}
              >
                {formatAddress(walletAddress)}
              </code>
              <button
                onClick={() => copyToClipboard(walletAddress)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#d1d5db',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Copy
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Private Address (Shielded)</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <code
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#e5e7eb',
                  fontFamily: 'monospace',
                  flex: 1,
                  wordBreak: 'break-all',
                }}
              >
                {formatAddress(shieldedAddress)}
              </code>
              <button
                onClick={() => copyToClipboard(shieldedAddress)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#d1d5db',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Copy
              </button>
            </div>
          </div>

          <button
            onClick={disconnect}
            style={{
              width: '100%',
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              border: '1px solid rgba(156, 163, 175, 0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};
