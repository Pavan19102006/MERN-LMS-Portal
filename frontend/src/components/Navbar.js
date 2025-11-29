import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isInstructor, isStudent } = useAuth();

  const styles = {
    nav: {
      background: '#1a1a2e',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#4fd1c5',
      textDecoration: 'none'
    },
    links: {
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'center'
    },
    link: {
      color: 'white',
      textDecoration: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      transition: 'background 0.3s'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    role: {
      background: '#4fd1c5',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      color: '#1a1a2e'
    },
    logoutBtn: {
      background: '#e53e3e',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>LMS Portal</Link>
      
      {user ? (
        <div style={styles.links}>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          
          {isAdmin && (
            <>
              <Link to="/admin/users" style={styles.link}>Users</Link>
              <Link to="/admin/courses" style={styles.link}>Courses</Link>
            </>
          )}
          
          {isInstructor && (
            <>
              <Link to="/instructor/courses" style={styles.link}>My Courses</Link>
              <Link to="/instructor/assignments" style={styles.link}>Assignments</Link>
            </>
          )}
          
          {isStudent && (
            <>
              <Link to="/student/courses" style={styles.link}>Available Courses</Link>
              <Link to="/student/enrolled" style={styles.link}>My Courses</Link>
              <Link to="/student/assignments" style={styles.link}>Assignments</Link>
            </>
          )}
          
          <div style={styles.userInfo}>
            <span>{user.name}</span>
            <span style={styles.role}>{user.role}</span>
            <button style={styles.logoutBtn} onClick={logout}>Logout</button>
          </div>
        </div>
      ) : (
        <div style={styles.links}>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/register" style={styles.link}>Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
