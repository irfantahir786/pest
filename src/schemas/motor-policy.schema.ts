import { z } from 'zod';

// Schema for a field with confidence
const FieldSchema = z.object({
  value: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  source: z.string().nullable()
});

// Policy Information Schema
const PolicyInfoSchema = z.object({
  policyNumber: FieldSchema,
  policyType: FieldSchema,
  policyStatus: FieldSchema,
  issueDate: FieldSchema,
  startDate: FieldSchema,
  expiryDate: FieldSchema,
  previousPolicyNumber: FieldSchema,
  previousInsurer: FieldSchema,
  previousPolicyExpiryDate: FieldSchema,
  proposalNumber: FieldSchema,
  certificateNumber: FieldSchema,
  coverNoteNumber: FieldSchema,
  transactionReferenceNumber: FieldSchema,
  productName: FieldSchema,
  productCode: FieldSchema,
  policyTenure: FieldSchema,
  issuanceBranch: FieldSchema,
  issuanceLocation: FieldSchema
});

// Insurer Information Schema
const InsurerInfoSchema = z.object({
  companyName: FieldSchema,
  address: FieldSchema,
  irdaiRegistrationNumber: FieldSchema,
  irdaiLicenseDetails: FieldSchema,
  gstin: FieldSchema,
  cin: FieldSchema,
  customerCareNumber: FieldSchema,
  email: FieldSchema,
  website: FieldSchema,
  branchDetails: FieldSchema
});

// Insured/Policyholder Information Schema
const InsuredInfoSchema = z.object({
  fullName: FieldSchema,
  address: FieldSchema,
  city: FieldSchema,
  state: FieldSchema,
  pinCode: FieldSchema,
  mobileNumber: FieldSchema,
  email: FieldSchema,
  pan: FieldSchema,
  gstin: FieldSchema,
  customerId: FieldSchema,
  dateOfBirth: FieldSchema,
  gender: FieldSchema
});

// Vehicle Information Schema
const VehicleInfoSchema = z.object({
  registrationNumber: FieldSchema,
  registrationDate: FieldSchema,
  registrationState: FieldSchema,
  registrationRTO: FieldSchema,
  make: FieldSchema,
  manufacturer: FieldSchema,
  model: FieldSchema,
  variant: FieldSchema,
  vehicleType: FieldSchema,
  vehicleCategory: FieldSchema,
  fuelType: FieldSchema,
  engineNumber: FieldSchema,
  chassisNumber: FieldSchema,
  vin: FieldSchema,
  engineCapacity: FieldSchema,
  seatingCapacity: FieldSchema,
  manufacturingYear: FieldSchema,
  manufacturingMonthYear: FieldSchema,
  color: FieldSchema,
  usage: FieldSchema,
  classification: FieldSchema,
  gvw: FieldSchema,
  cubicCapacity: FieldSchema,
  numberOfWheels: FieldSchema,
  registrationAuthority: FieldSchema
});

// Coverage Information Schema
const CoverageInfoSchema = z.object({
  ownDamageCover: FieldSchema,
  thirdPartyLiabilityCover: FieldSchema,
  comprehensivePolicy: FieldSchema,
  standaloneOwnDamage: FieldSchema,
  thirdPartyPolicy: FieldSchema,
  personalAccidentCover: FieldSchema,
  ownerDriverPACover: FieldSchema,
  paSumInsured: FieldSchema,
  passengerPACover: FieldSchema,
  numberOfPassengersCovered: FieldSchema,
  zeroDepreciationCover: FieldSchema,
  engineProtectionCover: FieldSchema,
  roadsideAssistance: FieldSchema,
  returnToInvoice: FieldSchema,
  consumablesCover: FieldSchema,
  keyReplacement: FieldSchema,
  tyreProtection: FieldSchema,
  otherAddOns: FieldSchema,
  addOnPremiumDetails: FieldSchema
});

// Premium Information Schema
const PremiumInfoSchema = z.object({
  idv: FieldSchema,
  basicODPremium: FieldSchema,
  thirdPartyPremium: FieldSchema,
  paPremium: FieldSchema,
  addOnPremium: FieldSchema,
  discount: FieldSchema,
  ncbPercentage: FieldSchema,
  ncbAmount: FieldSchema,
  voluntaryDeductible: FieldSchema,
  compulsoryDeductible: FieldSchema,
  totalPremium: FieldSchema,
  gst: FieldSchema,
  cgst: FieldSchema,
  sgst: FieldSchema,
  igst: FieldSchema,
  cess: FieldSchema,
  otherTaxes: FieldSchema,
  finalPayablePremium: FieldSchema
});

