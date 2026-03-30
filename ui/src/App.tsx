import React, { useState } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { Landing } from './components/Landing';
import { SellerPortal } from './components/SellerPortal';
import { BuyerPortal } from './components/BuyerPortal';
import './index.css';

function App() {
  const [view, setView] = useState<'landing' | 'buyer' | 'seller'>('landing');

  return (
    <>
      <ThemeToggle />
      <main>
        {view === 'landing' && <Landing onSelectRole={setView} />}
        {view === 'buyer' && <BuyerPortal onBack={() => setView('landing')} />}
        {view === 'seller' && <SellerPortal onBack={() => setView('landing')} />}
      </main>
    </>
  );
}

export default App;
