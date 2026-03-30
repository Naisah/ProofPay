import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, Clock, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getPaymentStatus } from '../stellar';

export function SellerPortal({ onBack }: { onBack: () => void }) {
  const [orderId, setOrderId] = useState('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<'SETUP' | 'WAITING' | 'PENDING' | 'SETTLED'>('SETUP');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = () => {
    const val = Number(amountInput);
    if (!val || val <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 5; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    
    setOrderId(id);
    setAmount(val);
    setStatus('WAITING');
    setError('');
  };

  const resetOrder = () => {
    setOrderId('');
    setAmountInput('');
    setAmount(0);
    setStatus('SETUP');
    setError('');
  };

  const checkStatus = async () => {
    setIsRefreshing(true);
    setError('');
    try {
      const payment = await getPaymentStatus(orderId);
      if (payment) {
        setStatus(payment.status as any); // PENDING or SETTLED
      }
    } catch (e: any) {
      // Order not found on chain yet
      console.log('Order not yet initialized by buyer', e);
    }
    setIsRefreshing(false);
  };

  // Poll every 5s if waiting or pending
  useEffect(() => {
    if (status === 'SETTLED' || status === 'SETUP') return;
    
    const interval = setInterval(() => {
      checkStatus();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [status, orderId]);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="glass-pane" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Seller View</h2>

        {status === 'SETUP' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Enter the order amount to generate a ProofPay QR code. <br/><br/>
              (Note: For the hackathon demo, you can explain that this QR replaces the static GCash QR usually placed on the counter. The buyer scans it, and it links directly to your ProofPay account to confirm the transaction.)
            </p>
            
            {error && <div style={{ color: '#ef4444' }}>{error}</div>}
            
            <input 
              type="number" 
              placeholder="Amount Due (₱)" 
              className="input-field" 
              value={amountInput} 
              onChange={e => setAmountInput(e.target.value)}
              style={{ fontSize: '1.2rem', padding: '1rem', textAlign: 'center' }}
            />
            
            <button className="btn-primary" onClick={handleGenerate} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', padding: '1rem' }}>
              <QrCode size={20} /> Generate Payment QR
            </button>
          </div>
        )}

        {status !== 'SETUP' && (
          <div className="animate-fade-in">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Show this QR code to the buyer to initiate the payment for Order <strong>{orderId}</strong>.
            </p>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', display: 'inline-block', marginBottom: '2rem' }}>
              <QRCodeSVG value={JSON.stringify({ orderId, amount })} size={200} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Amount Due</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>₱ {amount.toLocaleString()}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Status:</span>
                
                {status === 'WAITING' && (
                  <span className="status-pending" style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    <Clock size={16} /> Scan to Pay
                  </span>
                )}

                {status === 'PENDING' && (
                  <span className="status-pending" style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    <RefreshCw size={16} className="animate-pulse-soft" /> On-chain: PENDING
                  </span>
                )}
                
                {status === 'SETTLED' && (
                  <span className="status-settled" style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    <CheckCircle size={16} /> On-chain: SETTLED
                  </span>
                )}
              </div>
              
              <button 
                onClick={checkStatus} 
                disabled={isRefreshing}
                className="btn-secondary" 
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-pulse-soft' : ''} />
                Refresh
              </button>
            </div>
            
            {status === 'SETTLED' && (
              <div className="animate-fade-in" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" onClick={resetOrder} style={{ width: '100%' }}>
                  Create Next Order
                </button>
              </div>
            )}
            {status === 'WAITING' && (
               <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
                  <button onClick={resetOrder} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Cancel & Edit Amount
                  </button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
