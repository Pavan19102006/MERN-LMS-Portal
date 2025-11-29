import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EnrolledCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('enrollmentCreated', (newEnrollment) => {
        setEnrollments(prev => [...prev, newEnrollment]);
      });
    }
    return () => {
      if (socket) {
        socket.off('enrollmentCreated');
      }
    };
  }, [socket]);

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses/enrolled/my`);
      setEnrollments(response.data);
    } catch (err) {
      setError('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '2rem' },
    title: { color: '#2d3748' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    card: { background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' },
    cardHeader: { background: '#3182ce', color: 'white', padding: '1rem' },
    cardBody: { padding: '1rem' },
    progressBar: { height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' },
    progressFill: { height: '100%', background: '#4fd1c5', transition: 'width 0.3s' },
    badge: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' },
    error: { background: '#fed7d7', color: '#c53030', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return { background: '#38a169', color: 'white' };
      case 'Dropped': return { background: '#e53e3e', color: 'white' };
      default: return { background: '#3182ce', color: 'white' };
    }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Enrolled Courses</h1>
        <p style={{ color: '#718096' }}>Track your learning progress</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {enrollments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
          <p>You haven't enrolled in any courses yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {enrollments.map(enrollment => (
            <div key={enrollment._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{enrollment.course?.title}</h3>
                <span style={{ ...styles.badge, ...getStatusColor(enrollment.status) }}>
                  {enrollment.status}
                </span>
              </div>
              <div style={styles.cardBody}>
                <p style={{ color: '#718096', marginBottom: '0.5rem' }}>{enrollment.course?.description}</p>
                <p><strong>Instructor:</strong> {enrollment.course?.instructor?.name}</p>
                <p><strong>Enrolled:</strong> {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Progress</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${enrollment.progress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
