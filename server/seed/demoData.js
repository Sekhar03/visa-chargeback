const Dispute = require('../models/Dispute');
const DisputeDocument = require('../models/DisputeDocument');
const Representment = require('../models/Representment');
const PreArbitration = require('../models/PreArbitration');
const Arbitration = require('../models/Arbitration');
const Settlement = require('../models/Settlement');
const DisputeTimeline = require('../models/DisputeTimeline');
const Notification = require('../models/Notification');
const Ledger = require('../models/Ledger');
const User = require('../models/User');

const PARTNER_ID = 'partneruser';

const buildDefaultUsers = () => [
  { username: 'Test@isu', password: 'Test@2026', role: 'merchant', name: 'Test@isu', walletBalance: 12450.75 },
  { username: 'masteruser', password: 'Test@2026', role: 'merchant', name: 'masteruser', walletBalance: 964.35 },
  { username: 'Test@Ad', password: 'Test@2027', role: 'admin', name: 'Krishna Das', walletBalance: 245800.00 },
  { username: 'partneruser', password: 'Test@2028', role: 'partner', name: 'Arjun Mehta (Partner)', walletBalance: 0.00, partnerId: PARTNER_ID }
];

const buildSeedLedger = (TODAY) => {
  const fmtDate = (d) => d.toISOString().split('T')[0];
  const daysAgo = (n) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - n);
    return fmtDate(d);
  };
  return [];
};

const buildVCRSeedData = (TODAY) => {
  const fmtDate = d => d.toISOString().split('T')[0];
  const dA = n => { let d = new Date(TODAY); d.setDate(d.getDate() - n); return fmtDate(d); };
  const dL = n => fmtDate(new Date(TODAY.getTime() + n * 86400000));

  const disputes = [];
  const documents = [];
  const representments = [];
  const preArbitrations = [];
  const arbitrations = [];
  const settlements = [];
  const timelines = [];
  const notifications = [];

  const addTimeline = (disputeId, actionBy, actionType, remarks) => {
    timelines.push({ disputeId, actionBy, actionType, remarks, createdAt: new Date() });
  };

  // CB001 - DISPUTE_RECEIVED
  disputes.push({
    id: 'CB001', caseId: 'CASE000001', userName: 'masteruser', userId: '2575789089',
    rrn: '6093156553', txnId: '8768987', terminalId: '5683583',
    createdDate: dA(1), txnDate: dA(5), respondByDate: dL(8),
    status: 'DISPUTE_RECEIVED', partnerId: null, txnAmt: 1000, currency: 'INR',
    reasonCode: '10.4', product: 'VISA'
  });
  addTimeline('CB001', 'Visa', 'DISPUTE_CREATED', 'Dispute received from Visa');

  // CB002 - EVIDENCE_SUBMITTED
  disputes.push({
    id: 'CB002', caseId: 'CASE000002', userName: 'masteruser', userId: '2575789089',
    rrn: '6093152984', txnId: '8768988', terminalId: '5688584',
    createdDate: dA(2), txnDate: dA(6), respondByDate: dL(7),
    status: 'EVIDENCE_SUBMITTED', partnerId: null, txnAmt: 3000, currency: 'INR',
    reasonCode: '13.1', product: 'VISA'
  });
  documents.push({ disputeId: 'CB002', documentId: 'doc_1', filename: 'evidence.pdf', status: 'PENDING_REVIEW', uploadedBy: 'masteruser' });
  addTimeline('CB002', 'masteruser', 'EVIDENCE_UPLOADED', 'Merchant uploaded evidence');

  // CB003 - REPRESENTMENT_SUBMITTED
  disputes.push({
    id: 'CB003', caseId: 'CASE000003', userName: 'masteruser', userId: '2575789089',
    rrn: '6093152911', txnId: '8768989', terminalId: '5678585',
    createdDate: dA(10), txnDate: dA(15), respondByDate: dA(2),
    status: 'REPRESENTMENT_SUBMITTED', partnerId: null, txnAmt: 1500, currency: 'INR',
    reasonCode: '10.4', product: 'VISA'
  });
  documents.push({ disputeId: 'CB003', documentId: 'doc_2', filename: 'receipt.pdf', status: 'ACCEPTED', uploadedBy: 'masteruser' });
  representments.push({ disputeId: 'CB003', submittedBy: 'Admin', status: 'SUBMITTED', visaReference: 'VROL123' });
  addTimeline('CB003', 'Admin', 'REPRESENTMENT_SUBMITTED', 'Sent to Visa for Review');

  // CB004 - PRE_ARBITRATION_RECEIVED
  disputes.push({
    id: 'CB004', caseId: 'CASE000004', userName: 'masteruser', userId: '2575789089',
    rrn: '6093152992', txnId: '8768990', terminalId: '5688585',
    createdDate: dA(4), txnDate: dA(8), respondByDate: dL(3),
    status: 'PRE_ARBITRATION_RECEIVED', partnerId: null, txnAmt: 2500, currency: 'INR',
    reasonCode: '10.5', product: 'VISA'
  });
  preArbitrations.push({ disputeId: 'CB004', visaRemarks: 'Evidence rejected by issuer', merchantResponse: 'PENDING' });
  addTimeline('CB004', 'Visa', 'PRE_ARBITRATION_RECEIVED', 'Issuer declined representment');

  // CB005 - ARBITRATION
  disputes.push({
    id: 'CB005', caseId: 'CASE000005', userName: 'masteruser', userId: '2575789089',
    rrn: '6093152993', txnId: '8768991', terminalId: '5683583',
    createdDate: dA(5), txnDate: dA(9), respondByDate: dL(2),
    status: 'ARBITRATION', partnerId: null, txnAmt: 500, currency: 'INR',
    reasonCode: '13.1', product: 'VISA'
  });
  arbitrations.push({ disputeId: 'CB005', referenceNumber: 'ARB555', feeAmount: 500, winner: null });
  addTimeline('CB005', 'Admin', 'ARBITRATION_FILED', 'Escalated to Visa Arbitration');

  // CB006 - CASE_CLOSED (Lost)
  disputes.push({
    id: 'CB006', caseId: 'CASE000006', userName: 'masteruser', userId: '2575789089',
    rrn: '6093152994', txnId: '8768992', terminalId: '5688584',
    createdDate: dA(6), txnDate: dA(10), respondByDate: dL(4),
    status: 'CASE_CLOSED', partnerId: null, txnAmt: 3000, currency: 'INR',
    reasonCode: '10.4', product: 'VISA'
  });
  settlements.push({ disputeId: 'CB006', originalAmount: 3000, chargebackAmount: 3000, adjustmentAmount: -3000, status: 'SETTLEMENT_COMPLETED' });
  addTimeline('CB006', 'System', 'CASE_CLOSED', 'Merchant accepted the loss');

  return {
    disputes,
    documents,
    representments,
    preArbitrations,
    arbitrations,
    settlements,
    timelines,
    notifications
  };
};

