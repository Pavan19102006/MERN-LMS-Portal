import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AvailableCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('courseCreated', (newCourse) => {
        if (newCourse.isPublished) {
          setCourses(prev => [...prev, newCourse]);
        }
      });
      socket.on('courseUpdated', (updatedCourse) => {
        if (updatedCourse.isPublished) {
          setCourses(prev => {
            const exists = prev.find(c => c._id === updatedCourse._id);
            if (exists) {
              return prev.map(c => c._id === updatedCourse._id ? updatedCourse : c);
            }
            return [...prev, updatedCourse];
          });
        } else {
          setCourses(prev => prev.filter(c => c._id !== updatedCourse._id));
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('courseCreated');
        socket.off('courseUpdated');
      }
    };
  }, [socket]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`${API_URL}/courses/${courseId}/enroll`);
      setSuccessMessage('Successfully enrolled in the course!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll');
      setTimeout(() => setError(''), 3000);
    }
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '2rem' },
    title: { color: '#2d3748' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    card: { background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' },
    cardHeader: { background: '#38a169', color: 'white', padding: '1rem' },
    cardBody: { padding: '1rem' },
    cardFooter: { padding: '1rem', borderTop: '1px solid #e2e8f0' },
    enrollBtn: { width: '100%', background: '#4fd1c5', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' },
    error: { background: '#fed7d7', color: '#c53030', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
    success: { background: '#c6f6d5', color: '#276749', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Available Courses</h1>
        <p style={{ color: '#718096' }}>Browse and enroll in available courses</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {successMessage && <div style={styles.success}>{successMessage}</div>}

      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
          <p>No courses available at the moment.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {courses.map(course => (
            <div key={course._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{course.title}</h3>
              </div>
              <div style={styles.cardBody}>
                <p style={{ color: '#718096', marginBottom: '0.5rem' }}>{course.description}</p>
                <p><strong>Instructor:</strong> {course.instructor?.name}</p>
                <p><strong>Category:</strong> {course.category}</p>
                <p><strong>Duration:</strong> {course.duration}</p>
              </div>
              <div style={styles.cardFooter}>
                <button style={styles.enrollBtn} onClick={() => handleEnroll(course._id)}>
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableCourses;
