# Portal Flow & Controls

## Admin Portal
**Full control over the entire platform**

**Disputes**
- Receives all incoming disputes from VROL
- Reviews evidence submitted by merchants
- Decides to represent the dispute to Visa or close it as lost
- Escalates cases to Pre-Arb or Arbitration if needed
- Enters the final Visa ruling (Won or Lost) to close the case

**Merchants**
- Views any merchant's dispute history and VAMP ratio
- Suspends or reactivates merchants
- Sends alerts to merchants

**Compliance**
- Monitors VAMP ratios across all merchants
- Identifies merchants breaching the 2.2% threshold
- Exports compliance reports

**Configuration**
- Manages VROL API connection
- Sets alert rules and reason code mappings
- Manages user roles and permissions

---

## Merchant Portal
**Responds to their own disputes only**

**Disputes**
- Receives notification when a new dispute is filed
- Views what stage the dispute is at and how much time is left to respond
- Chooses to either accept liability (close as lost) or fight the dispute
- Uploads evidence files and selects a rebuttal template
- Submits the response to admin for review
- If escalated to Pre-Arb or Arbitration, submits additional evidence
- Views the final outcome (Won or Lost)

**VAMP**
- Monitors their own VAMP ratio against the 2.2% limit
- Projects future ratio using the calculator
- Sets personal alert thresholds

**Reports**
- Generates dispute and VAMP history reports
- Manages rebuttal response templates

---

## Partner Portal
**Oversees their portfolio of merchants**

**Portfolio**
- Monitors all sub-merchants' VAMP ratios and dispute counts
- Identifies at-risk or breaching merchants
- Changes merchant plan tiers or suspends merchants

**VROL Operations**
- Submits representments to Visa on behalf of a merchant
- Runs batch submissions for multiple disputes at once
- Tracks all active VROL cases across the portfolio
- Monitors incoming webhook events from Visa

**Analytics**
- Compares merchant performance across the portfolio
- Tracks portfolio-level VAMP trend and win rates

**API & Bulk Config**
- Issues and manages API keys for merchants
- Applies configuration changes (Order Insight, RDR, plan tier) to multiple merchants at once

---

## Who Controls What

| Action | Admin | Merchant | Partner |
|---|---|---|---|
| Receive dispute from VROL | ✅ | ✅ notified | ✅ notified |
| Submit evidence | ❌ | ✅ | ✅ on behalf |
| Accept liability | ❌ | ✅ | ❌ |
| Represent to Visa | ✅ | ❌ | ✅ on behalf |
| Escalate to Pre-Arb / Arb | ✅ | ❌ | ❌ |
| Enter final ruling | ✅ | ❌ | ❌ |
| Monitor VAMP ratio | ✅ all merchants | ✅ own only | ✅ portfolio |
| Suspend merchant | ✅ | ❌ | ✅ own portfolio |
| Bulk config changes | ❌ | ❌ | ✅ |
| Manage API keys | ❌ | ❌ | ✅ |
