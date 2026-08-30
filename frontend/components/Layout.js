import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AIChatbot from './AIChatbot';

export default function Layout({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.body.classList.add('dark');
      localStorage.setItem('fh_dark', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('fh_dark', 'false');
    }
  };

  // Load configuration from local storage
  useEffect(() => {
    const localDark = localStorage.getItem('fh_dark') === 'true';
    setDarkMode(localDark);
    if (localDark) {
      document.body.classList.add('dark');
    }
    
    // Sync cart counts periodically
    const syncCart = () => {
      try {
        const storedCart = JSON.parse(localStorage.getItem('fh_cart') || '[]');
        setCartCount(storedCart.reduce((acc, curr) => acc + curr.quantity, 0));
      } catch (e) {}
    };
    syncCart();
    window.addEventListener('storage', syncCart);
    window.addEventListener('cart-updated', syncCart);
    
    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('cart-updated', syncCart);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} cartCount={cartCount} />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}
