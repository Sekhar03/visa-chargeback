const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  merchant: { type: String, required: true },
  type: { type: String, enum: ['Credit', 'Debit'], required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  remarks: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Ledger', ledgerSchema);
