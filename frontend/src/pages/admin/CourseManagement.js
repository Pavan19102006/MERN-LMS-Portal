import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: '',
    duration: 'Self-paced',
    isPublished: false
  });
  const [error, setError] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('courseCreated', (newCourse) => {
        setCourses(prev => [...prev, newCourse]);
      });
      socket.on('courseUpdated', (updatedCourse) => {
        setCourses(prev => prev.map(c => c._id === updatedCourse._id ? updatedCourse : c));
      });
      socket.on('courseDeleted', (courseId) => {
        setCourses(prev => prev.filter(c => c._id !== courseId));
      });
    }
    return () => {
      if (socket) {
        socket.off('courseCreated');
        socket.off('courseUpdated');
        socket.off('courseDeleted');
      }
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      const [coursesRes, instructorsRes] = await Promise.all([
        axios.get(`${API_URL}/courses`),
        axios.get(`${API_URL}/users/role/instructors`)
      ]);
      setCourses(coursesRes.data);
      setInstructors(instructorsRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/courses`, formData);
      setShowModal(false);
      setFormData({ title: '', description: '', instructor: '', category: '', duration: 'Self-paced', isPublished: false });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`${API_URL}/courses/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete course');
      }
    }
  };

  const togglePublish = async (course) => {
    try {
      await axios.put(`${API_URL}/courses/${course._id}`, { isPublished: !course.isPublished });
      fetchData();
    } catch (err) {
      setError('Failed to update course');
    }
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    title: { color: '#2d3748' },
    button: { background: '#4fd1c5', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    card: { background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' },
    cardHeader: { background: '#4fd1c5', color: 'white', padding: '1rem' },
    cardBody: { padding: '1rem' },
    cardFooter: { padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' },
    badge: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' },
    deleteBtn: { background: '#e53e3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
    publishBtn: { background: '#38a169', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
    unpublishBtn: { background: '#718096', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' },
    inputGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', color: '#4a5568' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px' },
    select: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px' },
    textarea: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '100px' },
    error: { background: '#fed7d7', color: '#c53030', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
    closeBtn: { background: '#718096', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem' }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Course Management</h1>
        <button style={styles.button} onClick={() => setShowModal(true)}>+ Create Course</button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

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
              <p><strong>Instructor:</strong> {course.instructor?.name || 'Not assigned'}</p>
              <p><strong>Category:</strong> {course.category}</p>
              <p><strong>Duration:</strong> {course.duration}</p>
            </div>
            <div style={styles.cardFooter}>
              <button 
                style={course.isPublished ? styles.unpublishBtn : styles.publishBtn} 
                onClick={() => togglePublish(course)}
              >
                {course.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(course._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: '1rem' }}>Create New Course</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Title</label>
                <input style={styles.input} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea style={styles.textarea} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Instructor</label>
                <select style={styles.select} value={formData.instructor} onChange={(e) => setFormData({...formData, instructor: e.target.value})} required>
                  <option value="">Select Instructor</option>
                  {instructors.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <input style={styles.input} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Duration</label>
                <input style={styles.input} value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({...formData, isPublished: e.target.checked})} />
                  Publish immediately
                </label>
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

export default CourseManagement;
