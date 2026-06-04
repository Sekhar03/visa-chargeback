const VisaApiLog = require('../models/VisaApiLog');

class VisaConnectorService {
  /**
   * Logs a simulated request and response to the Visa API
   */
  static async _logApiCall(disputeId, endpoint, requestPayload, responsePayload, statusCode) {
    if (global.MOCK_MODE) {
      console.log(`[Visa API] ${endpoint} -> ${statusCode}`);
      return;
    }
    try {
      const log = new VisaApiLog({ disputeId, endpoint, requestPayload, responsePayload, statusCode });
      await log.save();
    } catch (err) {
      console.error('Failed to log Visa API call:', err.message);
    }
  }

  static async GetDisputes() {
    // Simulated fetch of new disputes from Visa
    return [];
  }

  static async GetDisputeDetails(disputeId) {
    return { disputeId, details: 'Simulated VCR Dispute Details' };
  }

  static async SubmitRepresentment(disputeId, documents) {
    const payload = { disputeId, documents: documents.map(d => d.documentId) };
    const response = { success: true, visaReference: 'VROL-' + Date.now() };
    await this._logApiCall(disputeId, 'SubmitRepresentment', payload, response, 200);
    return response;
  }

  static async GetPreArbitrationCases() {
    return [];
  }

  static async RespondToPreArbitration(disputeId, responseAction) {
    const payload = { disputeId, action: responseAction };
    const response = { success: true, processedAt: new Date().toISOString() };
    await this._logApiCall(disputeId, 'RespondToPreArbitration', payload, response, 200);
    return response;
  }

  static async GetArbitrationStatus(disputeId) {
    return { status: 'PENDING', date: new Date().toISOString() };
  }

  static async GetArbitrationDecision(disputeId) {
    return { decision: 'MERCHANT_WON', liability: 'ISSUER', notes: 'Simulated Visa Decision' };
  }

  static async GetSettlementDetails(disputeId) {
    return { status: 'SETTLEMENT_COMPLETED', amount: 0, date: new Date().toISOString() };
  }
}

module.exports = VisaConnectorService;
