import React, { useState } from 'react';
import type { Page } from '../App';
import { Camera, Download, Loader2, Trash2, SlidersHorizontal } from 'lucide-react';
import { imagesToPDF } from '../utils/pdfUtils';
import { saveAs } from 'file-saver';
import { DocumentScanner } from '@uziee/document-scanner';

interface CameraToPDFProps {
  onNavigate: (page: Page) => void;
}

const applyFilterToFile = async (dataUrl: string, mode: 'normal' | 'cerahkan', index: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not found'));

      if (mode === 'cerahkan') {
        ctx.filter = 'brightness(1.2) contrast(1.1)';
      } else {
        ctx.filter = 'none';
      }
      
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], `scan_${index}.jpg`, { type: 'image/jpeg' }));
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.9);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

const CameraToPDF: React.FC<CameraToPDFProps> = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scans, setScans] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<'normal' | 'cerahkan'>('normal');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (images: string[]) => {
    setScans(prev => [...prev, ...images]);
    setShowScanner(false);
  };

  const handleClose = () => {
    setShowScanner(false);
  };

  const removeImage = (index: number) => {
    setScans(prev => prev.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    if (scans.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Process images with current filter
      const filesToProcess = await Promise.all(
        scans.map((dataUrl, index) => applyFilterToFile(dataUrl, filterMode, index))
      );
      
      const pdfBytes = await imagesToPDF(filesToProcess);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, 'camera-scans.pdf');
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  // If scanner is active, render it full screen
  if (showScanner) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, background: 'black' }}>
        <DocumentScanner onCapture={handleCapture} onClose={handleClose} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Camera to PDF</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Otomatis scan tepi dokumen dan ubah menjadi PDF.</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
        {error && (
          <div style={{ color: 'var(--error-color)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', width: '100%' }}>
            {error}
          </div>
        )}

        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
          <Camera size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>Mulai pemindaian dokumen cerdas. Arahkan kamera ke kertas dan aplikasi akan secara otomatis mendeteksi serta memotong (crop) tepinya.</p>
        </div>

        <button className="btn-primary" onClick={() => setShowScanner(true)}>
          <Camera size={20} />
          Mulai Scanner
        </button>
      </div>

      {scans.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}>
              <span>Dokumen Tersimpan ({scans.length})</span>
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Filter Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px' }}>
                <div style={{ padding: '0 0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SlidersHorizontal size={16} /> Filter:
                </div>
                <button 
                  onClick={() => setFilterMode('normal')}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '6px', 
                    border: 'none',
                    cursor: 'pointer',
                    background: filterMode === 'normal' ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: filterMode === 'normal' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  Normal
                </button>
                <button 
                  onClick={() => setFilterMode('cerahkan')}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '6px', 
                    border: 'none',
                    cursor: 'pointer',
                    background: filterMode === 'cerahkan' ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: filterMode === 'cerahkan' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  Cerahkan
                </button>
              </div>

              <button 
                className="btn-primary" 
                onClick={generatePDF} 
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                {isProcessing ? 'Memproses...' : 'Download PDF'}
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {scans.map((scan, index) => (
              <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '3/4', background: 'rgba(0,0,0,0.2)' }}>
                <img 
                  src={scan} 
                  alt={`Scan ${index + 1}`} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    filter: filterMode === 'cerahkan' ? 'brightness(1.2) contrast(1.1)' : 'none',
                    transition: 'filter 0.3s ease'
                  }}
                />
                <button 
                  className="btn-icon" 
                  onClick={() => removeImage(index)}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '2rem', height: '2rem', background: 'rgba(0,0,0,0.5)', border: 'none' }}
                >
                  <Trash2 size={16} />
                </button>
                <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.7)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraToPDF;
