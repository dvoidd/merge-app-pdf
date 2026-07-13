import React from 'react';
import type { Page } from '../App';
import { FileText, ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  return (
    <>
      <header style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--surface-color)', padding: '1rem 0' }}>
        <div className="app-container" style={{ padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentPage !== 'home' && (
            <button className="btn-icon" onClick={() => onNavigate('home')} aria-label="Back to home">
              <ArrowLeft size={20} />
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => onNavigate('home')}>
            <div style={{ background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
              <FileText size={24} color="white" />
            </div>
            <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Pro PDF Utility</h1>
          </div>
        </div>
      </header>
      
      <main className="app-container">
        {children}
      </main>

      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
        <p>&copy; {new Date().getFullYear()} Pro PDF Utility. All processing is done locally.</p>
      </footer>
    </>
  );
};

export default Layout;
