import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PlakaBildirPage } from './pages/PlakaBildirPage';
import { BulunanPlakalarPage } from './pages/BulunanPlakalarPage';
import { PlakaDetailPage } from './pages/PlakaDetailPage';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <NotificationProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/plaka-bildir" element={<PlakaBildirPage />} />
              <Route path="/bulunan-plakalar" element={<BulunanPlakalarPage />} />
              <Route path="/plaka/:id" element={<PlakaDetailPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
