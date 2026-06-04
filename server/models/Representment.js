const mongoose = require('mongoose');
const representmentSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  submittedBy: { type: String, required: true },
  status: { type: String, default: 'SUBMITTED' },
  visaReference: { type: String, default: null }
}, { timestamps: true });
module.exports = mongoose.model('Representment', representmentSchema);