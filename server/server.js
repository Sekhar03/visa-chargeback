const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// MOCK_MODE Interceptor for Vercel Demo
app.use((req, res, next) => {
  if (global.MOCK_MODE && req.method === 'GET') {
    if (req.path === '/api/users' || req.path === '/api/users/') {
      return res.json([
        { username: 'Test@isu', password: 'Test@2026', role: 'merchant', name: 'masteruser', walletBalance: 964.35 },
        { username: 'masteruser', password: 'Test@2026', role: 'merchant', name: 'masteruser', walletBalance: 964.35 },
        { username: 'Test@Ad', password: 'Test@2027', role: 'admin', name: 'Krishna Das', walletBalance: 245800.00 },
        { username: 'partneruser', password: 'Test@2028', role: 'partner', name: 'Arjun Mehta (Partner)', walletBalance: 0.00 }
      ]);
    }
    if (req.path.startsWith('/api/users/')) {
       // mock single user
       return res.json({ username: 'masteruser', password: 'Test@2026', role: 'merchant', name: 'masteruser', walletBalance: 964.35 });
    }
    if (req.path === '/api/disputes' || req.path === '/api/disputes/') {
      const auth = require('./routes/auth');
      return res.json(auth.buildSeedData(new Date()));
    }
    if (req.path === '/api/ledger' || req.path === '/api/ledger/') {
      const TODAY = new Date();
      const fmtDate = d => d.toISOString().split('T')[0];
      const dA = n => { let d = new Date(TODAY); d.setDate(d.getDate() - n); return fmtDate(d); };
      return res.json([
        { id: 'ADJ001', merchant: 'masteruser', type: 'Credit', amount: 8500, date: dA(10), remarks: 'Chargeback Won — CB007 VISA dispute reversal credited' },
        { id: 'ADJ002', merchant: 'masteruser', type: 'Credit', amount: 4200, date: dA(6), remarks: 'Chargeback Won — CB008 Rupay dispute reversal credited' },
        { id: 'ADJ003', merchant: 'masteruser', type: 'Debit', amount: 1500, date: dA(10), remarks: 'Chargeback Lost — CB003 debit adjustment applied' },
        { id: 'ADJ004', merchant: 'masteruser', type: 'Debit', amount: 6700, date: dA(15), remarks: 'Chargeback Lost — CB014 Mastercard ruling debit' },
        { id: 'ADJ005', merchant: 'masteruser', type: 'Credit', amount: 3300, date: dA(4), remarks: 'Chargeback Won — CB017 VISA dispute won, credit applied' },
        { id: 'ADJ006', merchant: 'masteruser', type: 'Debit', amount: 500, date: dA(5), remarks: 'Processing fee — chargeback dispute handling fee Q1' },
        { id: 'ADJ007', merchant: 'masteruser', type: 'Credit', amount: 2000, date: dA(2), remarks: 'Manual credit adjustment — goodwill reversal by admin' },
        { id: 'ADJ008', merchant: 'masteruser', type: 'Debit', amount: 350, date: dA(1), remarks: 'Platform fee deduction — May 2026' }
      ]);
    }
  }
  
  if (global.MOCK_MODE && req.method === 'POST') {
     return res.json({ message: 'Success (Mock Mode)' });
  }

  next();
});

// Mount routers
app.use('/api/users', require('./routes/auth'));
app.use('/api/disputes', require('./routes/disputes'));
app.use('/api/ledger', require('./routes/ledger'));

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;