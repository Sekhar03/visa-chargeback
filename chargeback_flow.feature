Feature: Visa Chargeback Dispute Management Workflow
  As a user of the Visa Chargeback platform
  I want to be able to raise, track, manage, and resolve chargeback disputes
  So that chargebacks are efficiently handled between Customers, Partners, Merchants, and Admins.

  Background:
    Given the Chargeback system is running
    And the following portals are available: Customer, Partner, Merchant, and Admin

  # ---------------------------------------------------------
  # CUSTOMER PORTAL FLOW
  # ---------------------------------------------------------
  Scenario: Customer raises a new dispute
    Given I am logged into the Customer Portal
    When I submit a new chargeback request with valid transaction details
    Then the dispute should be created in the system
    And the status of the dispute should be "Chargeback New"
    And the dispute should appear in the Merchant's "Action Required" tab

  # ---------------------------------------------------------
  # MERCHANT PORTAL FLOWS
  # ---------------------------------------------------------
  Scenario: Merchant reviews a new dispute and uploads evidence
    Given I am logged into the Merchant Portal
    And there is a "Chargeback New" dispute in the "Action Required" tab
    When I click to view the dispute
    And I click "Upload Evidence"
    And I attach supporting documents and submit
    Then the dispute status should change to "Document Pending Verification"
    And the dispute should move to the Admin's "Verification Pending" queue

  Scenario: Merchant accepts liability for a new dispute
    Given I am logged into the Merchant Portal
    And there is a "Chargeback New" dispute in the "Action Required" tab
    When I click to view the dispute
    And I click "Accept Loss"
    Then the dispute status should change to "Chargeback Lost"
    And the dispute should no longer require action

  Scenario: Merchant re-uploads a rejected document
    Given I am logged into the Merchant Portal
    And there is a dispute with rejected documents in the "Action Required" tab
    When I view the dispute
    Then I should see the rejected document highlighted in red with Admin remarks
    When I click "Re-upload" and provide a corrected document
    Then the new document should be submitted
    And the dispute should return to the Admin's "Verification Pending" queue

  Scenario: Merchant accepts Admin-provided evidence
    Given I am logged into the Merchant Portal
    And the Admin has uploaded evidence for me to review
    When I navigate to the "Documents Pending for Verification" tab
    And I click to view the dispute
    And I click "Accept Admin Evidence"
    Then the dispute should be forwarded to the Admin for final Visa submission

  Scenario: Merchant rejects Admin-provided evidence
    Given I am logged into the Merchant Portal
    And the Admin has uploaded evidence for me to review
    When I navigate to the "Documents Pending for Verification" tab
    And I click to view the dispute
    And I click "Reject Admin Evidence"
    And I select the documents to reject and provide mandatory remarks
    Then the dispute should bounce back to the Admin
    And the timeline should reflect the Merchant's rejection

  # ---------------------------------------------------------
  # ADMIN PORTAL FLOWS
  # ---------------------------------------------------------
  Scenario: Admin reviews merchant evidence and declines documents
    Given I am logged into the Admin Portal
    And there is a dispute in the "Verification Pending" tab with merchant documents
    When I click to view the dispute
    And I click "Decline & Send to Merchant"
    And I select specific merchant documents to reject
    And I enter mandatory rejection remarks and submit
    Then the dispute status should change to "Document Pending from Merchant"
    And the dispute should appear in the Merchant's "Action Required" tab

  Scenario: Admin uploads evidence for the merchant
    Given I am logged into the Admin Portal
    And I am viewing a dispute
    When I click "Upload Evidence for Merchant"
    And I attach a file and submit
    Then the document should be added to the dispute with "Admin" as the uploader
    And the dispute should appear in the Merchant's "Documents Pending for Verification" tab

  Scenario: Admin accepts loss and sends to Visa
    Given I am logged into the Admin Portal
    And I am viewing a dispute
    When I click "Accept Loss (Send to Visa)"
    Then the dispute should be flagged for Visa submission
    And the timeline should reflect that the Admin accepted the loss

  # ---------------------------------------------------------
  # PARTNER PORTAL FLOWS
  # ---------------------------------------------------------
  Scenario: Partner manages disputes for their merchants
    Given I am logged into the Partner Portal
    When I navigate to the disputes dashboard
    Then I should see all disputes associated with my merchants
    And I can perform bulk uploads to create multiple disputes at once
