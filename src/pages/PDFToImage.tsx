import React, { useState } from 'react';
import type { Page } from '../App';
import FileDropzone from '../components/FileDropzone';
import { extractImagesFromPDF } from '../utils/pdfUtils';
import type { PDFImageExtract } from '../utils/pdfUtils';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Download, Loader2 } from 'lucide-react';

interface PDFToImageProps {
  onNavigate: (page: Page) => void;
}

const PDFToImage: React.FC<PDFToImageProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<PDFImageExtract[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = async (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf');
    if (pdfs.length > 0) {
      const selectedPdf = pdfs[0];
      setFile(selectedPdf);
      setImages([]); // clear previous
      
      setIsProcessing(true);
      try {
        const extracted = await extractImagesFromPDF(selectedPdf);
        setImages(extracted);
      } catch (error) {
        console.error('Error extracting images:', error);
        alert('Failed to extract images from PDF.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const downloadImage = (image: PDFImageExtract) => {
    saveAs(image.blob, `page_${image.pageNumber}.png`);
  };

  const downloadAll = async () => {
    if (images.length === 0) return;
    
    const zip = new JSZip();
    
    images.forEach(img => {
      zip.file(`page_${img.pageNumber}.png`, img.blob);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${file?.name.replace('.pdf', '') || 'pdf'}_images.zip`);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>PDF to Image</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Extract all pages from a PDF as high-quality images.</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <FileDropzone 
          onFilesSelected={handleFilesSelected} 
          accept="application/pdf" 
          multiple={false}
          label="Drag & drop a PDF file here, or click to select" 
        />
      </div>

      {isProcessing && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={48} className="animate-spin" style={{ animation: 'spin 1s linear infinite', margin: '0 auto', color: 'var(--primary-color)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Extracting pages, please wait...</p>
        </div>
      )}

      {images.length > 0 && !isProcessing && (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Extracted Pages ({images.length})</h3>
            <button className="btn-primary" onClick={downloadAll}>
              <Download size={18} />
              Download All (ZIP)
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {images.map((img) => (
              <div 
                key={`page-${img.pageNumber}`} 
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '12px', 
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ width: '100%', height: '250px', background: '#fff', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={img.dataUrl} alt={`Page ${img.pageNumber}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Page {img.pageNumber}</span>
                  <button onClick={() => downloadImage(img)} className="btn-icon" title="Download Image">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
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

export default PDFToImage;