// IDV Information Schema
const IDVInfoSchema = z.object({
  idv: FieldSchema,
  electricalAccessoriesValue: FieldSchema,
  nonElectricalAccessoriesValue: FieldSchema,
  cngLpgKitValue: FieldSchema,
  totalInsuredValue: FieldSchema,
  depreciationDetails: FieldSchema,
  marketValue: FieldSchema
});

// NCB Information Schema
const NCBInfoSchema = z.object({
  ncbPercentage: FieldSchema,
  ncbAmount: FieldSchema,
  previousYearNCB: FieldSchema,
  currentYearNCB: FieldSchema,
  ncbDeclaration: FieldSchema
});

// Financier Information Schema
const FinancierInfoSchema = z.object({
  financierName: FieldSchema,
  financierAddress: FieldSchema,
  hypothecationStatus: FieldSchema,
  loanAccountReferenceNumber: FieldSchema
});

// Previous Insurance Information Schema
const PreviousInsuranceInfoSchema = z.object({
  previousInsurer: FieldSchema,
  previousPolicyNumber: FieldSchema,
  previousPolicyPeriod: FieldSchema,
  previousClaimStatus: FieldSchema,
  claimCount: FieldSchema,
  ncbFromPreviousPolicy: FieldSchema,
  previousPolicyExpiryDate: FieldSchema
});

// Driver Information Schema
const DriverInfoSchema = z.object({
  driverName: FieldSchema,
  licenseNumber: FieldSchema,
  driverAge: FieldSchema,
  driverQualification: FieldSchema,
  driverOccupation: FieldSchema,
  driverRestrictions: FieldSchema
});

// Regulatory Information Schema
const RegulatoryInfoSchema = z.object({
  irdaiRegistrationNumber: FieldSchema,
  gstin: FieldSchema,
  uin: FieldSchema,
  productUIN: FieldSchema,
  policyWordingCode: FieldSchema,
  regulatoryReferences: FieldSchema,
  mandatoryDeclarations: FieldSchema
});

// Extraction Metadata Schema
const ExtractionMetadataSchema = z.object({
  method: z.enum(['pdf_text', 'ocr', 'hybrid']),
  confidence: z.number().min(0).max(1),
  pages: z.number().int().positive(),
  warnings: z.array(z.string())
});

// Main Document Schema
const MotorPolicyDocumentSchema = z.object({
  documentType: z.literal('motor_insurance_policy'),
  insurer: InsurerInfoSchema,
  policy: PolicyInfoSchema,
  insured: InsuredInfoSchema,
  vehicle: VehicleInfoSchema,
  coverage: CoverageInfoSchema,
  premium: PremiumInfoSchema,
  idv: IDVInfoSchema,
  ncb: NCBInfoSchema,
  financier: FinancierInfoSchema,
  previousInsurance: PreviousInsuranceInfoSchema,
  driver: DriverInfoSchema,
  regulatory: RegulatoryInfoSchema
});

// Full Response Schema
const ExtractionResponseSchema = z.object({
  document: MotorPolicyDocumentSchema,
  extraction: ExtractionMetadataSchema
});

export type FieldData = z.infer<typeof FieldSchema>;
export type PolicyInfo = z.infer<typeof PolicyInfoSchema>;
export type InsurerInfo = z.infer<typeof InsurerInfoSchema>;
export type InsuredInfo = z.infer<typeof InsuredInfoSchema>;
export type VehicleInfo = z.infer<typeof VehicleInfoSchema>;
export type CoverageInfo = z.infer<typeof CoverageInfoSchema>;
export type PremiumInfo = z.infer<typeof PremiumInfoSchema>;
export type IDVInfo = z.infer<typeof IDVInfoSchema>;
export type NCBInfo = z.infer<typeof NCBInfoSchema>;
export type FinancierInfo = z.infer<typeof FinancierInfoSchema>;
export type PreviousInsuranceInfo = z.infer<typeof PreviousInsuranceInfoSchema>;
export type DriverInfo = z.infer<typeof DriverInfoSchema>;
export type RegulatoryInfo = z.infer<typeof RegulatoryInfoSchema>;
export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>;
export type MotorPolicyDocument = z.infer<typeof MotorPolicyDocumentSchema>;
export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;

export { 
  FieldSchema,
  MotorPolicyDocumentSchema,
  ExtractionResponseSchema,
  ExtractionMetadataSchema
};
