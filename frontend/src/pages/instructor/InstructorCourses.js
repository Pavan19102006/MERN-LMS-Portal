import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('courseUpdated', (updatedCourse) => {
        setCourses(prev => prev.map(c => c._id === updatedCourse._id ? updatedCourse : c));
      });
    }
    return () => {
      if (socket) {
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

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '2rem' },
    title: { color: '#2d3748' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    card: { background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' },
    cardHeader: { background: '#3182ce', color: 'white', padding: '1rem' },
    cardBody: { padding: '1rem' },
    badge: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginLeft: '0.5rem' },
    error: { background: '#fed7d7', color: '#c53030', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Courses</h1>
        <p style={{ color: '#718096' }}>Courses assigned to you for instruction</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
          <p>No courses assigned to you yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {courses.map(course => (
            <div key={course._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{course.title}</h3>
                <span style={{ ...styles.badge, background: course.isPublished ? '#38a169' : '#718096', color: 'white' }}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div style={styles.cardBody}>
                <p style={{ color: '#718096', marginBottom: '0.5rem' }}>{course.description}</p>
                <p><strong>Category:</strong> {course.category}</p>
                <p><strong>Duration:</strong> {course.duration}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;
