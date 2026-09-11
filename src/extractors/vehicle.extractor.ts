import { FieldData } from '../schemas/motor-policy.schema';
import { extractValueAfterLabel, containsKeyword } from '../utils/text.utils';
import { parseRegistrationNumber, VEHICLE_MANUFACTURERS, FUEL_TYPES, VEHICLE_TYPES } from '../utils/vehicle.utils';

export class VehicleExtractor {
  extract(text: string): Record<string, FieldData> {
    return {
      registrationNumber: this.extractRegistrationNumber(text),
      registrationDate: this.extractRegistrationDate(text),
      registrationState: this.extractRegistrationState(text),
      registrationRTO: this.extractRegistrationRTO(text),
      make: this.extractMake(text),
      manufacturer: this.extractManufacturer(text),
      model: this.extractModel(text),
      variant: this.extractVariant(text),
      vehicleType: this.extractVehicleType(text),
      vehicleCategory: this.extractVehicleCategory(text),
      fuelType: this.extractFuelType(text),
      engineNumber: this.extractEngineNumber(text),
      chassisNumber: this.extractChassisNumber(text),
      vin: this.extractVIN(text),
      engineCapacity: this.extractEngineCapacity(text),
      seatingCapacity: this.extractSeatingCapacity(text),
      manufacturingYear: this.extractManufacturingYear(text),
      manufacturingMonthYear: this.extractManufacturingMonthYear(text),
      color: this.extractColor(text),
      usage: this.extractUsage(text),
      classification: this.extractClassification(text),
      gvw: this.extractGVW(text),
      cubicCapacity: this.extractCubicCapacity(text),
      numberOfWheels: this.extractNumberOfWheels(text),
      registrationAuthority: this.extractRegistrationAuthority(text)
    };
  }

