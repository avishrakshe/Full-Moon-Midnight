import React, { useState } from 'react';
import { useMidnight } from './hooks';
import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import './App.css';

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

  const [activeTab, setActiveTab] = useState<'registry' | 'circuit' | 'wallet'>('registry');

  const formatShortAddr = (addr: string | null) => {
    if (!addr) return 'Connect Wallet';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const scrollToExecution = () => {
    const el = document.getElementById('circuit-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '60px' }}>
      {/* ─── Top Floating Header / Navbar ─── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px 0 20px' }}>
        <header
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '9999px',
            padding: '8px 16px 8px 12px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Left Brand + Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#b5f930',
                  color: '#000000',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                D
              </div>
              <span style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', letterSpacing: '-0.02em' }}>
                DeFi Agents
              </span>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 500, color: '#475569' }}>
              <span style={{ cursor: 'pointer', color: '#0f172a', fontWeight: 600 }}>Registry</span>
              <span style={{ cursor: 'pointer' }}>Activity</span>
              <span style={{ cursor: 'pointer' }}>Auditor</span>
              <span style={{ cursor: 'pointer' }}>About</span>
            </nav>
          </div>

          {/* Center Dark Status Pill */}
          <div
            style={{
              backgroundColor: '#18181b',
              color: '#ffffff',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
              }}
            />
            <span>Private L1 · Preview Testnet · Allowlist active</span>
          </div>

          {/* Right Network & Wallet Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontWeight: 600, color: '#059669' }}>RPC live</span>
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', display: 'none', minWidth: '80px' }}>
              <div>Orchestrator</div>
              <div style={{ fontFamily: 'monospace', color: '#64748b' }}>0x7f06... [encrypted]</div>
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
              <div>Your wallet</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{isConnected ? '0.00 tNIGHT' : 'Disconnected'}</div>
            </div>

            <button
              onClick={() => {
                if (isConnected) disconnect();
                else connect('preview');
              }}
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{formatShortAddr(walletAddress)}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>
          </div>
        </header>
      </div>

      {/* ─── Main Hero Content ─── */}
      <main style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 20px' }}>
        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span className="badge-pill">Permissioned L1</span>
          <span className="badge-pill">eERC encrypted payments</span>
          <span className="badge-pill">Auditor compliance</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Hero Left Column */}
          <div>
            <h1
              style={{
                fontSize: '52px',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                margin: '0 0 20px 0',
                color: '#09090b',
              }}
            >
              Private agent marketplace.
              <br />
              <span style={{ color: '#94a3b8' }}>Encrypted eAGT payments.</span>
            </h1>

            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.55,
                color: '#475569',
                margin: '0 0 32px 0',
                maxWidth: '520px',
              }}
            >
              Specialist agents settle in encrypted eAGT on a permissioned Avalanche &amp; Midnight L1. Amounts stay hidden — auditors can decrypt for compliance without spending authority.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="lime-btn" onClick={scrollToExecution}>
                Run encrypted task
              </button>
              <button
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '9999px',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                onClick={() => setActiveTab('wallet')}
              >
                {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
              </button>
            </div>
          </div>

          {/* Hero Right Column (Agent Reputation Card) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 10px 35px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Agent Reputation</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Public scores · encrypted payments
                </p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '9999px' }}>
                Active Provers
              </span>
            </div>

            {/* Metrics Display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '36px' }}>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>85</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', lineHeight: 1.3 }}>Smart Contract Auditor</div>
              </div>

              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>50</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', lineHeight: 1.3 }}>Token Risk Scorer</div>
              </div>

              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>85</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', lineHeight: 1.3 }}>Gas &amp; Timing Agent</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Interactive Section Tabs ─── */}
        <div style={{ marginTop: '64px' }} id="circuit-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                ONCHAIN REGISTRY
              </div>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                Agent Registry &amp; Circuit Execution
              </h2>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
              3 DeFi agents available
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px', alignItems: 'start' }}>
            {/* Wallet Panel */}
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

            {/* Circuit Panel */}
            <section aria-label="Circuit Execution">
              <CircuitCall isConnected={isConnected} runStoreMessage={runStoreMessage} />
            </section>
          </div>
        </div>

        {/* ─── Registry Table / Agent Cards ─── */}
        <div style={{ marginTop: '48px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            Registered Zero-Knowledge Smart Contract Agents
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '3px 8px', borderRadius: '6px' }}>Auditor</span>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>• Verified</span>
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Smart Contract Auditor</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
                Evaluates compact circuits and verifies zero-knowledge compliance without exposing source code.
              </p>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '6px' }}>Scorer</span>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>• Active</span>
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Token Risk Scorer</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
                Computes collateralized risk scores using private witness proofs without revealing account balances.
              </p>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', backgroundColor: '#d1fae5', padding: '3px 8px', borderRadius: '6px' }}>Timing</span>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>• Verified</span>
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Gas &amp; Timing Agent</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
                Optimizes proof generation timing and DUST collateral reserves across Midnight networks.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer style={{ maxWidth: '1200px', margin: '60px auto 0 auto', padding: '0 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
        <p>
          Powered by <strong>Midnight Network</strong> &amp; <strong>Lace Beta Wallet</strong>
        </p>
        <p style={{ marginTop: '6px' }}>
          Privacy-preserving smart contracts enabled by Zero-Knowledge cryptography on Preview Testnet.
        </p>
      </footer>
    </div>
  );
};

export default App;
