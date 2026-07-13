import React, { useState } from 'react';
import type { Page } from '../App';
import FileDropzone from '../components/FileDropzone';
import { imagesToPDF } from '../utils/pdfUtils';
import { saveAs } from 'file-saver';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface ImageToPDFProps {
  onNavigate: (page: Page) => void;
}

const ImageToPDF: React.FC<ImageToPDFProps> = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const images = newFiles.filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...images]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newFiles = [...files];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      setFiles(newFiles);
    } else if (direction === 'down' && index < files.length - 1) {
      const newFiles = [...files];
      [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      setFiles(newFiles);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const pdfBytes = await imagesToPDF(files);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      saveAs(blob, 'images_converted.pdf');
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      alert('Failed to convert images to PDF. Make sure they are standard JPEG or PNG formats.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Image to PDF</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Convert your images to a single PDF document.</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <FileDropzone 
          onFilesSelected={handleFilesSelected} 
          accept="image/*" 
          label="Drag & drop images (JPG, PNG) here, or click to select" 
        />
      </div>

      {files.length > 0 && (
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1rem' }}>Selected Images ({files.length})</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                style={{ 
                  position: 'relative', 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '8px', 
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ position: 'absolute', top: '2px', right: '2px', display: 'flex', gap: '2px', zIndex: 10 }}>
                  <button onClick={() => removeFile(index)} style={{ background: 'var(--error-color)', color: 'white', borderRadius: '50%', padding: '2px' }}>
                    <X size={14} />
                  </button>
                </div>
                <ImageIcon size={32} color="var(--success-color)" style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }} />
                <span style={{ fontSize: '0.75rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                  {file.name}
                </span>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => moveFile(index, 'up')} disabled={index === 0} style={{ padding: '0 4px', fontSize: '0.8rem', color: index === 0 ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    ←
                  </button>
                  <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} style={{ padding: '0 4px', fontSize: '0.8rem', color: index === files.length - 1 ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn-primary" 
              onClick={handleConvert} 
              disabled={files.length === 0 || isProcessing}
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {isProcessing ? 'Converting...' : 'Convert to PDF'}
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageToPDF;
