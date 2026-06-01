const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/iserveu_chargebacks';
    const conn = await mongoose.connect(connString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.MOCK_MODE = false;
  } catch (error) {
    console.warn(`[WARN] MongoDB Connection Failed: ${error.message}`);
    console.warn(`[WARN] Falling back to IN-MEMORY MOCK MODE for Vercel demo!`);
    global.MOCK_MODE = true;
  }
};

module.exports = connectDB;
