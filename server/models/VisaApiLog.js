const mongoose = require('mongoose');
const visaApiLogSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  endpoint: { type: String, required: true },
  requestPayload: { type: Object, default: {} },
  responsePayload: { type: Object, default: {} },
  statusCode: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('VisaApiLog', visaApiLogSchema);