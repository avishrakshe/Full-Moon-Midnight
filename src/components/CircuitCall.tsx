import React, { useState } from 'react';

interface CircuitCallProps {
  isConnected: boolean;
  runStoreMessage: (
    contractAddress: string,
    message: string,
    onProgress?: (step: string, percent: number) => void
  ) => Promise<string>;
}

type CallStatus = 'idle' | 'executing' | 'success' | 'error';

export const CircuitCall: React.FC<CircuitCallProps> = ({ isConnected, runStoreMessage }) => {
  const [contractAddress, setContractAddress] = useState(
    '7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1'
  );
  const [customMessage, setCustomMessage] = useState('');
  const [status, setStatus] = useState<CallStatus>('idle');
  const [progressStep, setProgressStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !contractAddress || !customMessage) return;

    setStatus('executing');
    setErrorMsg(null);
    setTxHash(null);
    setProgressPercent(10);
    setProgressStep('Starting circuit execution...');

    try {
      const hash = await runStoreMessage(contractAddress, customMessage, (step, percent) => {
        setProgressStep(step);
        setProgressPercent(percent);
      });
      
      setStatus('success');
      setTxHash(hash);
    } catch (err: any) {
      console.error('Circuit call execution failed:', err);
      setStatus('error');
      setErrorMsg(err?.message || err?.toString() || 'Execution failed during proof generation or transaction submit.');
    }
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
        margin: '0 auto',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        opacity: isConnected ? 1 : 0.6,
        pointerEvents: isConnected ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
      }}
    >
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#f3f4f6' }}>
        Circuit Call (storeMessage)
      </h2>

      {!isConnected && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#9ca3af', fontSize: '14px' }}>
          🔒 Please connect your Lace wallet first to enable circuit interactions.
        </div>
      )}

      {isConnected && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
              Contract Address (Preview Testnet)
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
              Secret Custom Message (Private Input)
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g. My secret message"
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
              }}
            />
            <div
              style={{
                fontSize: '11px',
                color: '#818cf8',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🔒 <strong>Proved without revealing your input</strong>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'executing' || !customMessage}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: status === 'executing' ? 'rgba(16, 185, 129, 0.5)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: status === 'executing' ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {status === 'executing' ? 'Executing Circuit...' : 'Execute storeMessage'}
          </button>

          {/* Stepper Status Indicators */}
          {status === 'executing' && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#a5b4fc' }}>
                  {progressStep}
                </div>
                <div style={{ fontSize: '12px', color: '#818cf8', fontFamily: 'monospace' }}>
                  {progressPercent}%
                </div>
              </div>
              <div style={{ height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: '#6366f1',
                    transition: 'width 0.4s ease-in-out',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px', lineHeight: 1.4 }}>
                ℹ️ <strong>Why does ZK Proving take ~15–30 seconds?</strong> Zero-Knowledge proofs require intense cryptographic curve operations to mathematically hide your input while verifying validity on-chain.
              </div>
            </div>
          )}

          {status === 'success' && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: '#34d399',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>✓ Transaction Submitted</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#a7f3d0' }}>
                The circuit was successfully executed and the proof was verified!
              </p>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Transaction ID:</div>
              <code
                style={{
                  display: 'block',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  padding: '8px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#ffffff',
                  wordBreak: 'break-all',
                }}
              >
                {txHash}
              </code>
            </div>
          )}

          {status === 'error' && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>❌ Execution Failed</h3>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.4 }}>{errorMsg}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

