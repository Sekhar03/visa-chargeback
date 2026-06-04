import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function MerchantVCR({
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
  const [activeTab, setActiveTab] = useState('ACTION_REQUIRED');
  const [targetDisputeId, setTargetDisputeId] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [comments, setComments] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  const merchantDisputes = disputes.filter(d => d.userName === currentUser.username);

  const tabs = {
    ACTION_REQUIRED: {
      label: 'Action Required',
      statuses: ['DISPUTE_RECEIVED', 'DOCUMENT_REQUESTED', 'MERCHANT_ACTION_REQUIRED']
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      statuses: ['EVIDENCE_SUBMITTED', 'UNDER_ADMIN_REVIEW']
    },
    REPRESENTMENT: {
      label: 'Representment Submitted',
      statuses: ['REPRESENTMENT_SUBMITTED', 'ISSUER_REVIEW']
    },
    PRE_ARBITRATION: {
      label: 'Pre-Arbitration',
      statuses: ['PRE_ARBITRATION_RECEIVED', 'PRE_ARBITRATION_RESPONSE_SUBMITTED']
    },
    ARBITRATION: {
      label: 'Arbitration',
      statuses: ['ARBITRATION']
    },
    CLOSED: {
      label: 'Closed',
      statuses: ['CASE_CLOSED', 'VISA_FINAL_DECISION', 'SETTLEMENT_PENDING', 'SETTLEMENT_COMPLETED']
    }
  };

  const getFilteredDisputes = () => {
    const statuses = tabs[activeTab].statuses;
    return merchantDisputes.filter(d => statuses.includes(d.status));
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
        setEvidenceFile(null);
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

  const handleUploadEvidence = () => {
    const evidence = evidenceFile ? [evidenceFile.name] : ['evidence.pdf'];
    executeAction('upload_evidence', { comments, evidence });
  };

  const handleAccept = () => {
    executeAction('accept', { comments });
  };

  const filtered = getFilteredDisputes();

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Merchant Dispute Portal (VCR)</h2>
        <div>
          <button onClick={toggleTheme} style={{ marginRight: '10px' }}>{darkMode ? '☀️' : '🌙'}</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {Object.keys(tabs).map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: activeTab === key ? 'bold' : 'normal',
              border: 'none',
              background: activeTab === key ? '#0ea5e9' : 'transparent',
              color: activeTab === key ? 'white' : 'inherit',
              borderRadius: '4px'
            }}
          >
            {tabs[key].label} ({merchantDisputes.filter(d => tabs[key].statuses.includes(d.status)).length})
          </button>
        ))}
      </div>

      <div style={{ background: darkMode ? '#1e293b' : '#fff', padding: '20px', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Case ID / RRN</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Date</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Amount</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Status</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No disputes found.</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  {d.caseId}<br/>
                  <small>{d.rrn}</small>
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{formatDateDisp(d.createdDate)}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{formatINR(d.txnAmt)}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{d.status}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  {(d.status === 'DISPUTE_RECEIVED' || d.status === 'DOCUMENT_REQUESTED') && (
                    <button onClick={() => { setTargetDisputeId(d.id); setActiveModal('upload'); }}>Upload Evidence</button>
                  )}
                  {d.status === 'DISPUTE_RECEIVED' && (
                    <button onClick={() => { setTargetDisputeId(d.id); setActiveModal('accept'); }} style={{ marginLeft: '10px' }}>Accept Liability</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeModal === 'upload' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '8px', minWidth: '400px' }}>
            <h3>Upload Evidence</h3>
            <p>Target Case: {targetDisputeId}</p>
            <input type="file" onChange={e => setEvidenceFile(e.target.files[0])} style={{ display: 'block', margin: '10px 0' }} />
            <textarea placeholder="Comments (optional)" value={comments} onChange={e => setComments(e.target.value)} style={{ width: '100%', height: '80px', marginBottom: '10px' }}></textarea>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActiveModal(null)}>Cancel</button>
              <button onClick={handleUploadEvidence} style={{ background: '#0ea5e9', color: 'white' }}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'accept' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '20px', borderRadius: '8px', minWidth: '400px' }}>
            <h3>Accept Liability</h3>
            <p>Target Case: {targetDisputeId}</p>
            <textarea placeholder="Comments (optional)" value={comments} onChange={e => setComments(e.target.value)} style={{ width: '100%', height: '80px', marginBottom: '10px' }}></textarea>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActiveModal(null)}>Cancel</button>
              <button onClick={handleAccept} style={{ background: 'red', color: 'white' }}>Confirm Accept</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
