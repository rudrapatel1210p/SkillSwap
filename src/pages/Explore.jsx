import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import { MOCK_USERS } from '../data/users';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const realUsers = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUser.id) {
            realUsers.push({ ...doc.data(), id: doc.id, isRealUser: true });
          }
        });

        const realUserEmails = realUsers.map(u => u.email);
        const mockUsers = MOCK_USERS.filter(u => !realUserEmails.includes(u.email));
        setAllUsers([...realUsers, ...mockUsers]);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser.id]);

  const filteredUsers = allUsers.filter(user => {
    const term = searchTerm.toLowerCase();
    const matchesName = user.name.toLowerCase().includes(term);
    const offeredSkills = user.skillsOffered || [];
    const wantedSkills = user.skillsWanted || [];
    const matchesOffered = offeredSkills.some(skill => skill.toLowerCase().includes(term));
    const matchesWanted = wantedSkills.some(skill => skill.toLowerCase().includes(term));
    return matchesName || matchesOffered || matchesWanted;
  });

  const handleConnect = async (user) => {
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
        setConnectionMessage(`You've already sent a request to ${user.name}!`);
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

        setConnectionMessage(`Connection request sent to ${user.name}!`);
      }
    } catch (err) {
      console.error("Error connecting:", err);
      setConnectionMessage("Something went wrong. Please try again.");
    }

    setTimeout(() => setConnectionMessage(null), 3000);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Explore Skills</h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Find students who have the skills you want to learn, and who want to learn what you have to offer.
        </p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
          <Search size={20} />
        </div>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Search for skills, topics, or people..." 
          style={{ paddingLeft: '3rem', paddingRight: '1rem', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {connectionMessage && (
        <div className="animate-fade-in" style={{ 
          backgroundColor: 'var(--color-success)', color: 'white', padding: '1rem', 
          borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          {connectionMessage}
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0' }}>
            <Loader className="animate-spin" size={48} color="var(--color-primary)" />
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserCard key={user.id} user={user} onConnect={handleConnect} />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
            No users found matching "{searchTerm}". Try another term!
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
