// Simple backend server for serving static files and health checks
// All authentication is now handled by Supabase directly

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require('@supabase/supabase-js');

// Import route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orgRoutes = require('./routes/orgRoutes');
const memberAvailabilityRoutes = require('./routes/member-availability');
const softrAuthRoutes = require('./routes/softrAuth');
const emailInvitationRoutes = require('./routes/emailInvitations');

const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for backend

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required Supabase environment variables:');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '❌ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '❌ Missing');
  console.error('\n📝 Please add these to your .env file:');
  console.error('   SUPABASE_URL=https://your-project-id.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
// Top of server.js, before routes
const allowedOrigins = [
  "https://softrcalendar.netlify.app",
  "https://schedulehq-saas.onrender.com/api/auth/softr",
  "https://schedulehq-saas.onrender.com/api/email/send-invitation",
  "http://localhost:5173",
  "https://burton15253.softr.app"
];

// Apply CORS before any routes
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle OPTIONS preflights globally
app.options("*", cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Use route files
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/create', orgRoutes);
app.use('/api', memberAvailabilityRoutes);
app.use('/api', softrAuthRoutes);
app.use('/api/email', emailInvitationRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// API endpoint to verify Supabase connection (optional)
app.get("/api/config", (req, res) => {
  res.json({
    supabase: {
      url: process.env.SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_ANON_KEY
    }
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Authentication handled by Supabase`);
});
