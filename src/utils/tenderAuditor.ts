import { AuditCheckItem, AuditReport, TenderProposal } from '../types/tender';

export function calculateBOQSummary(tender: TenderProposal) {
  let baseCost = 0;
  let totalOverhead = 0;
  let totalVat = 0;
  let totalMargin = 0;

  tender.boqItems.forEach((item) => {
    const itemBase = item.quantity * item.unitCost;
    const itemOverhead = itemBase * (item.overheadPercent / 100);
    const itemSubtotal = itemBase + itemOverhead;
    const itemVat = itemSubtotal * (item.vatPercent / 100);
    const itemMargin = itemSubtotal * (item.marginPercent / 100);

    baseCost += itemBase;
    totalOverhead += itemOverhead;
    totalVat += itemVat;
    totalMargin += itemMargin;
  });

  const totalBidPrice = baseCost + totalOverhead + totalVat + totalMargin;
  const blendedMarginPercent = totalBidPrice > 0 ? (totalMargin / totalBidPrice) * 100 : 0;
  const budgetCeiling = tender.estimatedBudgetCeiling || 1;
  const budgetVariancePercent = ((totalBidPrice - budgetCeiling) / budgetCeiling) * 100;

  return {
    baseCost,
    totalOverhead,
    totalVat,
    totalMargin,
    totalBidPrice,
    blendedMarginPercent,
    budgetVariancePercent,
    isOverBudget: totalBidPrice > budgetCeiling,
  };
}

