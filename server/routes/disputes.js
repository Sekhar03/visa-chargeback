const express = require('express');
const router = express.Router();
const Dispute = require('../models/Dispute');
const DisputeDocument = require('../models/DisputeDocument');
const Representment = require('../models/Representment');
const PreArbitration = require('../models/PreArbitration');
const Arbitration = require('../models/Arbitration');
const Settlement = require('../models/Settlement');
const DisputeTimeline = require('../models/DisputeTimeline');

const VCR_STATUSES = {
  DISPUTE_RECEIVED: 'DISPUTE_RECEIVED',
  MERCHANT_ACTION_REQUIRED: 'MERCHANT_ACTION_REQUIRED',
  EVIDENCE_SUBMITTED: 'EVIDENCE_SUBMITTED',
  UNDER_ADMIN_REVIEW: 'UNDER_ADMIN_REVIEW',
  DOCUMENT_REQUESTED: 'DOCUMENT_REQUESTED',
  REPRESENTMENT_SUBMITTED: 'REPRESENTMENT_SUBMITTED',
  ISSUER_REVIEW: 'ISSUER_REVIEW',
  PRE_ARBITRATION_RECEIVED: 'PRE_ARBITRATION_RECEIVED',
  PRE_ARBITRATION_RESPONSE_SUBMITTED: 'PRE_ARBITRATION_RESPONSE_SUBMITTED',
  ARBITRATION: 'ARBITRATION',
  VISA_FINAL_DECISION: 'VISA_FINAL_DECISION',
  SETTLEMENT_PENDING: 'SETTLEMENT_PENDING',
  SETTLEMENT_COMPLETED: 'SETTLEMENT_COMPLETED',
  CASE_CLOSED: 'CASE_CLOSED',
};

const aggregateDispute = async (d, mockStore = null) => {
  const dObj = d.toObject ? d.toObject() : { ...d };

  if (mockStore) {
    dObj.documents = mockStore.getDocuments(dObj.id);
    dObj.timeline = mockStore.getTimeline(dObj.id);
    dObj.representment = mockStore.getRepresentment(dObj.id);
    dObj.preArbitration = mockStore.getPreArbitration(dObj.id);
    dObj.arbitration = mockStore.getArbitration(dObj.id);
    dObj.settlement = mockStore.getSettlement(dObj.id);
  } else {
    dObj.documents = await DisputeDocument.find({ disputeId: dObj.id });
    dObj.timeline = await DisputeTimeline.find({ disputeId: dObj.id }).sort({ createdAt: -1 });
    dObj.representment = await Representment.findOne({ disputeId: dObj.id });
    dObj.preArbitration = await PreArbitration.findOne({ disputeId: dObj.id });
    dObj.arbitration = await Arbitration.findOne({ disputeId: dObj.id });
    dObj.settlement = await Settlement.findOne({ disputeId: dObj.id });
  }

  return dObj;
};

