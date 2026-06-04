const { buildDefaultUsers, buildSeedLedger, PARTNER_ID } = require('./seed/demoData');

let users = [];
let disputes = [];
let documents = [];
let representments = [];
let preArbitrations = [];
let arbitrations = [];
let settlements = [];
let timelines = [];
let notifications = [];
let ledger = [];

function resetDemo() {
  const TODAY = new Date();
  const demoData = require('./seed/demoData');

  users = demoData.buildDefaultUsers().map(u => ({ ...u, _id: u.username }));
  ledger = demoData.buildSeedLedger(TODAY).map(row => ({ ...row, _id: row.id }));

  const vcrData = demoData.buildVCRSeedData(TODAY);
  disputes = vcrData.disputes;
  documents = vcrData.documents;
  representments = vcrData.representments;
  preArbitrations = vcrData.preArbitrations;
  arbitrations = vcrData.arbitrations;
  settlements = vcrData.settlements;
  timelines = vcrData.timelines;
  notifications = vcrData.notifications;

  return { users: users.length, disputes: disputes.length, ledger: ledger.length };
}

function getUsers() { return users.map(u => ({ ...u })); }
function findUser(query) { return users.find(u => u.username === query.username) || null; }
function updateUserWallet(username, newBalance) {
  const u = users.find(x => x.username === username);
  if (u) u.walletBalance = newBalance;
}

function getDisputes(query = {}) {
  let list = [...disputes];
  if (query.userName) list = list.filter(c => c.userName === query.userName);
  if (query.partnerId) list = list.filter(c => c.partnerId === query.partnerId);
  if (query.id) list = list.filter(c => c.id === query.id);
  if (query.status) list = list.filter(c => c.status === query.status);
  return list.sort((a, b) => (b.createdDate || '').localeCompare(a.createdDate || ''));
}
function findDisputeById(id) { return disputes.find(c => c.id === id) || null; }
function updateDispute(id, updates) {
  const idx = disputes.findIndex(d => d.id === id);
  if (idx > -1) {
    disputes[idx] = { ...disputes[idx], ...updates };
    return disputes[idx];
  }
  return null;
}
function addDispute(d) { disputes.push(d); return d; }

// Helper collections CRUD
function getDocuments(disputeId) { return documents.filter(d => d.disputeId === disputeId); }
function addDocument(doc) { documents.push(doc); return doc; }

function getRepresentment(disputeId) { return representments.find(r => r.disputeId === disputeId) || null; }
function addRepresentment(r) { representments.push(r); return r; }

function getPreArbitration(disputeId) { return preArbitrations.find(p => p.disputeId === disputeId) || null; }
function addPreArbitration(p) { preArbitrations.push(p); return p; }

function getArbitration(disputeId) { return arbitrations.find(a => a.disputeId === disputeId) || null; }
function addArbitration(a) { arbitrations.push(a); return a; }

function getSettlement(disputeId) { return settlements.find(s => s.disputeId === disputeId) || null; }
function addSettlement(s) { settlements.push(s); return s; }

function getTimeline(disputeId) { 
  return timelines.filter(t => t.disputeId === disputeId)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); 
}
function addTimeline(t) { timelines.push({ ...t, createdAt: new Date() }); return t; }

function getLedger(query = {}) {
  let list = [...ledger];
  if (query.merchant) list = list.filter(l => l.merchant === query.merchant);
  return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}
function addLedgerEntry(entry) { ledger.unshift({ ...entry, _id: entry.id }); return entry; }
function countLedger() { return ledger.length; }

// Preload demo data for cold starts
resetDemo();

module.exports = {
  PARTNER_ID,
  resetDemo,
  getUsers, findUser, updateUserWallet,
  getDisputes, findDisputeById, updateDispute, addDispute,
  getDocuments, addDocument,
  getRepresentment, addRepresentment,
  getPreArbitration, addPreArbitration,
  getArbitration, addArbitration,
  getSettlement, addSettlement,
  getTimeline, addTimeline,
  getLedger, addLedgerEntry, countLedger
};
