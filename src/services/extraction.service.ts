import { pdfService } from './pdf.service';
import { ocrService } from './ocr.service';
import { policyExtractor } from '../extractors/policy.extractor';
import { vehicleExtractor } from '../extractors/vehicle.extractor';
import { FieldData, MotorPolicyDocument } from '../schemas/motor-policy.schema';

export interface ExtractionResult {
  document: MotorPolicyDocument;
  extraction: {
    method: 'pdf_text' | 'ocr' | 'hybrid';
    confidence: number;
    pages: number;
    warnings: string[];
  };
  rawText: string;
}

const emptyField: FieldData = { value: null, confidence: 0, source: null };

export class ExtractionService {
  async extract(filePath: string, mimeType: string): Promise<ExtractionResult> {
    let text = '';
    let method: 'pdf_text' | 'ocr' | 'hybrid' = 'pdf_text';
    let pages = 0;
    let confidence = 0;
    const warnings: string[] = [];

    try {
      if (mimeType === 'application/pdf') {
        try {
          const pdfResult = await pdfService.extractText(filePath);
          text = pdfResult.text;
          pages = pdfResult.pages;
          
          if (text.trim().length < 100) {
            warnings.push('Low text content extracted from PDF, may be scanned document');
            method = 'hybrid';
            
            try {
              const ocrResult = await ocrService.processFile(filePath, mimeType);
              if (ocrResult.text.trim().length > text.trim().length) {
                text = ocrResult.text;
                method = 'ocr';
                confidence = ocrResult.confidence;
                pages = ocrResult.pages;
              }
            } catch {
              warnings.push('OCR fallback failed');
            }
          } else {
            confidence = 0.9;
          }
        } catch {
          warnings.push('PDF extraction failed, trying OCR');
          method = 'ocr';
          
          const ocrResult = await ocrService.processFile(filePath, mimeType);
          text = ocrResult.text;
          pages = ocrResult.pages;
          confidence = ocrResult.confidence;
        }
      } else if (mimeType.startsWith('image/')) {
        method = 'ocr';
        const ocrResult = await ocrService.processFile(filePath, mimeType);
        text = ocrResult.text;
        pages = ocrResult.pages;
        confidence = ocrResult.confidence;
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      if (!text || text.trim().length === 0) {
        throw new Error('Unable to extract readable content from this document');
      }

      const policyInfo = policyExtractor.extract(text);
      const vehicleInfo = vehicleExtractor.extract(text);
      
      const documentData: MotorPolicyDocument = {
        documentType: 'motor_insurance_policy',
        insurer: {
          companyName: emptyField, address: emptyField, irdaiRegistrationNumber: emptyField,
          irdaiLicenseDetails: emptyField, gstin: emptyField, cin: emptyField,
          customerCareNumber: emptyField, email: emptyField, website: emptyField, branchDetails: emptyField
        },
        policy: policyInfo,
        insured: {
          fullName: emptyField, address: emptyField, city: emptyField, state: emptyField,
          pinCode: emptyField, mobileNumber: emptyField, email: emptyField, pan: emptyField,
          gstin: emptyField, customerId: emptyField, dateOfBirth: emptyField, gender: emptyField
        },
        vehicle: vehicleInfo,
        coverage: {
          ownDamageCover: emptyField, thirdPartyLiabilityCover: emptyField, comprehensivePolicy: emptyField,
          standaloneOwnDamage: emptyField, thirdPartyPolicy: emptyField, personalAccidentCover: emptyField,
          ownerDriverPACover: emptyField, paSumInsured: emptyField, passengerPACover: emptyField,
          numberOfPassengersCovered: emptyField, zeroDepreciationCover: emptyField, engineProtectionCover: emptyField,
          roadsideAssistance: emptyField, returnToInvoice: emptyField, consumablesCover: emptyField,
          keyReplacement: emptyField, tyreProtection: emptyField, otherAddOns: emptyField, addOnPremiumDetails: emptyField
        },
        premium: {
          idv: emptyField, basicODPremium: emptyField, thirdPartyPremium: emptyField,
          paPremium: emptyField, addOnPremium: emptyField, discount: emptyField,
          ncbPercentage: emptyField, ncbAmount: emptyField, voluntaryDeductible: emptyField,
          compulsoryDeductible: emptyField, totalPremium: emptyField, gst: emptyField,
          cgst: emptyField, sgst: emptyField, igst: emptyField, cess: emptyField,
          otherTaxes: emptyField, finalPayablePremium: emptyField
        },
        idv: {
          idv: emptyField, electricalAccessoriesValue: emptyField, nonElectricalAccessoriesValue: emptyField,
          cngLpgKitValue: emptyField, totalInsuredValue: emptyField, depreciationDetails: emptyField, marketValue: emptyField
        },
        ncb: {
          ncbPercentage: emptyField, ncbAmount: emptyField, previousYearNCB: emptyField,
          currentYearNCB: emptyField, ncbDeclaration: emptyField
        },
        financier: {
          financierName: emptyField, financierAddress: emptyField, hypothecationStatus: emptyField,
          loanAccountReferenceNumber: emptyField
        },
        previousInsurance: {
          previousInsurer: emptyField, previousPolicyNumber: emptyField, previousPolicyPeriod: emptyField,
          previousClaimStatus: emptyField, claimCount: emptyField, ncbFromPreviousPolicy: emptyField,
          previousPolicyExpiryDate: emptyField
        },
        driver: {
          driverName: emptyField, licenseNumber: emptyField, driverAge: emptyField,
          driverQualification: emptyField, driverOccupation: emptyField, driverRestrictions: emptyField
        },
        regulatory: {
          irdaiRegistrationNumber: emptyField, gstin: emptyField, uin: emptyField,
          productUIN: emptyField, policyWordingCode: emptyField, regulatoryReferences: emptyField,
          mandatoryDeclarations: emptyField
        }
      };

      const calculatedConfidence = this.calculateOverallConfidence(documentData);
      
      return {
        rawText: text,
        document: documentData,
        extraction: {
          method,
          confidence: confidence || calculatedConfidence,
          pages,
          warnings
        }
      };
    } catch (error) {
      throw error;
    }
  }

  private calculateOverallConfidence(document: MotorPolicyDocument): number {
    let totalConfidence = 0;
    let fieldCount = 0;

    const sections = [
      document.policy, document.vehicle, document.insured,
      document.insurer, document.coverage, document.premium
    ];

    for (const section of sections) {
      for (const key in section) {
        const field = section[key as keyof typeof section] as FieldData;
        if (field && typeof field.confidence === 'number') {
          totalConfidence += field.confidence;
          fieldCount++;
        }
      }
    }

    return fieldCount > 0 ? Math.round((totalConfidence / fieldCount) * 100) / 100 : 0;
  }
}

export const extractionService = new ExtractionService();
