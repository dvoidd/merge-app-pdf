import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onFilesSelected, 
  accept, 
  multiple = true,
  label = "Drag & drop files here, or click to select"
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = (files: File[]) => {
    // Basic filter by accept if needed, but standard input handles it on click.
    // We pass them to parent
    onFilesSelected(files);
  };

  return (
    <div 
      className={`dropzone ${isDragActive ? 'active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <UploadCloud size={48} className="dropzone-icon" />
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>{label}</p>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept={accept} 
        multiple={multiple} 
        style={{ display: 'none' }} 
      />
    </div>
  );
};

export default FileDropzone;