export function runTenderAudit(tender: TenderProposal): AuditReport {
  const checkItems: AuditCheckItem[] = [];
  const boqSummary = calculateBOQSummary(tender);

  // 1. Mandatory Legal & Tax Documentation Check
  const mandatoryDocs = tender.documents.filter((d) => d.isMandatory);
  const missingMandatoryDocs = mandatoryDocs.filter((d) => d.status === 'missing' || d.status === 'expired');
  const uploadedUnverifiedDocs = mandatoryDocs.filter((d) => d.status === 'uploaded');

  if (missingMandatoryDocs.length === 0 && uploadedUnverifiedDocs.length === 0) {
    checkItems.push({
      id: 'chk-doc-mandatory',
      category: 'documentation',
      nameEn: 'Mandatory Legal & Tax Document Verification',
      nameBn: 'বাধ্যতামূলক আইনি ও ট্যাক্স নথিপত্র যাচাইকরণ',
      descriptionEn: `All ${mandatoryDocs.length} mandatory documents (Trade License, TIN, BIN, Bank Solvency) are fully verified.`,
      descriptionBn: `সকল ${mandatoryDocs.length}টি বাধ্যতামূলক নথিপত্র (ট্রেড লাইসেন্স, টিআইএন, বিন, ব্যাংক সলভেন্সি) চূড়ান্তভাবে যাচাইকৃত।`,
      status: 'passed',
      scoreImpact: 20,
      details: 'Trade license, TIN tax clearance, BIN VAT certification, and audited financial statements validated.',
      recommendationEn: 'Maintain archived physical copies with notary certification for submission day.',
      recommendationBn: 'দাখিলের দিনের জন্য নোটারি প্রত্যয়িত হার্ডকপি সংরক্ষণ করুন।',
    });
  } else if (missingMandatoryDocs.length > 0) {
    checkItems.push({
      id: 'chk-doc-mandatory',
      category: 'documentation',
      nameEn: 'Missing Mandatory Regulatory Documents',
      nameBn: 'বাধ্যতামূলক নিয়ন্ত্রক নথিপত্রের ঘাটতি',
      descriptionEn: `${missingMandatoryDocs.length} mandatory documents are missing or expired (${missingMandatoryDocs.map((d) => d.title).join(', ')}).`,
      descriptionBn: `${missingMandatoryDocs.length}টি আবশ্যক নথি অনুপস্থিত অথবা মেয়াদোত্তীর্ণ (${missingMandatoryDocs.map((d) => d.titleBn || d.title).join(', ')})।`,
      status: 'failed',
      scoreImpact: -25,
      details: 'Public procurement bylaws automatically reject tender submissions without verified statutory documents.',
      recommendationEn: 'Immediately upload valid attested certificates before submitting the tender package.',
      recommendationBn: 'দরপত্র জমা দেওয়ার আগে অবিলম্বে সত্যায়িত প্রত্যয়নপত্র আপলোড করুন।',
    });
  } else {
    checkItems.push({
      id: 'chk-doc-mandatory',
      category: 'documentation',
      nameEn: 'Pending Verification on Uploaded Documents',
      nameBn: 'আপলোডকৃত নথির চূড়ান্ত যাচাইকরণ বাকি',
      descriptionEn: `${uploadedUnverifiedDocs.length} documents uploaded but awaiting compliance desk verification stamp.`,
      descriptionBn: `${uploadedUnverifiedDocs.length}টি নথি আপলোড করা হয়েছে কিন্তু কমপ্লায়েন্স ডেস্ক থেকে চূড়ান্ত সাইন-অফ বাকি।`,
      status: 'warning',
      scoreImpact: 10,
      details: 'Documents are uploaded into the repository but require QA validation before submission.',
      recommendationEn: 'Review signatures and OEM stamp authenticity.',
      recommendationBn: 'স্বাক্ষর এবং প্রস্তুতকারকের সিলের সত্যতা নিশ্চিত করুন।',
    });
  }

  // 2. Tender Security / Earnest Money Bank Guarantee Check
  const bgDoc = tender.documents.find((d) => d.title.toLowerCase().includes('guarantee') || d.title.toLowerCase().includes('security') || d.titleBn?.includes('জামানত'));
  const hasValidEarnestMoney = tender.earnestMoneyAmount > 0 && tender.bankGuaranteeDetails && tender.bankGuaranteeDetails.length > 10;
  
  if (hasValidEarnestMoney && (!bgDoc || bgDoc.status === 'verified')) {
    checkItems.push({
      id: 'chk-sec-earnest',
      category: 'security',
      nameEn: 'Tender Security / Earnest Money Bank Guarantee (BG)',
      nameBn: 'দরপত্র জামানত / আর্নেস্ট মানি ব্যাংক গ্যারান্টি (বিজি)',
      descriptionEn: `Valid Bank Guarantee configured for ${tender.currency} ${tender.earnestMoneyAmount.toLocaleString()} (${tender.bankGuaranteeDetails}).`,
      descriptionBn: `বৈধ ব্যাংক গ্যারান্টি সক্রিয়: ${tender.currency} ${tender.earnestMoneyAmount.toLocaleString()} (${tender.bankGuaranteeDetails})।`,
      status: 'passed',
      scoreImpact: 20,
      details: 'Original BG confirmation letter registered with commercial bank.',
      recommendationEn: 'Ensure original bank guarantee paper with security watermark is kept in sealed envelope.',
      recommendationBn: 'নিরাপত্তা ওয়াটারমার্কযুক্ত মূল ব্যাংক গ্যারান্টি সিলগালা খামে সংরক্ষণ করুন।',
    });
  } else if (!hasValidEarnestMoney || (bgDoc && bgDoc.status === 'missing')) {
    checkItems.push({
      id: 'chk-sec-earnest',
      category: 'security',
      nameEn: 'Tender Security Deposit Deficit (Critical Disqualification Risk)',
      nameBn: 'দরপত্র জামানতের ঘাটতি (সরাসরি বাতিল হওয়ার ঝুঁকি)',
      descriptionEn: 'Tender Security / Earnest Money BG is missing or bank sanction details are unconfirmed.',
      descriptionBn: 'দরপত্র জামানত / আর্নেস্ট মানি বিজি অনুপস্থিত বা ব্যাংকের অনুমোদন নিশ্চিত নয়।',
      status: 'failed',
      scoreImpact: -30,
      details: 'Tenders without unconditional irrevocable bank guarantee are summarily disqualified at opening box.',
      recommendationEn: 'Obtain authorized Bank Guarantee immediately from scheduled commercial bank.',
      recommendationBn: 'তফসিলি বাণিজ্যিক ব্যাংক থেকে অবিলম্বে অনুমোদিত ব্যাংক গ্যারান্টি সংগ্রহ করুন।',
    });
  }

  // 3. Technical Clause Compliance & Deviation Matrix
  const mandatoryClauses = tender.complianceClauses.filter((c) => c.isMandatory);
  const nonCompliantMandatory = mandatoryClauses.filter((c) => c.status === 'non_compliant');
  const partiallyCompliant = tender.complianceClauses.filter((c) => c.status === 'partially_compliant');

  if (nonCompliantMandatory.length === 0 && partiallyCompliant.length === 0) {
    checkItems.push({
      id: 'chk-comp-clauses',
      category: 'compliance',
      nameEn: 'Technical Specification & RFP Clause Compliance',
      nameBn: 'কারিগরি স্পেসিফিকেশন ও আরএফপি শর্তাবলি সম্মতি',
      descriptionEn: `100% compliance across all ${tender.complianceClauses.length} technical clauses without any deviations.`,
      descriptionBn: `সকল ${tender.complianceClauses.length}টি কারিগরি শর্তে শতভাগ সম্মতি (কোনো বিচ্যুতি নেই)।`,
      status: 'passed',
      scoreImpact: 25,
      details: 'All mandatory performance SLAs, certifications, and technical parameters fully satisfied.',
      recommendationEn: 'Include cross-referenced page citations in final technical volume.',
      recommendationBn: 'চূড়ান্ত কারিগরি প্রস্তাবে পৃষ্ঠা নম্বর রেফারেন্স যুক্ত করুন।',
    });
  } else if (nonCompliantMandatory.length > 0) {
    checkItems.push({
      id: 'chk-comp-clauses',
      category: 'compliance',
      nameEn: 'Mandatory RFP Clause Non-Compliance Detected',
      nameBn: 'আবশ্যকীয় আরএফপি শর্তে অসঙ্গতি/অমিল শনাক্ত',
      descriptionEn: `${nonCompliantMandatory.length} mandatory clause(s) marked Non-Compliant (${nonCompliantMandatory.map((c) => c.clauseNumber).join(', ')}).`,
      descriptionBn: `${nonCompliantMandatory.length}টি বাধ্যতামূলক ধারায় অসঙ্গতি বিদ্যমান (${nonCompliantMandatory.map((c) => c.clauseNumber).join(', ')})।`,
      status: 'failed',
      scoreImpact: -25,
      details: 'Tender evaluation committee rejects proposals with material non-compliance on mandatory criteria.',
      recommendationEn: 'Address gaps with OEM partnership or adjust technical proposal to achieve compliance.',
      recommendationBn: 'প্রস্তুতকারক বা প্রযুক্তি পার্টনারের সহায়তায় শর্তাবলি পূরণ করুন।',
    });
  } else {
    checkItems.push({
      id: 'chk-comp-clauses',
      category: 'compliance',
      nameEn: 'Technical Deviations & Partial Compliance Flagged',
      nameBn: 'কারিগরি বিচ্যুতি এবং আংশিক সম্মতি চিহ্নিত',
      descriptionEn: `${partiallyCompliant.length} clause(s) have minor technical deviations noted (${partiallyCompliant.map((c) => c.clauseNumber).join(', ')}).`,
      descriptionBn: `${partiallyCompliant.length}টি শর্তে ছোটখাটো কারিগরি বিচ্যুতি বা বিকল্প প্রস্তাব রয়েছে।`,
      status: 'warning',
      scoreImpact: 12,
      details: 'Minor deviations are acceptable if explicitly justified with commercial cost-benefit rationale.',
      recommendationEn: 'Ensure clear justification text in Form PG4/Technical Schedule.',
      recommendationBn: 'কারিগরি সিডিউলে বিচ্যুতির সুস্পষ্ট যৌক্তিকতা ও সুবিধা উল্লেখ করুন।',
    });
  }

  // 4. Financial BOQ, Margin & Ceiling Budget Sanity Check
  if (boqSummary.isOverBudget) {
    checkItems.push({
      id: 'chk-fin-budget',
      category: 'financial',
      nameEn: 'Bid Price Exceeds Client Official Budget Ceiling',
      nameBn: 'দরপত্র মূল্য ক্লায়েন্টের অনুমোদিত সর্বোচ্চ বাজেট অতিক্রম করেছে',
      descriptionEn: `Calculated total (${tender.currency} ${boqSummary.totalBidPrice.toLocaleString()}) exceeds budget ceiling by ${boqSummary.budgetVariancePercent.toFixed(1)}%.`,
      descriptionBn: `হিসাবকৃত মোট মূল্য (${tender.currency} ${boqSummary.totalBidPrice.toLocaleString()}) সর্বোচ্চ বাজেটের চেয়ে ${boqSummary.budgetVariancePercent.toFixed(1)}% বেশি।`,
      status: 'failed',
      scoreImpact: -20,
      details: 'Bids exceeding official administrative allocation risk outright financial disqualification or non-responsiveness.',
      recommendationEn: 'Review hardware specs, trim overheads, or negotiate supplier discounts to align below ceiling.',
      recommendationBn: 'হার্ডওয়্যার স্পেক্স পুনর্বিবেচনা করুন এবং খরচ কমিয়ে বাজেটের মধ্যে আনুন।',
    });
  } else if (boqSummary.blendedMarginPercent < 8.0) {
    checkItems.push({
      id: 'chk-fin-budget',
      category: 'financial',
      nameEn: 'Low Net Margin Risk (Predatory/Deficit Warning)',
      nameBn: 'স্বল্প নিট মুনাফার ঝুঁকি (ঘাটতি বা ঝুঁকিপূর্ণ দর)',
      descriptionEn: `Net blended margin is ${boqSummary.blendedMarginPercent.toFixed(1)}% (recommended threshold $\\ge 8.0\\%$).`,
      descriptionBn: `নিট প্রফিট মার্জিন মাত্র ${boqSummary.blendedMarginPercent.toFixed(1)}% (পরামর্শকৃত নিরাপদ সীমা নূন্যতম ৮%)।`,
      status: 'warning',
      scoreImpact: 10,
      details: 'Margins under 8% leave insufficient cushion for currency fluctuations, supply delays, or unforeseen penalties.',
      recommendationEn: 'Add a 3-5% risk contingency buffer in labor or services sub-lines.',
      recommendationBn: 'সার্ভিস বা অতিরিক্ত খরচে ৩-৫% কন্টিনজেন্সি বাফার যোগ করুন।',
    });
  } else {
    checkItems.push({
      id: 'chk-fin-budget',
      category: 'financial',
      nameEn: 'Financial BOQ & Profit Margin Health',
      nameBn: 'আর্থিক বিওকিউ এবং নিট মুনাফার স্থিতিশীলতা',
      descriptionEn: `Bid is competitive at ${tender.currency} ${boqSummary.totalBidPrice.toLocaleString()} with sound ${boqSummary.blendedMarginPercent.toFixed(1)}% margin within budget ceiling.`,
      descriptionBn: `দরপত্র মূল্য প্রতিযোগিতামূলক (${tender.currency} ${boqSummary.totalBidPrice.toLocaleString()}) এবং সুস্থ ${boqSummary.blendedMarginPercent.toFixed(1)}% মার্জিন বিদ্যমান।`,
      status: 'passed',
      scoreImpact: 20,
      details: 'Base cost, VAT/tax deductions, overheads, and target profit properly amortized.',
      recommendationEn: 'Double check mathematical extensions in Excel/CSV export before sign-off.',
      recommendationBn: 'চূড়ান্ত স্বাক্ষরের আগে এক্সেল/সিএসভি ফাইলে গাণিতিক যোগফল পুনরায় মিলিয়ে নিন।',
    });
  }

  // 5. Key Personnel & Experience Verification
  const totalYearsExp = tender.personnel.reduce((acc, p) => acc + p.yearsOfExp, 0);
  const avgExp = tender.personnel.length > 0 ? totalYearsExp / tender.personnel.length : 0;
  const hasProjectManager = tender.personnel.some((p) => p.role.toLowerCase().includes('manager') || p.role.toLowerCase().includes('lead') || p.certifications.some((c) => c.includes('PMP')));

  if (tender.personnel.length >= 3 && hasProjectManager && avgExp >= 7) {
    checkItems.push({
      id: 'chk-team-personnel',
      category: 'personnel',
      nameEn: 'Key Personnel & Professional Certification Matrix',
      nameBn: 'মূল জনবল ও প্রফেশনাল সনদ মূল্যায়ন',
      descriptionEn: `${tender.personnel.length} certified experts proposed with average ${avgExp.toFixed(1)} years industry experience and verified PMP/Lead.`,
      descriptionBn: `${tender.personnel.length} জন সার্টিফাইড বিশেষজ্ঞ নিয়োজিত (গড় অভিজ্ঞতা ${avgExp.toFixed(1)} বছর এবং পিএমপি/লিড অন্তর্ভুক্ত)।`,
      status: 'passed',
      scoreImpact: 15,
      details: 'CVs match RFP minimum experience criteria for key professional roles.',
      recommendationEn: 'Ensure signed CV consent forms and academic certificates are attached.',
      recommendationBn: 'বিশেষজ্ঞদের স্বাক্ষরিত জীবনবৃত্তান্ত ও শিক্ষাগত সনদ যুক্ত করা নিশ্চিত করুন।',
    });
  } else if (tender.personnel.length === 0 || !hasProjectManager) {
    checkItems.push({
      id: 'chk-team-personnel',
      category: 'personnel',
      nameEn: 'Inadequate Key Personnel Allocation',
      nameBn: 'প্রস্তাবিত প্রধান জনবলের ঘাটতি',
      descriptionEn: 'Missing certified Project Manager or insufficient staffing allocations for critical tracks.',
      descriptionBn: 'সার্টিফাইড প্রকল্প ব্যবস্থাপক বা পর্যাপ্ত কারিগরি বিশেষজ্ঞের ঘাটতি রয়েছে।',
      status: 'failed',
      scoreImpact: -15,
      details: 'Staffing grid fails technical evaluation threshold.',
      recommendationEn: 'Assign certified senior leads with verified CVs.',
      recommendationBn: 'অভিজ্ঞ সিনিয়র বিশেষজ্ঞদের দায়িত্ব বণ্টন করুন।',
    });
  } else {
    checkItems.push({
      id: 'chk-team-personnel',
      category: 'personnel',
      nameEn: 'Lean Project Team Allocation',
      nameBn: 'সীমিত প্রকল্প কর্মী বরাদ্দ',
      descriptionEn: `Team has ${tender.personnel.length} specialists. Consider adding backup technical capacity.`,
      descriptionBn: `দলে ${tender.personnel.length} জন বিশেষজ্ঞ রয়েছেন। ব্যাকআপ কারিগরি সদস্য অন্তর্ভুক্ত করা ভালো।`,
      status: 'warning',
      scoreImpact: 8,
      details: 'Core roles filled, but bench strength could be strengthened.',
      recommendationEn: 'Include designated assistant leads to boost technical evaluation marks.',
      recommendationBn: 'কারিগরি মূল্যায়নে অতিরিক্ত নম্বর পেতে সহকারী লিড যুক্ত করুন।',
    });
  }

  // 6. Submission Deadline & SLA Feasibility
  const deadlineDate = new Date(tender.submissionDeadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    checkItems.push({
      id: 'chk-time-deadline',
      category: 'timeline',
      nameEn: 'Submission Deadline Has Passed',
      nameBn: 'দরপত্র জমা দেওয়ার সময়সীমা অতিক্রান্ত হয়েছে',
      descriptionEn: `Deadline was on ${deadlineDate.toLocaleDateString()}. E-portal submission window is closed.`,
      descriptionBn: `সময়সীমা ${deadlineDate.toLocaleDateString()} তারিখে শেষ হয়েছে।`,
      status: 'failed',
      scoreImpact: -30,
      details: 'Submission portal lockouts occur immediately upon deadline timestamp expiration.',
      recommendationEn: 'Check with procuring entity if extension addendum has been published.',
      recommendationBn: 'সময় বৃদ্ধির কোনো সংশোধনী (Addendum) প্রকাশিত হয়েছে কি না তা যাচাই করুন।',
    });
  } else if (diffDays <= 3) {
    checkItems.push({
      id: 'chk-time-deadline',
      category: 'timeline',
      nameEn: 'Urgent Submission Window (< 72 Hours Remaining)',
      nameBn: 'জরুরি দাখিল সতর্কতা (৭২ ঘণ্টারও কম বাকি)',
      descriptionEn: `Only ${diffDays} day(s) remain until official tender box closing.`,
      descriptionBn: `দরপত্র বক্স বন্ধ হতে মাত্র ${diffDays} দিন বাকি আছে।`,
      status: 'warning',
      scoreImpact: 5,
      details: 'Late portal uploads often suffer traffic congestion; submit minimum 12 hours early.',
      recommendationEn: 'Complete all digital signatures and upload 12-24 hours ahead of schedule.',
      recommendationBn: 'সার্ভার জ্যাম এড়াতে ১২-২৪ ঘণ্টা আগেই ই-জিপি পোর্টালে আপলোড সম্পন্ন করুন।',
    });
  } else {
    checkItems.push({
      id: 'chk-time-deadline',
      category: 'timeline',
      nameEn: 'Healthy Submission Preparation Window',
      nameBn: 'যথেষ্ট প্রস্তুতিমূলক সময়সীমা বিদ্যমান',
      descriptionEn: `${diffDays} days remaining until deadline (${deadlineDate.toLocaleDateString()}).`,
      descriptionBn: `জমা দেওয়ার জন্য আরও ${diffDays} দিন সময় রয়েছে (${deadlineDate.toLocaleDateString()})।`,
      status: 'passed',
      scoreImpact: 10,
      details: 'Adequate runway for internal peer review, legal audit, and senior management sign-off.',
      recommendationEn: 'Schedule final red-team review 3 days prior to tender closing.',
      recommendationBn: 'দরপত্র দাখিলের ৩ দিন পূর্বে চূড়ান্ত অভ্যন্তরীণ রেড-টিম রিভিউ করুন।',
    });
  }

  // Compute final scores
  const passedTests = checkItems.filter((i) => i.status === 'passed').length;
  const warningsCount = checkItems.filter((i) => i.status === 'warning').length;
  const criticalIssuesCount = checkItems.filter((i) => i.status === 'failed').length;
  const totalTests = checkItems.length;

  let rawScore = 0;
  checkItems.forEach((item) => {
    if (item.status === 'passed') rawScore += item.scoreImpact;
    else if (item.status === 'warning') rawScore += item.scoreImpact * 0.6;
    // failed gets 0 or negative
  });

  const overallScore = Math.max(0, Math.min(100, Math.round((rawScore / 100) * 100)));

  let qualificationVerdict: 'QUALIFIED' | 'CONDITIONAL' | 'DISQUALIFIED';
  if (criticalIssuesCount > 0 || overallScore < 50) {
    qualificationVerdict = 'DISQUALIFIED';
  } else if (warningsCount > 0 || overallScore < 80) {
    qualificationVerdict = 'CONDITIONAL';
  } else {
    qualificationVerdict = 'QUALIFIED';
  }

  // Component breakdown scores
  const documentationScore = missingMandatoryDocs.length === 0 ? 100 : Math.max(20, Math.round((1 - missingMandatoryDocs.length / mandatoryDocs.length) * 100));
  const complianceRatioScore = tender.complianceClauses.length > 0 
    ? Math.round((tender.complianceClauses.filter(c => c.status === 'compliant' || c.status === 'exceeds').length / tender.complianceClauses.length) * 100)
    : 100;
  const financialSanityScore = boqSummary.isOverBudget ? 35 : (boqSummary.blendedMarginPercent >= 8 ? 95 : 70);

  return {
    overallScore,
    qualificationVerdict,
    passedTests,
    totalTests,
    criticalIssuesCount,
    warningsCount,
    financialSanityScore,
    complianceRatioScore,
    documentationScore,
    checkItems,
    timestamp: new Date().toISOString(),
  };
}
