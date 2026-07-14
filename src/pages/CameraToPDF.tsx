import React, { useState } from 'react';
import type { Page } from '../App';
import { Download, Loader2, Trash2, SlidersHorizontal, Maximize } from 'lucide-react';
import { imagesToPDF } from '../utils/pdfUtils';
import { saveAs } from 'file-saver';
// @ts-ignore
import DocumentScanner from '@uziee/document-scanner';

interface CameraToPDFProps {
  onNavigate: (page: Page) => void;
}

interface CapturedImage {
  id: string;
  url: string;
}

type FilterType = 'normal' | 'cerahkan';

const CameraToPDF: React.FC<CameraToPDFProps> = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('cerahkan'); // Default ke cerah karena ini scan dokumen

  const handleCapture = (scannedImages: string[]) => {
    // scannedImages is an array of base64 strings
    if (scannedImages && scannedImages.length > 0) {
      const newImages = scannedImages.map(url => ({
        id: Math.random().toString(36).substr(2, 9),
        url
      }));
      setImages(prev => [...prev, ...newImages]);
    }
    setShowScanner(false);
  };

  const handleClose = () => {
    setShowScanner(false);
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  // Canvas processing for filters before generating PDF
  const processImageWithFilter = (dataUrl: string, filter: FilterType): Promise<string> => {
    return new Promise((resolve) => {
      if (filter === 'normal') {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          if (filter === 'cerahkan') {
            ctx.filter = 'brightness(120%) contrast(110%)';
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    });
  };

  const handleCreatePDF = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    try {
      const processedFiles = await Promise.all(
        images.map(async (img, index) => {
          const filteredDataUrl = await processImageWithFilter(img.url, activeFilter);
          const res = await fetch(filteredDataUrl);
          const blob = await res.blob();
          return new File([blob], `scan-${index + 1}.jpg`, { type: 'image/jpeg' });
        })
      );

      const pdfBytes = await imagesToPDF(processedFiles);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      saveAs(blob, `Scanned_Document_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Failed to create PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showScanner) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#000' }}>
        <DocumentScanner 
          onCapture={handleCapture} 
          onClose={handleClose} 
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Smart Scanner to PDF</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Scan documents automatically using your camera.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <button className="btn-primary" onClick={() => setShowScanner(true)} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
          <Maximize style={{ marginRight: '0.5rem' }} /> Buka Scanner Otomatis
        </button>
      </div>

      {images.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Scanned Images ({images.length})</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background-color)', padding: '0.5rem', borderRadius: '8px' }}>
              <SlidersHorizontal size={16} color="var(--text-secondary)" />
              <select 
                value={activeFilter} 
                onChange={(e) => setActiveFilter(e.target.value as FilterType)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="normal">Original</option>
                <option value="cerahkan">Cerahkan Dokumen</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {images.map((img) => (
              <div key={img.id} style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img 
                  src={img.url} 
                  alt="Scanned" 
                  style={{ 
                    width: '100%', height: '100%', objectFit: 'cover',
                    filter: activeFilter === 'cerahkan' ? 'brightness(120%) contrast(110%)' : 'none'
                  }} 
                />
                <button
                  onClick={() => removeImage(img.id)}
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'rgba(239, 68, 68, 0.9)', color: 'white',
                    border: 'none', borderRadius: '50%', padding: '0.5rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onClick={handleCreatePDF}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <><Loader2 className="animate-spin" style={{ marginRight: '0.5rem' }} /> Processing...</>
            ) : (
              <><Download style={{ marginRight: '0.5rem' }} /> Download PDF</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraToPDF;
