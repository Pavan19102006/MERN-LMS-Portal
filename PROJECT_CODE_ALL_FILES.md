# MERN LMS - Complete Project Code

## Quick Run Commands

```bash
# Terminal 1 - Backend
cd ~/Desktop/mern-lms/server
npm install
npm start

# Terminal 2 - Frontend  
cd ~/Desktop/mern-lms/client
npm start
```

## Demo Credentials
- Admin: admin@lms.com / admin123
- Instructor: instructor@lms.com / instructor123
- Student: student@lms.com / student123

---

## Backend Files Setup

### server/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-lms
JWT_SECRET=lms_secret_key
NODE_ENV=development
```

### server/server.js
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/instructor', require('./routes/instructor'));
app.use('/api/student', require('./routes/student'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```
