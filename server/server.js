import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data folder exists for JSON Database Fallback
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const JSON_DB_PATH = path.join(DATA_DIR, 'submissions.json');

// Global Database Status Variable
let dbType = 'SQLite/JSON Fallback';
let isMongoConnected = false;

// ----------------------------------------------------
// MongoDB Setup (Mongoose schemas)
// ----------------------------------------------------
const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true, enum: ['Scholar', 'Mentor', 'Sponsor'] },
  govId: { type: String, unique: true, sparse: true }, // Sparse unique index to prevent duplicates for Scholars
  message: { type: String, required: true },
  linkedin: { type: String },
  github: { type: String },
  socialMedia: { type: String },
  status: { type: String, required: true, default: 'Pending', enum: ['Pending', 'Reviewed', 'Accepted', 'Declined'] },
  createdAt: { type: Date, default: Date.now }
});

const MongoSubmission = mongoose.model('Submission', submissionSchema);

// Admin Account Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const MongoAdmin = mongoose.model('Admin', adminSchema);

// ----------------------------------------------------
// JSON Fallback Database Helper Layer
// ----------------------------------------------------
const readJsonDB = () => {
  if (!fs.existsSync(JSON_DB_PATH)) {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify({ submissions: [], admins: [] }, null, 2));
  }
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB file, resetting database:', err);
    return { submissions: [], admins: [] };
  }
};

const writeJsonDB = (data) => {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
};

// Seed Fallback Admin
const seedJsonAdmin = async () => {
  const db = readJsonDB();
  const existingAdmin = db.admins.find(a => a.username === 'admin');
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    db.admins.push({
      _id: 'admin-static-id',
      username: 'admin',
      password: hashedPassword
    });
    writeJsonDB(db);
    console.log('[Fallback DB] Default Admin account seeded (username: admin, password: admin123)');
  }
};

// ----------------------------------------------------
// Database Selection and Connectivity
// ----------------------------------------------------
const connectDB = async () => {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shecan';
  console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
  try {
    // Attempt Mongoose connection with a short timeout to failover quickly
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000, 
    });
    isMongoConnected = true;
    dbType = 'MongoDB';
    console.log('💚 Successfully connected to MongoDB Database!');
    
    // Seed default admin in Mongo if not exists
    const adminCount = await MongoAdmin.countDocuments({ username: 'admin' });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await MongoAdmin.create({ username: 'admin', password: hashedPassword });
      console.log('[Mongo DB] Default Admin account seeded (username: admin, password: admin123)');
    }


  } catch (err) {
    console.warn('⚠️ MongoDB connection failed. Falling back to the robust Local JSON Database!');
    console.log(`Details: ${err.message}`);
    isMongoConnected = false;
    dbType = 'Local JSON File';
    await seedJsonAdmin();
  }
};

// Run connection
connectDB();

// ----------------------------------------------------
// Authentication Middleware
// ----------------------------------------------------
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized Access. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Forbidden. Invalid or expired token.' });
  }
};

// ----------------------------------------------------
// Core API Routes
// ----------------------------------------------------

// Server status & diagnostic endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    database: dbType,
    mongoConnected: isMongoConnected
  });
});