// GET / - Aggregate all relations
router.get('/', async (req, res) => {
  try {
    const { from, to, rrn, status, search } = req.query;
    const userRole = req.headers['x-user-role'];
    const userName = req.headers['x-user-name'];
    const partnerId = req.headers['x-partner-id'];

    let query = {};

    if (userRole === 'merchant') {
      if (!userName) return res.status(400).json({ message: 'Missing x-user-name' });
      query.userName = userName;
    } else if (userRole === 'partner') {
      if (!partnerId) return res.status(400).json({ message: 'Missing x-partner-id' });
      query.partnerId = partnerId;
    }

    if (from || to) {
      query.createdDate = {};
      if (from) query.createdDate.$gte = from;
      if (to) query.createdDate.$lte = to;
    }
    if (rrn) query.rrn = new RegExp(rrn, 'i');
    if (status) query.status = status;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ rrn: searchRegex }, { txnId: searchRegex }, { userName: searchRegex }];
    }

    let rawDisputes = [];
    if (global.MOCK_MODE) {
      const mockStore = require('../mockStore');
      rawDisputes = mockStore.getDisputes(query);
      const aggregated = await Promise.all(rawDisputes.map(d => aggregateDispute(d, mockStore)));
      return res.json(aggregated);
    }

    rawDisputes = await Dispute.find(query).sort({ createdDate: -1 });
    const aggregated = await Promise.all(rawDisputes.map(d => aggregateDispute(d)));
    res.json(aggregated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /:id/action - Enforce VCR state machine
router.post('/:id/action', async (req, res) => {
  try {
    const { action, evidence, comments, amount } = req.body;
    const userRole = req.headers['x-user-role'] || 'system';
    const userName = req.headers['x-user-name'] || 'System';

    let dispute;
    let mockStore = null;

    if (global.MOCK_MODE) {
      mockStore = require('../mockStore');
      dispute = mockStore.findDisputeById(req.params.id);
    } else {
      dispute = await Dispute.findOne({ id: req.params.id });
    }

    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    const addTimelineEntry = async (type, remarks) => {
      const tl = { disputeId: dispute.id, actionBy: userName, actionType: type, remarks };
      if (global.MOCK_MODE) {
        mockStore.addTimeline(tl);
      } else {
        await DisputeTimeline.create(tl);
      }
    };

    const addDocs = async (files) => {
      const arr = Array.isArray(files) ? files : [files];
      for (const f of arr) {
        const doc = { disputeId: dispute.id, documentId: 'doc_' + Date.now() + Math.random(), filename: f, uploadedBy: userName };
        if (global.MOCK_MODE) {
          mockStore.addDocument(doc);
        } else {
          await DisputeDocument.create(doc);
        }
      }
    };

    // VCR STATE MACHINE IMPLEMENTATION
    if (action === 'accept') {
      dispute.status = VCR_STATUSES.CASE_CLOSED;
      await addTimelineEntry('ACCEPTED_LIABILITY', comments || 'Merchant accepted liability');
      
      const stl = { disputeId: dispute.id, originalAmount: dispute.txnAmt, chargebackAmount: dispute.txnAmt, adjustmentAmount: -dispute.txnAmt, status: 'SETTLEMENT_COMPLETED' };
      if (global.MOCK_MODE) mockStore.addSettlement(stl); else await Settlement.create(stl);
    } 
    
    else if (action === 'upload_evidence') {
      if (dispute.status !== VCR_STATUSES.DISPUTE_RECEIVED && dispute.status !== VCR_STATUSES.DOCUMENT_REQUESTED) {
        return res.status(400).json({ message: 'Invalid state for upload_evidence' });
      }
      dispute.status = VCR_STATUSES.EVIDENCE_SUBMITTED;
      if (evidence) await addDocs(evidence);
      await addTimelineEntry('EVIDENCE_UPLOADED', comments || 'Evidence submitted by merchant');
    } 
    
    else if (action === 'admin_approve') {
      if (dispute.status !== VCR_STATUSES.EVIDENCE_SUBMITTED) {
        return res.status(400).json({ message: 'Invalid state for admin_approve' });
      }
      dispute.status = VCR_STATUSES.REPRESENTMENT_SUBMITTED;
      
      const rep = { disputeId: dispute.id, submittedBy: userName, visaReference: 'VROL_' + Date.now() };
      if (global.MOCK_MODE) mockStore.addRepresentment(rep); else await Representment.create(rep);
      
      await addTimelineEntry('ADMIN_APPROVED', comments || 'Admin approved and submitted to Visa');
    } 
    
    else if (action === 'admin_reject') {
      if (dispute.status !== VCR_STATUSES.EVIDENCE_SUBMITTED) {
        return res.status(400).json({ message: 'Invalid state for admin_reject' });
      }
      dispute.status = VCR_STATUSES.DOCUMENT_REQUESTED;
      await addTimelineEntry('ADMIN_REJECTED', comments || 'Admin rejected evidence, requested more info');
    } 
    
    else if (action === 'visa_reject_representment') {
      if (dispute.status !== VCR_STATUSES.REPRESENTMENT_SUBMITTED) {
        return res.status(400).json({ message: 'Invalid state for visa_reject_representment' });
      }
      dispute.status = VCR_STATUSES.PRE_ARBITRATION_RECEIVED;
      
      const preArb = { disputeId: dispute.id, visaRemarks: comments || 'Visa rejected representment' };
      if (global.MOCK_MODE) mockStore.addPreArbitration(preArb); else await PreArbitration.create(preArb);
      
      await addTimelineEntry('PRE_ARB_RECEIVED', 'Visa rejected representment, escalated to Pre-Arbitration');
    } 
    
    else if (action === 'respond_pre_arb') {
      if (dispute.status !== VCR_STATUSES.PRE_ARBITRATION_RECEIVED) {
        return res.status(400).json({ message: 'Invalid state for respond_pre_arb' });
      }
      dispute.status = VCR_STATUSES.PRE_ARBITRATION_RESPONSE_SUBMITTED;
      await addTimelineEntry('PRE_ARB_RESPONDED', comments || 'Responded to Pre-Arbitration');
    } 
    
    else if (action === 'escalate_arbitration') {
      if (dispute.status !== VCR_STATUSES.PRE_ARBITRATION_RESPONSE_SUBMITTED) {
        return res.status(400).json({ message: 'Invalid state for escalate_arbitration' });
      }
      dispute.status = VCR_STATUSES.ARBITRATION;
      
      const arb = { disputeId: dispute.id, referenceNumber: 'ARB_' + Date.now(), feeAmount: amount || 500 };
      if (global.MOCK_MODE) mockStore.addArbitration(arb); else await Arbitration.create(arb);
      
      await addTimelineEntry('ARBITRATION_FILED', comments || 'Escalated to Arbitration');
    } 
    
    else if (action === 'visa_final_decision') {
      if (dispute.status !== VCR_STATUSES.ARBITRATION) {
        return res.status(400).json({ message: 'Invalid state for visa_final_decision' });
      }
      dispute.status = VCR_STATUSES.CASE_CLOSED;
      await addTimelineEntry('VISA_DECISION', comments || 'Visa final decision received');
      
      const stl = { disputeId: dispute.id, originalAmount: dispute.txnAmt, chargebackAmount: dispute.txnAmt, adjustmentAmount: 0, status: 'SETTLEMENT_COMPLETED' };
      if (global.MOCK_MODE) mockStore.addSettlement(stl); else await Settlement.create(stl);
    }
    
    else {
      return res.status(400).json({ message: 'Unknown action' });
    }

    let updatedDispute;
    if (global.MOCK_MODE) {
      updatedDispute = mockStore.updateDispute(dispute.id, { status: dispute.status });
    } else {
      updatedDispute = await dispute.save();
    }

    const aggregated = await aggregateDispute(updatedDispute, mockStore);
    res.json(aggregated);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  res.status(405).json({ message: 'Use POST /:id/action for state transitions' });
});

module.exports = router;
