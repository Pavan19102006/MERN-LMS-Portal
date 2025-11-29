import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('assignmentCreated', (newAssignment) => {
        setAssignments(prev => [...prev, newAssignment]);
      });
      socket.on('submissionGraded', (gradedSubmission) => {
        setSubmissions(prev => prev.map(s => s._id === gradedSubmission._id ? gradedSubmission : s));
      });
    }
    return () => {
      if (socket) {
        socket.off('assignmentCreated');
        socket.off('submissionGraded');
      }
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        axios.get(`${API_URL}/assignments`),
        axios.get(`${API_URL}/submissions/my/all`)
      ]);
      setAssignments(assignmentsRes.data);
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
      await axios.post(`${API_URL}/submissions`, {
        assignment: selectedAssignment._id,
        content
      });
      setShowModal(false);
      setSelectedAssignment(null);
      setContent('');
      setSuccessMessage('Assignment submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowModal(true);
  };

  const getSubmission = (assignmentId) => {
    return submissions.find(s => s.assignment?._id === assignmentId);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '2rem' },
    title: { color: '#2d3748' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' },
    card: { background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' },
    cardHeader: { padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardBody: { padding: '1rem', borderTop: '1px solid #e2e8f0' },
    cardFooter: { padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    submitBtn: { background: '#4fd1c5', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' },
    disabledBtn: { background: '#cbd5e0', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'not-allowed' },
    badge: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' },
    inputGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', color: '#4a5568' },
    textarea: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '150px' },
    error: { background: '#fed7d7', color: '#c53030', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
    success: { background: '#c6f6d5', color: '#276749', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
    closeBtn: { background: '#718096', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem' },
    gradeBox: { background: '#f7fafc', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Graded': return { background: '#38a169', color: 'white' };
      case 'Submitted': return { background: '#ed8936', color: 'white' };
      default: return { background: '#718096', color: 'white' };
    }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Assignments</h1>
        <p style={{ color: '#718096' }}>View and submit course assignments</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {successMessage && <div style={styles.success}>{successMessage}</div>}

      {assignments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
          <p>No assignments available.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {assignments.map(assignment => {
            const submission = getSubmission(assignment._id);
            const overdue = isOverdue(assignment.dueDate);

            return (
              <div key={assignment._id} style={styles.card}>
                <div style={{ ...styles.cardHeader, background: overdue && !submission ? '#fed7d7' : '#f7fafc' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem' }}>{assignment.title}</h3>
                    <span style={{ fontSize: '0.875rem', color: '#718096' }}>{assignment.course?.title}</span>
                  </div>
                  {submission && (
                    <span style={{ ...styles.badge, ...getStatusColor(submission.status) }}>
                      {submission.status}
                    </span>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <p style={{ color: '#718096', marginBottom: '1rem' }}>{assignment.description}</p>
                  <p><strong>Due:</strong> {new Date(assignment.dueDate).toLocaleString()}</p>
                  <p><strong>Points:</strong> {assignment.totalPoints}</p>
                  <p><strong>Instructor:</strong> {assignment.instructor?.name}</p>
                  
                  {submission && submission.status === 'Graded' && (
                    <div style={styles.gradeBox}>
                      <p><strong>Your Grade:</strong> {submission.grade}/{assignment.totalPoints}</p>
                      {submission.feedback && (
                        <p style={{ marginTop: '0.5rem' }}><strong>Feedback:</strong> {submission.feedback}</p>
                      )}
                    </div>
                  )}
                </div>
                <div style={styles.cardFooter}>
                  {overdue && !submission ? (
                    <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>Overdue</span>
                  ) : submission ? (
                    <span style={{ color: '#718096' }}>Submitted on {new Date(submission.submittedAt).toLocaleString()}</span>
                  ) : (
                    <span style={{ color: '#718096' }}>Not submitted</span>
                  )}
                  
                  {!submission && !overdue && (
                    <button style={styles.submitBtn} onClick={() => openSubmitModal(assignment)}>
                      Submit
                    </button>
                  )}
                  {!submission && overdue && (
                    <button style={styles.disabledBtn} disabled>
                      Past Due
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && selectedAssignment && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: '1rem' }}>Submit Assignment</h2>
            <p><strong>Assignment:</strong> {selectedAssignment.title}</p>
            <p style={{ marginBottom: '1rem' }}><strong>Points:</strong> {selectedAssignment.totalPoints}</p>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Your Answer/Submission</label>
                <textarea 
                  style={styles.textarea} 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Enter your submission content here..."
                  required 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={styles.submitBtn}>Submit</button>
                <button type="button" style={styles.closeBtn} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