async function seedAllDemoData() {
  if (global.MOCK_MODE) {
    return require('../mockStore').resetDemo();
  }

  const TODAY = new Date();

  try {
    await User.deleteMany({});
    await Dispute.deleteMany({});
    await DisputeDocument.deleteMany({});
    await Representment.deleteMany({});
    await PreArbitration.deleteMany({});
    await Arbitration.deleteMany({});
    await Settlement.deleteMany({});
    await DisputeTimeline.deleteMany({});
    await Notification.deleteMany({});
    await Ledger.deleteMany({});

    const users = buildDefaultUsers();
    await User.insertMany(users);

    const vcrData = buildVCRSeedData(TODAY);
    await Dispute.insertMany(vcrData.disputes);
    await DisputeDocument.insertMany(vcrData.documents);
    await Representment.insertMany(vcrData.representments);
    await PreArbitration.insertMany(vcrData.preArbitrations);
    await Arbitration.insertMany(vcrData.arbitrations);
    await Settlement.insertMany(vcrData.settlements);
    await DisputeTimeline.insertMany(vcrData.timelines);
    await Notification.insertMany(vcrData.notifications);

    const ledger = buildSeedLedger(TODAY);
    if(ledger.length > 0) await Ledger.insertMany(ledger);

    return {
      users: users.length,
      disputes: vcrData.disputes.length,
      ledger: ledger.length
    };
  } catch (err) {
    console.warn('[seed] MongoDB seed failed, using in-memory store:', err.message);
    global.MOCK_MODE = true;
    return require('../mockStore').resetDemo();
  }
}

module.exports = {
  PARTNER_ID,
  buildDefaultUsers,
  buildSeedLedger,
  buildVCRSeedData,
  seedAllDemoData
};
