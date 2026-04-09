import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageCircle, Loader } from 'lucide-react';
import { MOCK_USERS } from '../data/users';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try Firestore first
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUser({ ...docSnap.data(), id: docSnap.id });
        } else {
          // Fallback to MOCK_USERS
          const mockUser = MOCK_USERS.find(u => String(u.id) === String(id));
          setUser(mockUser || null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '70vh' }}>
        <Loader className="animate-spin" size={48} color="var(--color-primary)" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>User Not Found</h2>
        <Link to="/explore" className="btn btn-primary">Back to Explore</Link>
      </div>
    );
  }

  const handleConnect = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
      navigate('/login');
      return;
    }

    try {
      // Check if a request already exists in Firestore
      const q = query(
        collection(db, 'requests'),
        where('senderId', '==', currentUser.id),
        where('receiverId', '==', user.id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert(`You've already sent a request to ${user.name}!`);
      } else {
        // Create new request in Firestore
        await addDoc(collection(db, 'requests'), {
          senderId: currentUser.id,
          senderName: currentUser.name,
          receiverId: user.id,
          skillWanted: user.skillsOffered[0] || 'Any skill',
          skillOffered: currentUser.skillsOffered[0] || 'Any skill',
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        alert(`Connection request sent to ${user.name}!`);
      }
    } catch (err) {
      console.error("Error connecting:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/explore" className="flex items-center gap-2" style={{ color: 'var(--color-primary)', fontWeight: '500', display: 'inline-flex' }}>
          <ArrowLeft size={18} /> Back to Explore
        </Link>
      </div>

      <div className="card">
        <div className="flex" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
          <div style={{ 
            width: '8rem', height: '8rem', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--color-bg-start)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary)', border: '2px solid var(--color-primary)',
            fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem'
          }}>
            {user.name.charAt(0)}
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{user.name}</h2>
          <p className="flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            <Calendar size={16} /> Available: {user.availability}
          </p>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary flex items-center gap-2" onClick={handleConnect}>
               Connect
            </button>
            <button className="btn btn-outline flex items-center gap-2" onClick={() => alert(`Message feature coming soon.`)}>
              <MessageCircle size={18} /> Message
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>About Me</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {user.bio}
          </p>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Can Teach</h3>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {user.skillsOffered.map(skill => (
                  <span key={skill} className="badge badge-purple" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{skill}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Wants to Learn</h3>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {user.skillsWanted.map(skill => (
                  <span key={skill} className="badge badge-blue" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
