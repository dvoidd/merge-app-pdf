import React from 'react';
import type { Page } from '../App';
import { FilePlus, Image as ImageIcon, Images, Camera, FileText } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in" style={{ paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          All-in-One PDF Tools
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Merge, convert, and extract PDF files seamlessly in your browser. Fast, secure, and 100% private.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Merge PDF Card */}
        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          onClick={() => onNavigate('merge')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <FilePlus size={48} color="var(--primary-color)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Merge PDF</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Combine multiple PDF files into one single document easily.</p>
        </div>

        {/* Image to PDF Card */}
        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          onClick={() => onNavigate('image-to-pdf')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <ImageIcon size={48} color="var(--success-color)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Image to PDF</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Convert your images (JPG, PNG) into a polished PDF file.</p>
        </div>

        {/* PDF to Image Card */}
        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          onClick={() => onNavigate('pdf-to-image')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Images size={48} color="var(--error-color)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>PDF to Image</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Extract pages from your PDF and save them as high-quality images.</p>
        </div>

        {/* Camera to PDF Card */}
        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          onClick={() => onNavigate('camera-to-pdf')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Camera size={48} color="#ec4899" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Camera to PDF</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Snap photos directly from your camera and convert them to PDF.</p>
        </div>

        {/* PDF to Word Card */}
        <div 
          className="glass-panel" 
          style={{ cursor: 'pointer', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          onClick={() => onNavigate('pdf-to-word')}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <FileText size={48} color="#fbbf24" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>PDF to Word</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Extract text from your PDF into an editable Word document.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
