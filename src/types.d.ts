declare module '@uziee/document-scanner' {
  import React from 'react';

  export interface DocumentScannerProps {
    onCapture: (images: string[]) => void;
    onClose?: () => void;
  }

  export const DocumentScanner: React.FC<DocumentScannerProps>;
}
