
import { TaxConfig, UserInput } from './types';

export const INITIAL_TAX_CONFIG: TaxConfig = {
  bands: [
    { id: '1', lowerBound: 0, upperBound: 800000, rate: 0 },
    { id: '2', lowerBound: 800000, upperBound: 2000000, rate: 0.10 },
    { id: '3', lowerBound: 2000000, upperBound: 4000000, rate: 0.15 },
    { id: '4', lowerBound: 4000000, upperBound: 7000000, rate: 0.19 },
    { id: '5', lowerBound: 7000000, upperBound: 12000000, rate: 0.22 },
    { id: '6', lowerBound: 12000000, upperBound: null, rate: 0.25 },
  ],
  rentReliefPercent: 0.20,
  rentReliefCap: 500000,
  nhfDefaultRate: 0.025,
  pensionDefaultRate: 0.08,
  versionName: 'NTA 2026 Framework v1.0',
  effectiveDate: '2026-01-01',
};

export const INITIAL_USER_INPUT: UserInput = {
  employeeName: '',
  isAnnualMode: false,
  basicSalary: 250000,
  housingAllowance: 50000,
  transportAllowance: 30000,
  otherAllowances: 20000,
  bonuses: 0,
  pensionRate: 0.08,
  nhfRate: 0.025,
  otherDeductions: 0,
  annualRent: 1200000,
  claimsRentRelief: true,
  stateOfResidence: 'Lagos',
};

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];
