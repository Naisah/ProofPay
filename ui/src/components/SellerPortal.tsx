import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, Clock, QrCode, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { getPaymentStatus, connectWallet } from '../stellar';

type OrderCache = { id: string; amount: number; status: string; date: string }[];

export function SellerPortal({ onBack }: { onBack: () => void }) {
  const { width, height } = useWindowSize();
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<'SETUP' | 'WAITING' | 'PENDING' | 'SETTLED' | 'REFUNDED'>('SETUP');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const [recentOrders, setRecentOrders] = useState<OrderCache>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('proofpay_orders');
    if (saved) {
      setRecentOrders(JSON.parse(saved));
    }
    // Connect wallet on load to get seller public key for QR
    connectWallet().then(address => {
        if (address) setSellerId(address);
    });
  }, []);

  const saveOrderToHistory = (id: string, amt: number, newStatus: string) => {
    setRecentOrders(prev => {
      const idx = prev.findIndex(o => o.id === id);
      let updated = [...prev];
      if (idx >= 0) {
        updated[idx].status = newStatus;
      } else {
        updated.unshift({ id, amount: amt, status: newStatus, date: new Date().toLocaleString() });
      }
      updated = updated.slice(0, 5); // Keep last 5
      localStorage.setItem('proofpay_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleGenerate = () => {
    const val = Number(amountInput);
    if (!val || val <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!sellerId) {
      setError('Please allow Freighter wallet connection first so we can securely map payments to you.');
      return;
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 5; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    
    setOrderId(id);
    setAmount(val);
    setStatus('WAITING');
    setError('');
    setShowConfetti(false);
    
    saveOrderToHistory(id, val, 'WAITING');
  };

  const resetOrder = () => {
    setOrderId('');
    setAmountInput('');
    setAmount(0);
    setStatus('SETUP');
    setError('');
    setShowConfetti(false);
  };

  const checkStatus = async () => {
    setIsRefreshing(true);
    setError('');
    try {
      const payment = await getPaymentStatus(orderId);
      if (payment) {
        const newStatus = payment.status as any;
        if (status !== 'SETTLED' && newStatus === 'SETTLED') {
           setShowConfetti(true);
           setTimeout(() => setShowConfetti(false), 5000); // 5 sec confetti
        }
        setStatus(newStatus);
        saveOrderToHistory(orderId, amount, newStatus);
      }
    } catch (e: any) {
      console.log('Order not yet initialized by buyer', e);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (status === 'SETTLED' || status === 'SETUP' || status === 'REFUNDED') return;
    const interval = setInterval(() => {
      checkStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [status, orderId]);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="glass-pane" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Seller View</h2>

        {status === 'SETUP' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Enter the order amount to generate a ProofPay QR code.
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

            {recentOrders.length > 0 && (
               <div style={{ marginTop: '3rem', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                 <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Recent Orders</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {recentOrders.map(o => (
                      <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.9rem' }}>
                         <div>
                           <span style={{ fontWeight: 'bold' }}>{o.id}</span>
                           <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>₱{o.amount.toLocaleString()}</span>
                         </div>
                         <div style={{
                            color: o.status === 'SETTLED' ? '#10b981' : o.status === 'REFUNDED' ? '#ef4444' : '#f59e0b',
                            fontWeight: 'bold'
                         }}>
                            {o.status}
                         </div>
                      </div>
                   ))}
                 </div>
               </div>
            )}
          </div>
        )}

        {status !== 'SETUP' && (
          <div className="animate-fade-in">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Show this QR code to the buyer to initiate the payment for Order <strong>{orderId}</strong>.
            </p>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', display: 'inline-block', marginBottom: '2rem' }}>
              <QRCodeSVG value={JSON.stringify({ orderId, amount, seller: sellerId })} size={200} />
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

                {status === 'REFUNDED' && (
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <AlertTriangle size={16} /> REFUNDED/CANCELLED
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
            
            {(status === 'SETTLED' || status === 'REFUNDED') && (
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
