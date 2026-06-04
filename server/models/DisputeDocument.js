const mongoose = require('mongoose');
const disputeDocumentSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  documentId: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  status: { type: String, default: 'PENDING_REVIEW' },
  uploadedBy: { type: String, required: true },
  rejectionRemarks: { type: String, default: null }
}, { timestamps: true });
module.exports = mongoose.model('DisputeDocument', disputeDocumentSchema);