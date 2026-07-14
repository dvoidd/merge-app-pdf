import React, { useState } from 'react';
import type { Page } from '../App';
import FileDropzone from '../components/FileDropzone';
import { extractTextFromPDF } from '../utils/pdfUtils';
import { saveAs } from 'file-saver';
import { Download, Loader2 } from 'lucide-react';

interface PDFToWordProps {
  onNavigate: (page: Page) => void;
}

const PDFToWord: React.FC<PDFToWordProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf');
    if (pdfs.length > 0) {
      const selectedPdf = pdfs[0];
      setFile(selectedPdf);
      setDocxBlob(null);
      setError(null);
      
      setIsProcessing(true);
      try {
        const wordBlob = await extractTextFromPDF(selectedPdf);
        setDocxBlob(wordBlob);
      } catch (err: any) {
        console.error('Error extracting text:', err);
        setError('Failed to extract text and convert to Word document.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const downloadWord = () => {
    if (docxBlob && file) {
      saveAs(docxBlob, `${file.name.replace('.pdf', '')}.docx`);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>PDF to Word</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Extract text from your PDF into an editable Word document.</p>
        
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem', fontSize: '0.9rem', textAlign: 'left' }}>
          <strong>Note:</strong> Since this runs entirely in your browser without a server, this basic conversion extracts <strong>pure text</strong>. Complex layouts, tables, and images will not be preserved perfectly.
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <FileDropzone 
          onFilesSelected={handleFilesSelected} 
          accept="application/pdf" 
          multiple={false}
          label="Drag & drop a PDF file here, or click to select" 
        />
      </div>

      {error && (
        <div style={{ color: 'var(--error-color)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {isProcessing && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={48} className="animate-spin" style={{ animation: 'spin 1s linear infinite', margin: '0 auto', color: 'var(--primary-color)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Extracting text and building Word document...</p>
        </div>
      )}

      {docxBlob && !isProcessing && (
        <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--success-color)' }}>Conversion Complete!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Your PDF has been successfully converted to an editable Word document.
          </p>
          <button className="btn-primary" onClick={downloadWord} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            <Download size={24} />
            Download Word Document
          </button>
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

export default PDFToWord;
