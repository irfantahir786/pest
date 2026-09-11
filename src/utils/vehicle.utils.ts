/**
 * Vehicle utilities for Indian motor insurance documents
 */

const STATE_NAMES: Record<string, string> = {
  'AN': 'Andaman and Nicobar Islands',
  'AP': 'Andhra Pradesh',
  'AR': 'Arunachal Pradesh',
  'AS': 'Assam',
  'BR': 'Bihar',
  'CH': 'Chandigarh',
  'CT': 'Chhattisgarh',
  'DL': 'Delhi',
  'GA': 'Goa',
  'GJ': 'Gujarat',
  'HR': 'Haryana',
  'HP': 'Himachal Pradesh',
  'JK': 'Jammu and Kashmir',
  'JH': 'Jharkhand',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'MH': 'Maharashtra',
  'MN': 'Manipur',
  'ML': 'Meghalaya',
  'MZ': 'Mizoram',
  'NL': 'Nagaland',
  'OD': 'Odisha',
  'PY': 'Puducherry',
  'PB': 'Punjab',
  'RJ': 'Rajasthan',
  'SK': 'Sikkim',
  'TN': 'Tamil Nadu',
  'TS': 'Telangana',
  'TR': 'Tripura',
  'UP': 'Uttar Pradesh',
  'UT': 'Uttarakhand',
  'UK': 'Uttarakhand',
  'WB': 'West Bengal'
};

const REG_NUMBER_PATTERN = /^([A-Z]{2})[\s-]?(\d{1,2})[\s-]?([A-Z]{1,2})[\s-]?(\d{4})$/i;

export interface ParsedRegistrationNumber {
  original: string;
  stateCode: string | null;
  stateName: string | null;
  rtoNumber: string | null;
  series: string | null;
  number: string | null;
  isValid: boolean;
  confidence: number;
}

export function parseRegistrationNumber(regNo: string): ParsedRegistrationNumber {
  if (!regNo || typeof regNo !== 'string') {
    return {
      original: regNo,
      stateCode: null,
      stateName: null,
      rtoNumber: null,
      series: null,
      number: null,
      isValid: false,
      confidence: 0
    };
  }

  const cleaned = regNo.trim().toUpperCase().replace(/[\s-]+/g, '');
  const match = REG_NUMBER_PATTERN.exec(cleaned);

  if (match) {
    const [, stateCode, rtoNum, series, number] = match;
    const stateName = STATE_NAMES[stateCode] || null;
    const isValid = stateCode !== undefined && STATE_NAMES[stateCode] !== undefined;

    return {
      original: regNo.trim(),
      stateCode: stateCode || null,
      stateName,
      rtoNumber: rtoNum ? `RTO-${rtoNum.padStart(2, '0')}` : null,
      series: series || null,
      number: number || null,
      isValid,
      confidence: isValid ? 0.98 : 0.7
    };
  }

  const partialMatch = /^([A-Z]{2})(\d{1,2})/i.exec(regNo.trim());
  if (partialMatch) {
    const [, stateCode, rtoNum] = partialMatch;
    const stateName = STATE_NAMES[stateCode] || null;

    return {
      original: regNo.trim(),
      stateCode: stateCode || null,
      stateName,
      rtoNumber: rtoNum ? `RTO-${rtoNum.padStart(2, '0')}` : null,
      series: null,
      number: null,
      isValid: false,
      confidence: 0.5
    };
  }

  return {
    original: regNo.trim(),
    stateCode: null,
    stateName: null,
    rtoNumber: null,
    series: null,
    number: null,
    isValid: false,
    confidence: 0
  };
}

export function getStateName(stateCode: string): string | null {
  return STATE_NAMES[stateCode.toUpperCase()] || null;
}

export const VEHICLE_MANUFACTURERS = [
  'Maruti Suzuki', 'Maruti', 'Suzuki',
  'Hyundai', 'Honda', 'Toyota', 'Tata', 'Mahindra',
  'Kia', 'Volkswagen', 'Skoda', 'Renault', 'Nissan',
  'Ford', 'Chevrolet', 'MG', 'Jeep', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volvo', 'Land Rover', 'Jaguar', 'Mini',
  'Fiat', 'Datsun', 'Isuzu', 'Mitsubishi', 'Lexus',
  'Ashok Leyland', 'Eicher', 'Force Motors',
  'Bajaj', 'TVS', 'Hero', 'Royal Enfield', 'Yamaha',
  'KTM', 'Harley-Davidson', 'Triumph', 'Ducati',
  'Kawasaki', 'Suzuki Motorcycle', 'Honda Motorcycle'
];

export const FUEL_TYPES = [
  'Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'EV',
  'Hybrid', 'Petrol/CNG', 'Diesel/LPG', 'Flex Fuel'
];

export const VEHICLE_TYPES = [
  'Motor Car', 'Jeep', 'Station Wagon', 'Van', 'Taxi',
  'Auto Rickshaw', 'Motor Cycle', 'Scooter', 'Moped',
  'Light Motor Vehicle', 'LMV', 'Heavy Motor Vehicle', 'HMV',
  'Medium Goods Vehicle', 'MGV', 'Heavy Goods Vehicle', 'HGV',
  'Bus', 'Truck', 'Lorry', 'Tanker', 'Tractor',
  'Two Wheeler', 'Three Wheeler', 'Four Wheeler',
  'Private Car', 'Commercial Vehicle', 'Transport Vehicle'
];