  private extractRegistrationNumber(text: string): FieldData {
    const labels = ['Registration No', 'Registration Number', 'Regn. No', 'Reg No', 
                    'Vehicle Reg. No', 'Registration Mark', 'License Plate'];
    const result = extractValueAfterLabel(text, labels, { maxLength: 20 });
    
    if (result.value) {
      const parsed = parseRegistrationNumber(result.value);
      return {
        value: parsed.original,
        confidence: parsed.confidence,
        source: result.source
      };
    }
    
    // Try pattern matching
    const patterns = [
      /([A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,2}\s*\d{4})/gi,
      /([A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4})/gi
    ];
    
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        const parsed = parseRegistrationNumber(match[1]);
        if (parsed.confidence > 0.5) {
          return { value: parsed.original, confidence: parsed.confidence, source: 'pattern' };
        }
      }
    }
    
    return { value: null, confidence: 0, source: null };
  }

  private extractRegistrationDate(text: string): FieldData {
    const labels = ['Registration Date', 'Date of Registration', 'Regn. Date', 'First Registration'];
    return extractValueAfterLabel(text, labels, { maxLength: 30 });
  }

  private extractRegistrationState(text: string): FieldData {
    const regNo = this.extractRegistrationNumber(text);
    if (regNo.value) {
      const parsed = parseRegistrationNumber(regNo.value);
      if (parsed.stateName) {
        return { value: parsed.stateName, confidence: parsed.confidence, source: 'derived_from_reg' };
      }
    }
    return { value: null, confidence: 0, source: null };
  }

  private extractRegistrationRTO(text: string): FieldData {
    const regNo = this.extractRegistrationNumber(text);
    if (regNo.value) {
      const parsed = parseRegistrationNumber(regNo.value);
      if (parsed.rtoNumber) {
        return { value: parsed.rtoNumber, confidence: parsed.confidence, source: 'derived_from_reg' };
      }
    }
    return { value: null, confidence: 0, source: null };
  }

  private extractMake(text: string): FieldData {
    const labels = ['Make', 'Vehicle Make', 'Car Make', 'Bike Make'];
    const result = extractValueAfterLabel(text, labels, { maxLength: 50 });
    
    if (result.value) {
      // Check against known manufacturers
      for (const mfr of VEHICLE_MANUFACTURERS) {
        if (result.value!.toLowerCase().includes(mfr.toLowerCase())) {
          return { value: mfr, confidence: 0.9, source: result.source };
        }
      }
      return { value: result.value!.trim(), confidence: result.confidence, source: result.source };
    }
    
    // Try to find manufacturer in text
    for (const mfr of VEHICLE_MANUFACTURERS) {
      if (containsKeyword(text, [mfr])) {
        return { value: mfr, confidence: 0.7, source: 'keyword_match' };
      }
    }
    
    return { value: null, confidence: 0, source: null };
  }

  private extractManufacturer(text: string): FieldData {
    return this.extractMake(text); // Same as make for most cases
  }

  private extractModel(text: string): FieldData {
    const labels = ['Model', 'Vehicle Model', 'Car Model', 'Bike Model', 'Variant'];
    return extractValueAfterLabel(text, labels, { maxLength: 100 });
  }

  private extractVariant(text: string): FieldData {
    const labels = ['Variant', 'Trim', 'Version', 'Edition'];
    return extractValueAfterLabel(text, labels, { maxLength: 100 });
  }

  private extractVehicleType(text: string): FieldData {
    for (const type of VEHICLE_TYPES) {
      if (containsKeyword(text, [type])) {
        return { value: type, confidence: 0.8, source: 'keyword_match' };
      }
    }
    
    const labels = ['Vehicle Type', 'Type of Vehicle', 'Body Type', 'Class'];
    return extractValueAfterLabel(text, labels, { maxLength: 50 });
  }

  private extractVehicleCategory(text: string): FieldData {
    const categories = ['Two Wheeler', 'Three Wheeler', 'Four Wheeler', 'LMV', 'HMV', 
                       'Motor Cycle', 'Motor Car', 'Commercial Vehicle', 'Private Vehicle'];
    for (const cat of categories) {
      if (containsKeyword(text, [cat])) {
        return { value: cat, confidence: 0.8, source: 'keyword_match' };
      }
    }
    return { value: null, confidence: 0, source: null };
  }

  private extractFuelType(text: string): FieldData {
    for (const fuel of FUEL_TYPES) {
      if (containsKeyword(text, [fuel])) {
        return { value: fuel, confidence: 0.85, source: 'keyword_match' };
      }
    }
    
    const labels = ['Fuel Type', 'Fuel', 'Propulsion'];
    return extractValueAfterLabel(text, labels, { maxLength: 30 });
  }

  private extractEngineNumber(text: string): FieldData {
    const labels = ['Engine No', 'Engine Number', 'Engine No.', 'Engine #'];
    return extractValueAfterLabel(text, labels, { maxLength: 50 });
  }

  private extractChassisNumber(text: string): FieldData {
    const labels = ['Chassis No', 'Chassis Number', 'Chassis No.', 'Chassis #', 
                    'Frame Number', 'Frame No'];
    return extractValueAfterLabel(text, labels, { maxLength: 50 });
  }

  private extractVIN(text: string): FieldData {
    const labels = ['VIN', 'Vehicle Identification Number', 'Frame No'];
    const result = extractValueAfterLabel(text, labels, { maxLength: 30 });
    
    if (result.value) {
      return { value: result.value!.toUpperCase().replace(/\s/g, ''), confidence: result.confidence, source: result.source };
    }
    
    // VIN pattern - 17 characters alphanumeric
    const vinPattern = /\b([A-HJ-NPR-Z0-9]{17})\b/i;
    const match = vinPattern.exec(text);
    if (match) {
      return { value: match[1].toUpperCase(), confidence: 0.7, source: 'pattern' };
    }
    
    return { value: null, confidence: 0, source: null };
  }

  private extractEngineCapacity(text: string): FieldData {
    const labels = ['Engine Capacity', 'CC', 'Cubic Capacity', 'Displacement', 'Engine CC'];
    const result = extractValueAfterLabel(text, labels, { maxLength: 20 });
    
    if (result.value) {
      return { value: result.value!.replace(/cc/i, '').trim(), confidence: result.confidence, source: result.source };
    }
    
    // Pattern like "1197 cc" or "1498cc"
    const ccPattern = /(\d{3,4})\s*cc/i;
    const match = ccPattern.exec(text);
    if (match) {
      return { value: `${match[1]} cc`, confidence: 0.7, source: 'pattern' };
    }
    
    return { value: null, confidence: 0, source: null };
  }

  private extractSeatingCapacity(text: string): FieldData {
    const labels = ['Seating Capacity', 'Seats', 'No of Seats', 'Passengers'];
    return extractValueAfterLabel(text, labels, { maxLength: 10 });
  }

  private extractManufacturingYear(text: string): FieldData {
    const labels = ['Manufacturing Year', 'Mfg Year', 'Year of Mfg', 'Built Year'];
    const result = extractValueAfterLabel(text, labels, { maxLength: 10 });
    
    if (result.value && /^\d{4}$/.test(result.value.trim())) {
      return { value: result.value.trim(), confidence: result.confidence, source: result.source };
    }
    
    // Look for year pattern near manufacturing keywords
    const patterns = [/manufactured[:\s]*(\d{4})/i, /built[:\s]*(\d{4})/i];
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        return { value: match[1], confidence: 0.7, source: 'pattern' };
      }
    }
    
    return { value: null, confidence: 0, source: null };
  }

  private extractManufacturingMonthYear(text: string): FieldData {
    const labels = ['Manufacturing Date', 'Mfg Date', 'Date of Mfg', 'Built Date'];
    return extractValueAfterLabel(text, labels, { maxLength: 30 });
  }

  private extractColor(text: string): FieldData {
    const labels = ['Color', 'Colour', 'Vehicle Color', 'Paint Color'];
    return extractValueAfterLabel(text, labels, { maxLength: 30 });
  }

  private extractUsage(text: string): FieldData {
    const usages = ['Private Use', 'Personal Use', 'Commercial Use', 'Transport Use', 
                   'Non-Transport', 'Taxi', 'Rental', 'Self Drive'];
    for (const usage of usages) {
      if (containsKeyword(text, [usage])) {
        return { value: usage, confidence: 0.8, source: 'keyword_match' };
      }
    }
    
    const labels = ['Usage', 'Purpose', 'Use Type', 'Vehicle Usage'];
    return extractValueAfterLabel(text, labels, { maxLength: 50 });
  }

  private extractClassification(text: string): FieldData {
    const classifications = ['Private', 'Commercial', 'Transport', 'Non-Transport', 'Government'];
    for (const cls of classifications) {
      if (containsKeyword(text, [cls])) {
        return { value: cls, confidence: 0.75, source: 'keyword_match' };
      }
    }
    return { value: null, confidence: 0, source: null };
  }

  private extractGVW(text: string): FieldData {
    const labels = ['GVW', 'Gross Vehicle Weight', 'Max Weight', ' Laden Weight'];
    return extractValueAfterLabel(text, labels, { maxLength: 30 });
  }

  private extractCubicCapacity(text: string): FieldData {
    return this.extractEngineCapacity(text);
  }

  private extractNumberOfWheels(text: string): FieldData {
    const labels = ['No of Wheels', 'Number of Wheels', 'Wheels'];
    return extractValueAfterLabel(text, labels, { maxLength: 10 });
  }

  private extractRegistrationAuthority(text: string): FieldData {
    const labels = ['Registering Authority', 'RTO', 'Registration Office', 'Authority'];
    return extractValueAfterLabel(text, labels, { maxLength: 100 });
  }
}

export const vehicleExtractor = new VehicleExtractor();
