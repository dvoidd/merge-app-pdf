import React, { useState } from 'react';
import type { Page } from '../App';
import FileDropzone from '../components/FileDropzone';
import { mergePDFs } from '../utils/pdfUtils';
import { saveAs } from 'file-saver';
import { File as FileIcon, X, Loader2 } from 'lucide-react';

interface MergePDFProps {
  onNavigate: (page: Page) => void;
}

const MergePDF: React.FC<MergePDFProps> = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const pdfs = newFiles
      .filter(f => f.type === 'application/pdf')
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setFiles(prev => [...prev, ...pdfs]);
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

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    setIsProcessing(true);
    try {
      const mergedPdfBytes = await mergePDFs(files);
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      saveAs(blob, 'merged_document.pdf');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Merge PDF</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Combine multiple PDF files into one. Drag to reorder.</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <FileDropzone 
          onFilesSelected={handleFilesSelected} 
          accept="application/pdf" 
          label="Drag & drop PDF files here, or click to select" 
        />
      </div>

      {files.length > 0 && (
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1rem' }}>Selected Files ({files.length})</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--border-color)', borderRadius: '12px' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                  <FileIcon size={24} color="var(--primary-color)" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => moveFile(index, 'up')} disabled={index === 0} style={{ padding: '0.25rem', color: index === 0 ? 'var(--text-secondary)' : 'var(--text-primary)', opacity: index === 0 ? 0.3 : 1 }}>
                    ↑
                  </button>
                  <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} style={{ padding: '0.25rem', color: index === files.length - 1 ? 'var(--text-secondary)' : 'var(--text-primary)', opacity: index === files.length - 1 ? 0.3 : 1 }}>
                    ↓
                  </button>
                  <button onClick={() => removeFile(index)} className="btn-icon" style={{ width: '2rem', height: '2rem' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn-primary" 
              onClick={handleMerge} 
              disabled={files.length < 2 || isProcessing}
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {isProcessing ? 'Merging...' : 'Merge PDFs'}
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

export default MergePDF;
