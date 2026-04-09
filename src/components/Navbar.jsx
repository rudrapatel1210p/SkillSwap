import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import LogoIcon from './Logo';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial state from document element
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container flex items-center justify-between" style={{ height: '70px' }}>
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LogoIcon isDark={isDarkMode} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary)' }}>SkillSwap</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', margin: 0 }}>Learn. Teach. Grow Together</p>
          </div>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Home</Link>
          <Link to="/explore" style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Explore</Link>
          
          <button 
            onClick={toggleTheme} 
            className="flex items-center justify-center"
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-full)', 
              padding: '0.5rem', 
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {currentUser ? (
            <div className="flex gap-4">
              <Link to="/profile" className="btn btn-outline">Profile</Link>
              <button 
                className="btn btn-primary" 
                onClick={async () => {
                  await signOut(auth);
                  localStorage.removeItem('isAuthenticated');
                  localStorage.removeItem('currentUser');
                  navigate('/');
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
