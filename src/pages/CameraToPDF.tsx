import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Page } from '../App';
import { Camera, Download, Loader2, Trash2, SlidersHorizontal } from 'lucide-react';
import { imagesToPDF } from '../utils/pdfUtils';
import { saveAs } from 'file-saver';

interface CameraToPDFProps {
  onNavigate: (page: Page) => void;
}

interface CapturedImage {
  id: string;
  url: string;
}

type FilterType = 'normal' | 'cerahkan';

const CameraToPDF: React.FC<CameraToPDFProps> = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('normal');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please make sure you have granted permission.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Handle attaching stream to video element when it mounts/updates
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    }
    
    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        const newImage: CapturedImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: imageUrl
        };
        
        setImages(prev => [...prev, newImage]);
      }
    }
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

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
          return new File([blob], `capture-${index + 1}.jpg`, { type: 'image/jpeg' });
        })
      );

      const pdfBytes = await imagesToPDF(processedFiles);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      saveAs(blob, `Camera_Capture_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error('Error creating PDF:', err);
      alert('Failed to create PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Camera to PDF</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Take photos with your camera and convert them to PDF.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {!stream ? (
            <button className="btn-primary" onClick={startCamera} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
              <Camera style={{ marginRight: '0.5rem' }} /> Start Camera
            </button>
          ) : (
            <>
              <div style={{ position: 'relative', width: '100%', maxWidth: '500px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }}
                />
              </div>
              
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" onClick={handleCapture} style={{ background: '#10b981', padding: '1rem 2rem', fontSize: '1.2rem' }}>
                  <Camera style={{ marginRight: '0.5rem' }} /> Capture Photo
                </button>
                <button className="btn-secondary" onClick={stopCamera} style={{ padding: '1rem 2rem' }}>
                  Stop Camera
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Captured Images ({images.length})</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background-color)', padding: '0.5rem', borderRadius: '8px' }}>
              <SlidersHorizontal size={16} color="var(--text-secondary)" />
              <select 
                value={activeFilter} 
                onChange={(e) => setActiveFilter(e.target.value as FilterType)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="normal">Original</option>
                <option value="cerahkan">Cerahkan</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {images.map((img) => (
              <div key={img.id} style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img 
                  src={img.url} 
                  alt="Captured" 
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
              <><Download style={{ marginRight: '0.5rem' }} /> Create PDF</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraToPDF;
