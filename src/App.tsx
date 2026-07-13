import { useState } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import MergePDF from './pages/MergePDF';
import ImageToPDF from './pages/ImageToPDF';
import PDFToImage from './pages/PDFToImage';

export type Page = 'home' | 'merge' | 'image-to-pdf' | 'pdf-to-image';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'merge':
        return <MergePDF onNavigate={setCurrentPage} />;
      case 'image-to-pdf':
        return <ImageToPDF onNavigate={setCurrentPage} />;
      case 'pdf-to-image':
        return <PDFToImage onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
