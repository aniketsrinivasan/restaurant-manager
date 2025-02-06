import React, { useEffect } from 'react';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeContextProvider } from './theme/ThemeContext';
import Header from './components/layout/Header';
import LoadingBar from './components/common/LoadingBar';
import Reservations from './pages/Reservations';

// Route change observer component
const RouteChangeObserver = ({ setLoading }) => {
  const location = useLocation();
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location, setLoading]);
  return null;
};

// Main app content
const AppContent = () => {
  const [loading, setLoading] = React.useState(false);

  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '*': {
            transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
          },
        }}
      />
      <Router>
        <LoadingBar loading={loading} />
        <RouteChangeObserver setLoading={setLoading} />
        <Header />
        <Routes>
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/" element={<Reservations />} />
        </Routes>
      </Router>
    </>
  );
};

function App() {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
}

export default App;