// POST /api/submissions - Public endpoint to submit application/contact form
app.post('/api/submissions', async (req, res) => {
  const { name, email, phone, role, message, govId, linkedin, github, socialMedia } = req.body;

  // Real-time server-side validations
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Name must be at least 2 characters.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
  }
  if (!phone || phone.trim().length < 5) {
    return res.status(400).json({ success: false, error: 'Phone number is required (minimum 5 characters).' });
  }
  if (!role || !['Scholar', 'Mentor', 'Sponsor'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Please choose a valid role (Scholar, Mentor, or Sponsor).' });
  }
  if (role === 'Scholar') {
    if (!govId || govId.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Government ID Number is required for Scholars (minimum 5 characters).' });
    }
  }
  if (!message || message.trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Message must be at least 10 characters long.' });
  }

  try {
    // Unique Check for Government ID (for Scholars)
    if (role === 'Scholar' && govId) {
      const cleanGovId = govId.trim().toUpperCase();
      if (isMongoConnected) {
        const existing = await MongoSubmission.findOne({ govId: cleanGovId });
        if (existing) {
          return res.status(400).json({ success: false, error: 'An application with this Government ID has already been submitted.' });
        }
      } else {
        const db = readJsonDB();
        const existing = db.submissions.find(s => s.role === 'Scholar' && s.govId && s.govId.trim().toUpperCase() === cleanGovId);
        if (existing) {
          return res.status(400).json({ success: false, error: 'An application with this Government ID has already been submitted.' });
        }
      }
    }

    let savedDoc;
    if (isMongoConnected) {
      // Save to MongoDB
      savedDoc = await MongoSubmission.create({ 
        name, 
        email, 
        phone,
        role, 
        message, 
        govId: role === 'Scholar' ? govId.trim().toUpperCase() : undefined,
        linkedin,
        github,
        socialMedia
      });
    } else {
      // Save to JSON Database
      const db = readJsonDB();
      savedDoc = {
        _id: `submission-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        email,
        phone,
        role,
        message,
        govId: role === 'Scholar' ? govId.trim().toUpperCase() : undefined,
        linkedin,
        github,
        socialMedia,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      db.submissions.unshift(savedDoc); // New submissions at start
      writeJsonDB(db);
    }

    res.status(201).json({
      success: true,
      message: 'Form Submitted Successfully',
      data: savedDoc
    });
  } catch (err) {
    console.error('Error saving submission:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
  }
});

// POST /api/admin/login - Secure Admin Login Route
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Please provide username and password.' });
  }

  try {
    let adminUser = null;

    if (isMongoConnected) {
      adminUser = await MongoAdmin.findOne({ username });
    } else {
      const db = readJsonDB();
      adminUser = db.admins.find(a => a.username === username);
    }

    if (!adminUser) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: adminUser._id, username: adminUser.username },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      success: true,
      message: 'Admin Authentication Successful',
      token,
      admin: { username: adminUser.username }
    });
  } catch (err) {
    console.error('Error logging in admin:', err);
    res.status(500).json({ success: false, error: 'Internal Server error.' });
  }
});

// GET /api/admin/submissions - Fetch all submissions (JWT Protected)
app.get('/api/admin/submissions', authenticateJWT, async (req, res) => {
  try {
    let submissions = [];
    if (isMongoConnected) {
      submissions = await MongoSubmission.find().sort({ createdAt: -1 });
    } else {
      const db = readJsonDB();
      submissions = db.submissions;
    }
    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve submissions.' });
  }
});

// PUT /api/admin/submissions/:id - Update submission status (JWT Protected)
app.put('/api/admin/submissions/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Pending', 'Reviewed', 'Accepted', 'Declined'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid application status.' });
  }

  try {
    let updatedDoc = null;
    if (isMongoConnected) {
      updatedDoc = await MongoSubmission.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );
    } else {
      const db = readJsonDB();
      const idx = db.submissions.findIndex(s => s._id === id);
      if (idx !== -1) {
        db.submissions[idx].status = status;
        updatedDoc = db.submissions[idx];
        writeJsonDB(db);
      }
    }

    if (!updatedDoc) {
      return res.status(404).json({ success: false, error: 'Submission not found.' });
    }

    res.json({
      success: true,
      message: `Status successfully updated to ${status}`,
      data: updatedDoc
    });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
});

// DELETE /api/admin/submissions/:id - Delete submission (JWT Protected)
app.delete('/api/admin/submissions/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    let deleted = false;
    if (isMongoConnected) {
      const result = await MongoSubmission.findByIdAndDelete(id);
      deleted = !!result;
    } else {
      const db = readJsonDB();
      const initialLength = db.submissions.length;
      db.submissions = db.submissions.filter(s => s._id !== id);
      if (db.submissions.length < initialLength) {
        deleted = true;
        writeJsonDB(db);
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Submission not found.' });
    }

    res.json({
      success: true,
      message: 'Submission successfully deleted.'
    });
  } catch (err) {
    console.error('Error deleting submission:', err);
    res.status(500).json({ success: false, error: 'Failed to delete submission.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 She Can Foundation Backend Server is active on port http://localhost:${PORT}`);
  console.log(`🔌 Database Mode: ${dbType}`);
});
