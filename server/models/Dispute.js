const mongoose = require('mongoose');
const disputeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  caseId: { type: String, required: true },
  userName: { type: String, default: 'masteruser' },
  userId: { type: String, default: '' },
  rrn: { type: String, required: true },
  txnId: { type: String, required: true },
  terminalId: { type: String, default: '' },
  createdDate: { type: String, required: true },
  txnDate: { type: String, required: true },
  respondByDate: { type: String, required: true },
  status: { type: String, required: true, default: 'DISPUTE_RECEIVED' },
  partnerId: { type: String, default: null },
  txnAmt: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  reasonCode: { type: String, default: '1' },
  product: { type: String, default: 'VISA' },
  assignedTo: { type: String, default: null },
  merchantResponseDeadline: { type: Date, default: null }
}, { timestamps: true });
module.exports = mongoose.model('Dispute', disputeSchema);