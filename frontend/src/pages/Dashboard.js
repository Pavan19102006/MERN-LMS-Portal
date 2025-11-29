import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
  const { user, isAdmin, isInstructor, isStudent } = useAuth();
  const { connected } = useSocket();

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      color: '#2d3748',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#718096'
    },
    connectionStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: connected ? '#c6f6d5' : '#fed7d7',
      color: connected ? '#276749' : '#c53030',
      borderRadius: '20px',
      fontSize: '0.875rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem'
    },
    card: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    cardTitle: {
      color: '#2d3748',
      marginBottom: '0.5rem'
    },
    cardContent: {
      color: '#718096'
    },
    welcomeCard: {
      background: 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)',
      color: 'white',
      padding: '2rem',
      borderRadius: '12px',
      marginBottom: '2rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.welcomeCard}>
        <h1>Welcome, {user?.name}!</h1>
        <p>You are logged in as {user?.role}</p>
        <div style={{ marginTop: '1rem' }}>
          <span style={styles.connectionStatus}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: connected ? '#276749' : '#c53030'
            }}></span>
            {connected ? 'Real-time connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div style={styles.header}>
        <h2 style={styles.title}>Dashboard</h2>
        <p style={styles.subtitle}>Quick overview of your LMS activities</p>
      </div>

      <div style={styles.grid}>
        {isAdmin && (
          <>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>👥 User Management</h3>
              <p style={styles.cardContent}>Create and manage users - Admins, Instructors, and Students</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📚 Course Management</h3>
              <p style={styles.cardContent}>Create and assign courses to instructors</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📊 System Overview</h3>
              <p style={styles.cardContent}>Monitor system activity and statistics</p>
            </div>
          </>
        )}

        {isInstructor && (
          <>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📚 My Courses</h3>
              <p style={styles.cardContent}>View and manage your assigned courses</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📝 Assignments</h3>
              <p style={styles.cardContent}>Create and manage course assignments</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>✅ Submissions</h3>
              <p style={styles.cardContent}>Review and grade student submissions</p>
            </div>
          </>
        )}

        {isStudent && (
          <>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📚 Available Courses</h3>
              <p style={styles.cardContent}>Browse and enroll in available courses</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🎓 My Enrollments</h3>
              <p style={styles.cardContent}>View your enrolled courses and progress</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📝 Assignments</h3>
              <p style={styles.cardContent}>View and submit course assignments</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
