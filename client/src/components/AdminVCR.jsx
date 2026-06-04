import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AdminVCR({
  currentUser,
  disputes,
  refreshAllData,
  showToast,
  formatINR,
  formatDateDisp,
  darkMode,
  handleLogout,
  toggleTheme,
  resetAllSessions
}) {
  const [activeQueue, setActiveQueue] = useState('EVIDENCE_REVIEW');
  const [targetDisputeId, setTargetDisputeId] = useState(null);
  const [comments, setComments] = useState('');
  const [amount, setAmount] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  const queues = {
    NEW_DISPUTE: {
      label: 'New Dispute Queue',
      statuses: ['DISPUTE_RECEIVED']
    },
    EVIDENCE_REVIEW: {
      label: 'Evidence Review Queue',
      statuses: ['EVIDENCE_SUBMITTED', 'UNDER_ADMIN_REVIEW', 'DOCUMENT_REQUESTED']
    },
    REPRESENTMENT: {
      label: 'Representment Queue',
      statuses: ['REPRESENTMENT_SUBMITTED', 'ISSUER_REVIEW']
    },
    PRE_ARBITRATION: {
      label: 'Pre-Arbitration Queue',
      statuses: ['PRE_ARBITRATION_RECEIVED', 'PRE_ARBITRATION_RESPONSE_SUBMITTED']
    },
    ARBITRATION: {
      label: 'Arbitration Queue',
      statuses: ['ARBITRATION']
    },
    CLOSED: {
      label: 'Closed Queue',
      statuses: ['CASE_CLOSED', 'VISA_FINAL_DECISION', 'SETTLEMENT_PENDING', 'SETTLEMENT_COMPLETED']
    }
  };

  const getFilteredDisputes = () => {
    const statuses = queues[activeQueue].statuses;
    return disputes.filter(d => statuses.includes(d.status));
  };

  const executeAction = async (action, data = {}) => {
    try {
      const headers = { 
        'Content-Type': 'application/json',
        'x-user-role': currentUser.role,
        'x-user-name': currentUser.username
      };
      
      const payload = { action, ...data };

      const response = await fetch(`${API_URL}/disputes/${targetDisputeId}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast('Action successful');
        setActiveModal(null);
        setComments('');
        setAmount('');
        await refreshAllData();
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Action failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('API error', 'error');
    }
  };

  const filtered = getFilteredDisputes();

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Admin Case Queues (VCR)</h2>
        <div>
          <button onClick={toggleTheme} style={{ marginRight: '10px' }}>{darkMode ? '☀️' : '🌙'}</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {Object.keys(queues).map(key => (
          <button
            key={key}
            onClick={() => setActiveQueue(key)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: activeQueue === key ? 'bold' : 'normal',
              border: 'none',
              background: activeQueue === key ? '#0284c7' : 'transparent',
              color: activeQueue === key ? 'white' : 'inherit',
              borderRadius: '4px'
            }}
          >
            {queues[key].label} ({disputes.filter(d => queues[key].statuses.includes(d.status)).length})
          </button>
        ))}
      </div>

      <div style={{ background: darkMode ? '#1e293b' : '#fff', padding: '20px', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Case ID / RRN</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Merchant</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Date</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Amount</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Status</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No cases in this queue.</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  {d.caseId}<br/>
                  <small>{d.rrn}</small>
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{d.userName}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{formatDateDisp(d.createdDate)}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{formatINR(d.txnAmt)}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{d.status}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  {d.status === 'EVIDENCE_SUBMITTED' && (
                    <>
                      <button onClick={() => { setTargetDisputeId(d.id); executeAction('admin_approve'); }} style={{ marginRight: '5px' }}>Approve (To Visa)</button>
                      <button onClick={() => { setTargetDisputeId(d.id); setActiveModal('reject'); }}>Reject/Request Docs</button>
                    </>
                  )}
                  {d.status === 'REPRESENTMENT_SUBMITTED' && (
                    <button onClick={() => { setTargetDisputeId(d.id); setActiveModal('visa_reject'); }}>Simulate Visa Reject (Pre-Arb)</button>
                  )}
                  {d.status === 'PRE_ARBITRATION_RECEIVED' && (
                    <button onClick={() => { setTargetDisputeId(d.id); setActiveModal('respond_pre_arb'); }}>Respond Pre-Arb</button>
                  )}
                  {d.status === 'PRE_ARBITRATION_RESPONSE_SUBMITTED' && (
                    <button onClick={() => { setTargetDisputeId(d.id); setActiveModal('escalate_arb'); }}>Escalate to Arbitration</button>
                  )}
                  {d.status === 'ARBITRATION' && (
                    <button onClick={() => { setTargetDisputeId(d.id); setActiveModal('visa_final'); }}>Visa Final Decision</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '8px', minWidth: '400px' }}>
            <h3>
              {activeModal === 'reject' && 'Reject / Request More Docs'}
              {activeModal === 'visa_reject' && 'Simulate Visa Reject Representment'}
              {activeModal === 'respond_pre_arb' && 'Respond to Pre-Arbitration'}
              {activeModal === 'escalate_arb' && 'Escalate to Arbitration'}
              {activeModal === 'visa_final' && 'Visa Final Decision'}
            </h3>
            <p>Target Case: {targetDisputeId}</p>
            
            {activeModal === 'escalate_arb' && (
              <input type="number" placeholder="Fee Amount (e.g. 500)" value={amount} onChange={e => setAmount(e.target.value)} style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }} />
            )}
            
            <textarea placeholder="Comments / Remarks" value={comments} onChange={e => setComments(e.target.value)} style={{ width: '100%', height: '80px', marginBottom: '10px' }}></textarea>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActiveModal(null)}>Cancel</button>
              <button onClick={() => {
                const actionMap = {
                  'reject': 'admin_reject',
                  'visa_reject': 'visa_reject_representment',
                  'respond_pre_arb': 'respond_pre_arb',
                  'escalate_arb': 'escalate_arbitration',
                  'visa_final': 'visa_final_decision'
                };
                executeAction(actionMap[activeModal], { comments, amount: amount ? Number(amount) : undefined });
              }} style={{ background: '#0284c7', color: 'white' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
