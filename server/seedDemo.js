/**
 * Run from server folder: node seedDemo.js
 * Loads users, chargebacks (~40 cases), and ledger entries into MongoDB.
 */
require('dotenv').config();
const connectDB = require('./config/db');
const { seedAllDemoData } = require('./seed/demoData');

(async () => {
  await connectDB();
  const counts = await seedAllDemoData();
  console.log('Demo data loaded:', counts);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
