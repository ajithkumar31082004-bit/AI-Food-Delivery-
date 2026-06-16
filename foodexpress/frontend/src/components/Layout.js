import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';

export default function Layout({ children, showAI = true }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {showAI && <AIChatbot />}
    </div>
  );
}
