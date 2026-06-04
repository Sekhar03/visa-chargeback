const fs = require('fs');
const path = require('path');

const models = {
  'Dispute.js': `const mongoose = require('mongoose');
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
module.exports = mongoose.model('Dispute', disputeSchema);`,

  'DisputeDocument.js': `const mongoose = require('mongoose');
const disputeDocumentSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  documentId: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  status: { type: String, default: 'PENDING_REVIEW' },
  uploadedBy: { type: String, required: true },
  rejectionRemarks: { type: String, default: null }
}, { timestamps: true });
module.exports = mongoose.model('DisputeDocument', disputeDocumentSchema);`,

  'Representment.js': `const mongoose = require('mongoose');
const representmentSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  submittedBy: { type: String, required: true },
  status: { type: String, default: 'SUBMITTED' },
  visaReference: { type: String, default: null }
}, { timestamps: true });
module.exports = mongoose.model('Representment', representmentSchema);`,

  'PreArbitration.js': `const mongoose = require('mongoose');
const preArbitrationSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  receivedAt: { type: Date, default: Date.now },
  visaRemarks: { type: String, default: '' },
  merchantResponse: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  respondedAt: { type: Date, default: null }
}, { timestamps: true });
module.exports = mongoose.model('PreArbitration', preArbitrationSchema);`,

  'Arbitration.js': `const mongoose = require('mongoose');
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
module.exports = mongoose.model('Arbitration', arbitrationSchema);`,

  'Settlement.js': `const mongoose = require('mongoose');
const settlementSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  originalAmount: { type: Number, required: true },
  chargebackAmount: { type: Number, required: true },
  adjustmentAmount: { type: Number, required: true },
  status: { type: String, enum: ['SETTLEMENT_PENDING', 'SETTLEMENT_COMPLETED'], default: 'SETTLEMENT_PENDING' },
  settlementDate: { type: Date, default: null }
}, { timestamps: true });
module.exports = mongoose.model('Settlement', settlementSchema);`,

  'DisputeTimeline.js': `const mongoose = require('mongoose');
const disputeTimelineSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  actionBy: { type: String, required: true },
  actionType: { type: String, required: true },
  remarks: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('DisputeTimeline', disputeTimelineSchema);`,

  'Notification.js': `const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  disputeId: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);`,

  'VisaApiLog.js': `const mongoose = require('mongoose');
const visaApiLogSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  endpoint: { type: String, required: true },
  requestPayload: { type: Object, default: {} },
  responsePayload: { type: Object, default: {} },
  statusCode: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('VisaApiLog', visaApiLogSchema);`
};

for (const [filename, content] of Object.entries(models)) {
  fs.writeFileSync(path.join(__dirname, filename), content);
}
console.log('Generated all models.');
