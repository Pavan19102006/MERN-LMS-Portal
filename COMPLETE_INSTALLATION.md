# MERN LMS Portal - Complete Installation & Code Guide
## Run This Project in 15 Minutes

---

## PART 1: QUICK SETUP (Terminal Commands)

### Step 1: Create Project Structure
```bash
cd ~/Desktop
mkdir mern-lms && cd mern-lms
mkdir server client
cd server && npm init -y
```

### Step 2: Backend Setup
```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors
npm install -D nodemon
```

### Step 3: Create .env file in server/
```bash
touch .env
```
Add:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-lms
JWT_SECRET=mern_lms_secret_key_123
NODE_ENV=development
```

### Step 4: Frontend Setup
```bash
cd ../client
npx create-react-app .
npm install axios react-router-dom
```

---

## PART 2: Complete Backend Code Files

### Create server/server.js

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const instructorRoutes = require('./routes/instructor');
const studentRoutes = require('./routes/student');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/student', studentRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Create server/models/User.js

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['ADMIN', 'INSTRUCTOR', 'STUDENT'],
    default: 'STUDENT'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
```

### Continue reading on GitHub...
