# MERN LMS Portal

A complete Learning Management System built with the MERN stack (MongoDB, Express, React, Node.js) featuring role-based access control for Admins, Instructors, and Students.

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based middleware (Admin, Instructor, Student)
- Protected routes based on user roles

### Admin Features
- Create and manage users (Admin, Instructor, Student)
- Create and manage courses
- Assign instructors to courses
- Publish/unpublish courses

### Instructor Features
- View assigned courses
- Create and manage assignments
- Grade student submissions
- Provide feedback on submissions

### Student Features
- Browse available courses
- Enroll in courses
- View enrolled courses and progress
- Submit assignments
- View grades and feedback

### Real-time Features
- Socket.io integration for real-time updates
- Live notifications for new courses, assignments, and grades

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Socket.io-client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), bcryptjs

## Project Structure

```
MERN-LMS-Portal/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── middleware/
│   │   └── auth.js            # JWT & role-based auth middleware
│   ├── models/
│   │   ├── User.js            # User schema (Admin/Instructor/Student)
│   │   ├── Course.js          # Course schema
│   │   ├── Enrollment.js      # Enrollment schema
│   │   ├── Assignment.js      # Assignment schema
│   │   └── Submission.js      # Submission schema
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User management routes
│   │   ├── courses.js         # Course management routes
│   │   ├── assignments.js     # Assignment management routes
│   │   └── submissions.js     # Submission management routes
│   ├── server.js              # Express server with Socket.io
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── admin/
│   │   │   │   ├── UserManagement.js
│   │   │   │   └── CourseManagement.js
│   │   │   ├── instructor/
│   │   │   │   ├── InstructorCourses.js
│   │   │   │   └── AssignmentManagement.js
│   │   │   └── student/
│   │   │       ├── AvailableCourses.js
│   │   │       ├── EnrolledCourses.js
│   │   │       └── StudentAssignments.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .gitignore
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern-lms
   JWT_SECRET=your_secure_jwt_secret_key
   FRONTEND_URL=http://localhost:3000
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/role/instructors` - Get all instructors

### Courses
- `GET /api/courses` - Get all courses (filtered by role)
- `POST /api/courses` - Create a new course (Admin only)
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course (Admin/Instructor)
- `DELETE /api/courses/:id` - Delete course (Admin only)
- `POST /api/courses/:id/enroll` - Enroll in a course (Student only)
- `GET /api/courses/enrolled/my` - Get enrolled courses (Student only)

### Assignments
- `GET /api/assignments` - Get all assignments (filtered by role)
- `POST /api/assignments` - Create assignment (Instructor/Admin)
- `GET /api/assignments/:id` - Get assignment by ID
- `PUT /api/assignments/:id` - Update assignment (Instructor/Admin)
- `DELETE /api/assignments/:id` - Delete assignment (Instructor/Admin)
- `GET /api/assignments/course/:courseId` - Get assignments for a course

### Submissions
- `GET /api/submissions` - Get all submissions (filtered by role)
- `POST /api/submissions` - Submit assignment (Student only)
- `GET /api/submissions/:id` - Get submission by ID
- `PUT /api/submissions/:id` - Update submission (Student only)
- `PUT /api/submissions/:id/grade` - Grade submission (Instructor/Admin)
- `GET /api/submissions/assignment/:assignmentId` - Get submissions for an assignment
- `GET /api/submissions/my/all` - Get current student's submissions

## Usage

### First-Time Setup
1. Register the first user with the role "Admin" - this will create the admin account
2. Subsequent registrations will default to "Student" role
3. Admin can create Instructor and Student accounts

### Workflow
1. **Admin**: Creates instructors and courses, assigns courses to instructors
2. **Instructor**: Creates assignments for their courses, grades submissions
3. **Student**: Enrolls in courses, completes assignments, receives grades

## License

MIT License