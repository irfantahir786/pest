import { FieldData, PolicyInfo } from '../schemas/motor-policy.schema';
import { extractValueAfterLabel, containsKeyword } from '../utils/text.utils';
import { parseDate } from '../utils/date.utils';

const POLICY_NUMBER_LABELS = ['Policy No', 'Policy Number', 'Policy No.', 'Policy #', 'Certificate No', 'Certificate Number', 'Registration Mark', 'Regn. No'];
const POLICY_TYPE_LABELS = ['Policy Type', 'Type of Policy', 'Cover Type', 'Type of Cover'];
const ISSUE_DATE_LABELS = ['Issue Date', 'Policy Issue Date', 'Date of Issue', 'Issued On'];
const START_DATE_LABELS = ['Start Date', 'Policy Start Date', 'Coverage Start Date', 'Effective Date', 'Commencement Date', 'From Date'];
const EXPIRY_DATE_LABELS = ['Expiry Date', 'Policy Expiry Date', 'Coverage Expiry Date', 'End Date', 'Valid Till', 'To Date', 'Expires On'];

export class PolicyExtractor {
  extract(text: string): PolicyInfo {
    return {
      policyNumber: this.extractField(text, POLICY_NUMBER_LABELS, 50),
      policyType: this.extractPolicyType(text),
      policyStatus: this.extractField(text, ['Policy Status', 'Status'], 50),
      issueDate: this.extractDateField(text, ISSUE_DATE_LABELS),
      startDate: this.extractDateField(text, START_DATE_LABELS),
      expiryDate: this.extractDateField(text, EXPIRY_DATE_LABELS),
      previousPolicyNumber: this.extractField(text, ['Previous Policy No', 'Previous Policy Number', 'Expiring Policy No'], 50),
      previousInsurer: this.extractField(text, ['Previous Insurer', 'Prior Insurer', 'Existing Insurer'], 100),
      previousPolicyExpiryDate: this.extractDateField(text, ['Previous Policy Expiry', 'Expiring Policy Date'], 30),
      proposalNumber: this.extractField(text, ['Proposal No', 'Proposal Number', 'Proposal No.'], 50),
      certificateNumber: this.extractField(text, ['Certificate No', 'Certificate Number', 'Cert No'], 50),
      coverNoteNumber: this.extractField(text, ['Cover Note No', 'Cover Note Number'], 50),
      transactionReferenceNumber: this.extractField(text, ['Transaction Ref', 'Reference No', 'Ref No', 'Transaction ID'], 50),
      productName: this.extractField(text, ['Product Name', 'Plan Name', 'Scheme Name'], 100),
      productCode: this.extractField(text, ['Product Code', 'Plan Code', 'UIN'], 30),
      policyTenure: this.extractField(text, ['Policy Tenure', 'Policy Period', 'Tenure'], 50),
      issuanceBranch: this.extractField(text, ['Issuing Branch', 'Branch', 'Service Branch'], 100),
      issuanceLocation: this.extractField(text, ['Issuing Location', 'Place of Issue', 'Location'], 100)
    };
  }

  private extractField(text: string, labels: string[], maxLength: number): FieldData {
    const result = extractValueAfterLabel(text, labels, { maxLength });
    if (result.value) {
      return { value: result.value.trim(), confidence: result.confidence, source: result.source };
    }
    return { value: null, confidence: 0, source: null };
  }

  private extractDateField(text: string, labels: string[]): FieldData {
    const result = extractValueAfterLabel(text, labels, { maxLength: 30 });
    if (result.value) {
      const parsed = parseDate(result.value);
      return { value: parsed.normalized || result.value, confidence: parsed.normalized ? 0.9 : result.confidence, source: result.source };
    }
    return { value: null, confidence: 0, source: null };
  }

  private extractPolicyType(text: string): FieldData {
    const types = ['Comprehensive', 'Third Party', 'TP', 'Own Damage', 'OD', 'Standalone Own Damage', 'SOD', 'Package Policy'];
    for (const type of types) {
      if (containsKeyword(text, [type])) {
        return { value: type, confidence: 0.8, source: 'keyword_match' };
      }
    }
    return this.extractField(text, POLICY_TYPE_LABELS, 100);
  }
}

export const policyExtractor = new PolicyExtractor();
