import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [error, setError] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('userCreated', (newUser) => {
        setUsers(prev => [...prev, newUser]);
      });
      socket.on('userUpdated', (updatedUser) => {
        setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
      });
      socket.on('userDeleted', (userId) => {
        setUsers(prev => prev.filter(u => u._id !== userId));
      });
    }
    return () => {
      if (socket) {
        socket.off('userCreated');
        socket.off('userUpdated');
        socket.off('userDeleted');
      }
    };
  }, [socket]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/users`, formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'Student' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/users/${id}`);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    title: { color: '#2d3748' },
    button: { background: '#4fd1c5', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    th: { background: '#4fd1c5', color: 'white', padding: '1rem', textAlign: 'left' },
    td: { padding: '1rem', borderBottom: '1px solid #e2e8f0' },
    deleteBtn: { background: '#e53e3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' },
    inputGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', color: '#4a5568' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px' },
    select: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px' },
    error: { background: '#fed7d7', color: '#c53030', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
    roleBadge: { padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' },
    closeBtn: { background: '#718096', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem' }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'Admin': return { background: '#e53e3e', color: 'white' };
      case 'Instructor': return { background: '#3182ce', color: 'white' };
      default: return { background: '#38a169', color: 'white' };
    }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
        <button style={styles.button} onClick={() => setShowModal(true)}>+ Create User</button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Created At</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td style={styles.td}>{user.name}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>
                <span style={{ ...styles.roleBadge, ...getRoleColor(user.role) }}>{user.role}</span>
              </td>
              <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td style={styles.td}>
                <button style={styles.deleteBtn} onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: '1rem' }}>Create New User</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Name</label>
                <input style={styles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input type="email" style={styles.input} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input type="password" style={styles.input} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required minLength={6} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Role</label>
                <select style={styles.select} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={styles.button}>Create</button>
                <button type="button" style={styles.closeBtn} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
