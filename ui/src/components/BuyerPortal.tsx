import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Check, ShieldAlert, CreditCard, Clock } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { createPayment, confirmPayment, getPaymentStatus, refundPayment } from '../stellar';

export function BuyerPortal({ onBack }: { onBack: () => void }) {
  const [orderId, setOrderId] = useState('');
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1 = Scan/Entry, 2 = Confirm & Create, 3 = Settle
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup scanner
  useEffect(() => {
    if (isScanning && step === 1) {
      const scanner = new Html5QrcodeScanner('reader', { fps: 30 }, false);
      scanner.render(
        (text) => {
          try {
            const data = JSON.parse(text);
            if (data.orderId && data.amount) {
              setOrderId(data.orderId);
              setAmount(data.amount);
              if (data.seller) setSellerId(data.seller);
              setIsScanning(false);
              scanner.clear();
              setStep(2);
            }
          } catch (e) {
            setError('Invalid QR Code format.');
          }
        },
        (err) => { /* ignore */ }
      );
      return () => { scanner.clear(); };
    }
  }, [isScanning, step]);

  const handleManualSubmit = () => {
    if (orderId && amount > 0) {
      setStep(2);
    } else {
      setError('Please provide Order ID and an Amount greater than 0.');
    }
  };

  const payOrder = async () => {
    setLoading(true);
    setError('');
    try {
      await createPayment(orderId, sellerId, BigInt(amount));
      setStep(3);
    } catch (e: any) {
      setError('Transaction failed: ' + e.message);
    }
    setLoading(false);
  };

  const confirmReceipt = async () => {
    setLoading(true);
    setError('');
    try {
      await confirmPayment(orderId);
      alert('Payment fully settled on-chain!');
      onBack();
    } catch (e: any) {
      setError('Confirmation failed: ' + e.message);
    }
    setLoading(false);
  };

  const cancelRefund = async () => {
    setLoading(true);
    setError('');
    try {
      await refundPayment(orderId);
      alert('Payment Intent officially Cancelled/Refunded on-chain!');
      onBack();
    } catch (e: any) {
      setError('Refund failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="glass-pane" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem', textAlign: 'center' }}>Buyer View</h2>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
              Scan the seller's QR code or enter the Order ID manually.
            </p>

            <button 
              className="btn-primary" 
              onClick={() => setIsScanning(!isScanning)}
              style={{ width: '100%', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Camera size={20} /> {isScanning ? 'Cancel Camera' : 'Scan QR Code'}
            </button>

            {isScanning && (
              <div id="reader" style={{ width: '100%', marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden', border: 'none' }}></div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--text-secondary)' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              <span style={{ padding: '0 1rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Order ID" 
                className="input-field" 
                value={orderId} 
                onChange={e => setOrderId(e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Amount (₱)" 
                className="input-field" 
                value={amount} 
                onChange={e => setAmount(Number(e.target.value))}
              />
              <button className="btn-secondary" onClick={handleManualSubmit}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
              <CreditCard size={48} color="var(--accent-primary)" />
            </div>
            
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Review Payment</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You are about to initiate a payment on Stellar.</p>
            
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
                <span style={{ fontWeight: '600' }}>{orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₱ {amount.toLocaleString()}</span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={payOrder} 
              disabled={loading}
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            >
              {loading ? 'Processing via Freighter...' : 'Send Payment (Creates PENDING status)'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
              <Clock size={48} color="var(--accent-pending)" />
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Payment Sent!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              The on-chain intent is recorded as PENDING. The seller should see this in their portal.
            </p>

            <div className="card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <strong>Demo Step:</strong> In reality, this settlement could be triggered by a bank webhook automatically (e.g. GCash API). Click below to simulate that the GCash transfer was received.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn-primary" 
                onClick={confirmReceipt} 
                disabled={loading}
                style={{ width: '100%', backgroundColor: 'var(--accent-secondary)', color: 'white' }}
              >
                {loading ? 'Confirming...' : 'Simulate GCash Receipt (Sets SETTLED)'}
              </button>

              <button 
                className="btn-secondary" 
                onClick={cancelRefund} 
                disabled={loading}
                style={{ width: '100%', color: '#ef4444' }}
              >
                {loading ? 'Processing...' : 'Cancel / Refund Intent (Sets REFUNDED)'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
