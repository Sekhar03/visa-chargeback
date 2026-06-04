const mongoose = require('mongoose');
const settlementSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  originalAmount: { type: Number, required: true },
  chargebackAmount: { type: Number, required: true },
  adjustmentAmount: { type: Number, required: true },
  status: { type: String, enum: ['SETTLEMENT_PENDING', 'SETTLEMENT_COMPLETED'], default: 'SETTLEMENT_PENDING' },
  settlementDate: { type: Date, default: null }
}, { timestamps: true });
module.exports = mongoose.model('Settlement', settlementSchema);