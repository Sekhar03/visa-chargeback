const mongoose = require('mongoose');
const disputeTimelineSchema = new mongoose.Schema({
  disputeId: { type: String, required: true },
  actionBy: { type: String, required: true },
  actionType: { type: String, required: true },
  remarks: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('DisputeTimeline', disputeTimelineSchema);