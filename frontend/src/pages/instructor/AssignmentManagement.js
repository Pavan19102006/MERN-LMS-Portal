import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AssignmentManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    totalPoints: 100
  });
  const [error, setError] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('assignmentCreated', (newAssignment) => {
        setAssignments(prev => [...prev, newAssignment]);
      });
      socket.on('assignmentUpdated', (updatedAssignment) => {
        setAssignments(prev => prev.map(a => a._id === updatedAssignment._id ? updatedAssignment : a));
      });
      socket.on('submissionCreated', (newSubmission) => {
        setSubmissions(prev => [...prev, newSubmission]);
      });
    }
    return () => {
      if (socket) {
        socket.off('assignmentCreated');
        socket.off('assignmentUpdated');
        socket.off('submissionCreated');
      }
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      const [assignmentsRes, coursesRes, submissionsRes] = await Promise.all([
        axios.get(`${API_URL}/assignments`),
        axios.get(`${API_URL}/courses`),
        axios.get(`${API_URL}/submissions`)
      ]);
      setAssignments(assignmentsRes.data);
      setCourses(coursesRes.data);
      setSubmissions(submissionsRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/assignments`, formData);
      setShowModal(false);
      setFormData({ title: '', description: '', course: '', dueDate: '', totalPoints: 100 });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/submissions/${selectedSubmission._id}/grade`, gradeData);
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setGradeData({ grade: '', feedback: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to grade submission');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`${API_URL}/assignments/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete assignment');
      }
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({ grade: submission.grade || '', feedback: submission.feedback || '' });
    setShowGradeModal(true);
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    title: { color: '#2d3748' },
    button: { background: '#4fd1c5', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' },
    section: { marginBottom: '2rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    card: { background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' },
    cardHeader: { background: '#3182ce', color: 'white', padding: '1rem' },
    cardBody: { padding: '1rem' },
    cardFooter: { padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    th: { background: '#3182ce', color: 'white', padding: '1rem', textAlign: 'left' },
    td: { padding: '1rem', borderBottom: '1px solid #e2e8f0' },
    deleteBtn: { background: '#e53e3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
    gradeBtn: { background: '#38a169', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' },
    inputGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', color: '#4a5568' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px' },
    select: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px' },
    textarea: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '100px' },
    error: { background: '#fed7d7', color: '#c53030', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
    closeBtn: { background: '#718096', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem' },
    badge: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Graded': return { background: '#38a169', color: 'white' };
      case 'Returned': return { background: '#3182ce', color: 'white' };
      default: return { background: '#ed8936', color: 'white' };
    }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Assignment Management</h1>
        <button style={styles.button} onClick={() => setShowModal(true)}>+ Create Assignment</button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.section}>
        <h2 style={{ marginBottom: '1rem' }}>My Assignments</h2>
        {assignments.length === 0 ? (
          <p style={{ color: '#718096' }}>No assignments created yet.</p>
        ) : (
          <div style={styles.grid}>
            {assignments.map(assignment => (
              <div key={assignment._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3>{assignment.title}</h3>
                </div>
                <div style={styles.cardBody}>
                  <p style={{ color: '#718096', marginBottom: '0.5rem' }}>{assignment.description}</p>
                  <p><strong>Course:</strong> {assignment.course?.title}</p>
                  <p><strong>Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>
                  <p><strong>Points:</strong> {assignment.totalPoints}</p>
                </div>
                <div style={styles.cardFooter}>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(assignment._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={{ marginBottom: '1rem' }}>Student Submissions</h2>
        {submissions.length === 0 ? (
          <p style={{ color: '#718096' }}>No submissions yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Assignment</th>
                <th style={styles.th}>Submitted At</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Grade</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(submission => (
                <tr key={submission._id}>
                  <td style={styles.td}>{submission.student?.name}</td>
                  <td style={styles.td}>{submission.assignment?.title}</td>
                  <td style={styles.td}>{new Date(submission.submittedAt).toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...getStatusColor(submission.status) }}>
                      {submission.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {submission.grade !== undefined ? `${submission.grade}/${submission.assignment?.totalPoints}` : '-'}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.gradeBtn} onClick={() => openGradeModal(submission)}>
                      {submission.status === 'Submitted' ? 'Grade' : 'Update Grade'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: '1rem' }}>Create New Assignment</h2>
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
                <label style={styles.label}>Course</label>
                <select style={styles.select} value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} required>
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Due Date</label>
                <input type="datetime-local" style={styles.input} value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Total Points</label>
                <input type="number" style={styles.input} value={formData.totalPoints} onChange={(e) => setFormData({...formData, totalPoints: parseInt(e.target.value, 10) || 0})} required min="1" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={styles.button}>Create</button>
                <button type="button" style={styles.closeBtn} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGradeModal && selectedSubmission && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: '1rem' }}>Grade Submission</h2>
            <p><strong>Student:</strong> {selectedSubmission.student?.name}</p>
            <p><strong>Assignment:</strong> {selectedSubmission.assignment?.title}</p>
            <p style={{ marginBottom: '1rem' }}><strong>Submission:</strong> {selectedSubmission.content}</p>
            <form onSubmit={handleGrade}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Grade (out of {selectedSubmission.assignment?.totalPoints})</label>
                <input type="number" style={styles.input} value={gradeData.grade} onChange={(e) => setGradeData({...gradeData, grade: e.target.value})} required min="0" max={selectedSubmission.assignment?.totalPoints} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Feedback</label>
                <textarea style={styles.textarea} value={gradeData.feedback} onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={styles.button}>Submit Grade</button>
                <button type="button" style={styles.closeBtn} onClick={() => setShowGradeModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;
