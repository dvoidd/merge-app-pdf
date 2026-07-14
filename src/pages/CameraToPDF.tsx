import React, { useRef, useState, useEffect } from 'react';
import type { Page } from '../App';
import { Camera, Download, Loader2, Trash2 } from 'lucide-react';
import { imagesToPDF } from '../utils/pdfUtils';
import { saveAs } from 'file-saver';

interface CameraToPDFProps {
  onNavigate: (page: Page) => void;
}

const CameraToPDF: React.FC<CameraToPDFProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Try to default to environment (rear) camera
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err: any) {
      setError(`Failed to access camera: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    // Clean up camera on unmount
    return () => {
      stopCamera();
    };
  }, [stream]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video source
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to JPG
      canvas.toBlob((blob) => {
        if (blob) {
          const timestamp = new Date().getTime();
          const file = new File([blob], `capture_${timestamp}.jpg`, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);
          
          setImages(prev => [...prev, file]);
          setPreviews(prev => [...prev, previewUrl]);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const pdfBytes = await imagesToPDF(images);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      saveAs(blob, 'camera-scans.pdf');
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Camera to PDF</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Scan documents with your camera and convert them to a PDF.</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
        
        {/* Camera Viewfinder */}
        <div style={{ 
          width: '100%', 
          maxWidth: '500px', 
          aspectRatio: '3/4', 
          background: 'rgba(0,0,0,0.5)', 
          borderRadius: '12px', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {stream ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              <Camera size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>Camera is currently off</p>
            </div>
          )}
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {error && (
          <div style={{ color: 'var(--error-color)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', width: '100%' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {!stream ? (
            <button className="btn-primary" onClick={startCamera}>
              <Camera size={20} />
              Start Camera
            </button>
          ) : (
            <>
              <button className="btn-primary" onClick={takePhoto} style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}>
                <Camera size={20} />
                Capture Photo
              </button>
              <button className="btn-secondary" onClick={stopCamera}>
                Stop Camera
              </button>
            </>
          )}
        </div>
      </div>

      {previews.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Captured Pages ({previews.length})</span>
            
            <button 
              className="btn-primary" 
              onClick={generatePDF} 
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
              {isProcessing ? 'Processing...' : 'Download PDF'}
            </button>
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
            {previews.map((preview, index) => (
              <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '3/4', background: 'rgba(0,0,0,0.2)' }}>
                <img 
                  src={preview} 
                  alt={`Capture ${index + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
