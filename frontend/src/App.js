import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';

// Instructor Pages
import InstructorCourses from './pages/instructor/InstructorCourses';
import AssignmentManagement from './pages/instructor/AssignmentManagement';

// Student Pages
import AvailableCourses from './pages/student/AvailableCourses';
import EnrolledCourses from './pages/student/EnrolledCourses';
import StudentAssignments from './pages/student/StudentAssignments';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes - All roles */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute roles={['Admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute roles={['Admin']}>
                    <CourseManagement />
                  </ProtectedRoute>
                }
              />
              
              {/* Instructor Routes */}
              <Route
                path="/instructor/courses"
                element={
                  <ProtectedRoute roles={['Instructor']}>
                    <InstructorCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/assignments"
                element={
                  <ProtectedRoute roles={['Instructor']}>
                    <AssignmentManagement />
                  </ProtectedRoute>
                }
              />
              
              {/* Student Routes */}
              <Route
                path="/student/courses"
                element={
                  <ProtectedRoute roles={['Student']}>
                    <AvailableCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/enrolled"
                element={
                  <ProtectedRoute roles={['Student']}>
                    <EnrolledCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assignments"
                element={
                  <ProtectedRoute roles={['Student']}>
                    <StudentAssignments />
                  </ProtectedRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
