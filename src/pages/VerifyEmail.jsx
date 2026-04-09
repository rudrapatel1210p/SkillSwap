import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, RefreshCw, LogOut } from 'lucide-react';

const VerifyEmail = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If no user is logged in, or if they are already verified, redirect them
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.emailVerified) {
      if (localStorage.getItem('isOnboarding') === 'true') {
        localStorage.removeItem('isOnboarding');
        navigate('/profile?edit=true');
      } else {
        navigate('/explore');
      }
    }
  }, [currentUser, navigate]);

  const handleResend = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError(err.message || 'Failed to resend verification email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // To get the latest user token and emailVerified status, we need to reload the user
    if (currentUser) {
      setLoading(true);
      currentUser.reload().then(() => {
        if (currentUser.emailVerified) {
          if (localStorage.getItem('isOnboarding') === 'true') {
            localStorage.removeItem('isOnboarding');
            navigate('/profile?edit=true');
          } else {
            navigate('/explore');
          }
        } else {
          setError('Email is still not verified. Please check your inbox and click the link.');
        }
        setLoading(false);
      }).catch((err) => {
        setError('Failed to reload user state.');
        setLoading(false);
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      setError('Failed to log out.');
    }
  };

  return (
    <div className="animate-fade-in flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', background: 'var(--color-bg-start)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
          <Mail size={48} />
        </div>
        
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Verify Your Email</h2>
        
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          We've sent a verification email to <strong>{currentUser?.email}</strong>. 
          Please check your inbox (and spam folder) and click the verification link to access SkillSwap.
        </p>

        {message && (
          <div style={{ backgroundColor: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          <button 
            onClick={handleRefresh} 
            disabled={loading}
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem' }}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            I've Verified My Email
          </button>

          <button 
            onClick={handleResend} 
            disabled={loading}
            className="btn btn-outline" 
            style={{ padding: '0.875rem' }}
          >
            Resend Verification Email
          </button>
          
          <button 
            onClick={handleLogout} 
            className="text-btn" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--color-text-tertiary)' }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
