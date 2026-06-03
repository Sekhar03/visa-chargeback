const fs = require('fs');
const filepath = 'server/routes/disputes.js';
let content = fs.readFileSync(filepath, 'utf-8');

const oldContest = \    } else if (action === 'contest') {
      dispute.mSubStatus = 'Chargeback in Progress';
      if (dispute.adminAction === 'considered') {
        dispute.merchantAction = 'additional_evidence';
      } else {
        dispute.merchantAction = 'evidence';
      }
      dispute.timeline.unshift({ by: req.headers['x-user-name'] || 'System', time: new Date().toISOString(), title: 'Evidence Submitted', remarks: comments || 'Evidence provided to fight dispute.', file: evidence || null });\;

const newContest = \    } else if (action === 'contest') {
      dispute.mSubStatus = 'Document Pending Verification';
      if (dispute.adminAction === 'considered') {
        dispute.merchantAction = 'additional_evidence';
      } else {
        dispute.merchantAction = 'evidence';
      }
      dispute.timeline.unshift({ by: req.headers['x-user-name'] || 'System', time: new Date().toISOString(), title: 'Evidence Submitted', remarks: comments || 'Evidence provided to fight dispute.', file: evidence || null });\;

content = content.replace(oldContest, newContest);

const oldAccept = \    if (action === 'accept') {
      dispute.resolution = 'Lost';
      dispute.mSubStatus = 'Chargeback Lost';
      dispute.merchantAction = 'accepted';
      dispute.timeline.unshift({ by: req.headers['x-user-name'] || 'System', time: new Date().toISOString(), title: 'Accepted Liability', remarks: 'Merchant accepted the dispute loss.', file: null });\;

const newAccept = \    if (action === 'accept') {
      dispute.resolution = 'Lost';
      dispute.mSubStatus = 'Chargeback Lost';
      dispute.merchantAction = 'accepted';
      dispute.timeline.unshift({ by: req.headers['x-user-name'] || 'System', time: new Date().toISOString(), title: 'Accepted Liability', remarks: 'Merchant accepted the dispute loss.', file: null });
    } else if (action === 'admin_request_info') {
      dispute.mSubStatus = 'Document Pending from Merchant';
      dispute.adminAction = 'request_info';
      dispute.timeline.unshift({ by: req.headers['x-user-name'] || 'System', time: new Date().toISOString(), title: 'Documents Rejected / More Info Requested', remarks: comments || 'Admin requested more information from the merchant.', file: null });\;

content = content.replace(oldAccept, newAccept);

const oldVisaAccept = \    } else if (action === 'visa_accept') {
      dispute.mSubStatus = 'Pending Visa Review';
      dispute.adminAction = 'visa_accept';
      dispute.visaPending = true;
      dispute.timeline.unshift({ by: req.headers['x-user-name'] || 'System', time: new Date().toISOString(), title: 'Admin Accepted - Sent to Visa', remarks: 'Admin accepted the documents. Case forwarded to Visa for final ruling.', file: null });\;

const newVisaAccept = \    } else if (action === 'visa_accept') {
      dispute.mSubStatus = 'Submitted to Visa';
      dispute.adminAction = 'visa_accept';
      dispute.visaPending = true;
      dispute.timeline.unshift({ by: req.headers['x-user-name'] || 'System', time: new Date().toISOString(), title: 'Admin Accepted - Sent to Visa', remarks: 'Admin accepted the documents. Case forwarded to Visa for final ruling.', file: null });\;

content = content.replace(oldVisaAccept, newVisaAccept);

const oldVisaReview = \    } else if (action === 'visa_review') {
      dispute.mSubStatus = 'Pending Visa Review';
      dispute.adminAction = 'visa_review';
      dispute.visaPending = true;
      dispute.timeline.unshift({ by: req.headers['x-user-name'] || 'System', time: new Date().toISOString(), title: 'Sent to Visa for Review', remarks: 'Admin disagrees with merchant submission. Case escalated to Visa for review.', file: null });\;

const newVisaReview = \    } else if (action === 'visa_review') {
      dispute.mSubStatus = 'Submitted to Visa';
      dispute.adminAction = 'visa_review';
      dispute.visaPending = true;
      dispute.timeline.unshift({ by: req.headers['x-user-name'] || 'System', time: new Date().toISOString(), title: 'Sent to Visa for Review', remarks: 'Admin disagrees with merchant submission. Case escalated to Visa for review.', file: null });\;

content = content.replace(oldVisaReview, newVisaReview);

fs.writeFileSync(filepath, content, 'utf-8');
console.log('Success!');
