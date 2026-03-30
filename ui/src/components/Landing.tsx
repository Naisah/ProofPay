import React from 'react';
import { Store, ShieldCheck, Wallet, ArrowRight, QrCode } from 'lucide-react';

interface LandingProps {
  onSelectRole: (role: 'buyer' | 'seller') => void;
}

export function Landing({ onSelectRole }: LandingProps) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div className="glass-pane" style={{ padding: '1rem', borderRadius: '50%', display: 'inline-block' }}>
            <ShieldCheck size={48} color="var(--accent-primary)" />
          </div>
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>ProofPay</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          Instantly verify bank and e-wallet transfers. Eliminate fake screenshot scams with the power of Stellar.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Seller Card */}
        <div 
          className="card" 
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
          onClick={() => onSelectRole('seller')}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '12px', marginRight: '1rem' }}>
              <Store size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ margin: 0 }}>I'm a Seller</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', flexGrow: 1 }}>
            Generate QR codes for your orders and verify buyer payments instantly in real-time.
          </p>
          <button className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            Open Portal <ArrowRight size={18} />
          </button>
        </div>

        {/* Buyer Card */}
        <div 
          className="card" 
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
          onClick={() => onSelectRole('buyer')}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', marginRight: '1rem' }}>
              <Wallet size={28} color="var(--accent-secondary)" />
            </div>
            <h2 style={{ margin: 0 }}>I'm a Buyer</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', flexGrow: 1 }}>
            Scan a store's QR code to securely initiate and confirm your payment on-chain.
          </p>
          <button className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            Open Portal <QrCode size={18} />
          </button>
        </div>
      </div>
      
      <footer style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>Built with Soroban & React for small merchants.</p>
      </footer>
    </div>
  );
}
