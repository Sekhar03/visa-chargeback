const mongoose = require('mongoose');
const arbitrationSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  arbitrationDate: { type: Date, default: Date.now },
  referenceNumber: { type: String, required: true },
  visaRemarks: { type: String, default: '' },
  feeAmount: { type: Number, default: 0 },
  decisionDate: { type: Date, default: null },
  winner: { type: String, default: null },
  loser: { type: String, default: null },
  liabilityParty: { type: String, default: null },
  decisionNotes: { type: String, default: null }
}, { timestamps: true });
module.exports = mongoose.model('Arbitration', arbitrationSchema);