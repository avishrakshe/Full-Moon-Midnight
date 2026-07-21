import React from 'react';
import { useMidnight } from './hooks';
import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';

export const App: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    walletAddress,
    shieldedAddress,
    error,
    connect,
    disconnect,
    runStoreMessage,
  } = useMidnight();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 100%)',
        padding: '40px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1
            style={{
              margin: '0 0 12px 0',
              fontSize: '36px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Midnight Challenge Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '16px', color: '#94a3b8', lineHeight: 1.5 }}>
            Level 2: Browser Zero-Knowledge Proving & Wallet Connection
          </p>
        </header>

        {/* Dashboard Grid */}
        <main
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
          }}
        >
          {/* Wallet connection panel */}
          <section aria-label="Wallet Connection">
            <WalletConnect
              isConnected={isConnected}
              isConnecting={isConnecting}
              walletAddress={walletAddress}
              shieldedAddress={shieldedAddress}
              error={error}
              connect={connect}
              disconnect={disconnect}
            />
          </section>

          {/* Circuit Call panel */}
          <section aria-label="Circuit Execution">
            <CircuitCall isConnected={isConnected} runStoreMessage={runStoreMessage} />
          </section>
        </main>

        {/* Footer */}
        <footer style={{ textAlign: 'center', marginTop: '64px', color: '#64748b', fontSize: '13px' }}>
          <p>
            Powered by <strong>Midnight Network</strong> &amp; <strong>Lace Beta Wallet</strong>
          </p>
          <p style={{ marginTop: '8px' }}>
            Privacy-preserving smart contracts enabled by Zero-Knowledge cryptography.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
