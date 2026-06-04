const mongoose = require('mongoose');
const preArbitrationSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  receivedAt: { type: Date, default: Date.now },
  visaRemarks: { type: String, default: '' },
  merchantResponse: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  respondedAt: { type: Date, default: null }
}, { timestamps: true });
module.exports = mongoose.model('PreArbitration', preArbitrationSchema);