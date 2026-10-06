# TenderBuilder - B2B Bid & Tender Proposal Management Suite

TenderBuilder is a full-featured enterprise application for managing, building, auditing, and submitting procurement tenders, RFPs, and bids (compatible with PPR-2008 public procurement and international FIDIC standards).

## ✨ Features

- **Automated Bid Evaluation & Test Suite:**
  - 6-tier automated qualification audit (Statutory Docs, Earnest Money Bank Guarantee, Technical Compliance, Financial Margin, Team Credentials, Submission SLA).
  - Real-time test runner with execution logs, verdict calculation (`QUALIFIED`, `CONDITIONAL`, `DISQUALIFIED`), and 1-click quick fixes.
- **Bill of Quantities (BOQ) Cost Estimator:**
  - Itemized hardware, software, labor, and services schedule.
  - Automatic calculations for VAT, Overheads, Net Margin %, Grand Bid Value vs Official Budget Ceiling.
  - CSV export for procurement officers.
- **Clause-by-Clause Compliance Matrix:**
  - Track RFP requirements, bidder proposed solutions, and deviation justifications.
- **Statutory Document Vault:**
  - Verification checklist for Trade License, TIN, BIN/VAT, Bank Solvency, Earnest Money Bank Guarantee, and ISO certificates.
- **Key Personnel & Implementation Milestones:**
  - Certified PMP Project Managers, Architects, and phase timelines.
  - Project milestone deliverable schedule.
- **Formal Bid Proposal Document (Form PG4-1):**
  - Clean, official layout ready for printing or saving as PDF.
- **Bilingual Interface:**
  - Instant toggle between English and Bengali (বাংলা).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm or bun

### Installation
1. Unzip the downloaded file:
   ```bash
   unzip tender-builder.zip
   cd tender-builder
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

### Build for Production
```bash
npm run build
npm run preview
```

## 📄 License
Apache-2.0
