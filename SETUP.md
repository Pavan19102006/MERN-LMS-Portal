# MERN LMS Portal - Complete Setup & Installation Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js v14+ & npm installed
- MongoDB running locally or MongoDB Atlas account
- macOS Terminal

### Step 1: Create Project Structure
```bash
cd ~/Desktop
mkdir mern-lms && cd mern-lms
mkdir server client
cd server && npm init -y
```

### Step 2: Install Backend Dependencies
```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors axios
npm install -D nodemon
```

### Step 3: Create Backend Files
Create `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-lms
JWT_SECRET=your_secret_key_here_change_in_production
NODE_ENV=development
```

### Step 4: Setup Frontend
```bash
cd ../client
npx create-react-app .
npm install axios react-router-dom
```

### Step 5: Run Both Servers
```bash
# Terminal 1: Backend
cd server
npm install
npm start

# Terminal 2: Frontend  
cd client
npm start
```

## Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Demo Credentials
```
Admin:
email: admin@lms.com
password: admin123

Instructor:
email: instructor@lms.com
password: instructor123

Student:
email: student@lms.com
password: student123
```
