
export interface TaxBand {
  id: string;
  lowerBound: number;
  upperBound: number | null;
  rate: number;
}

export interface TaxConfig {
  bands: TaxBand[];
  rentReliefPercent: number;
  rentReliefCap: number;
  nhfDefaultRate: number;
  pensionDefaultRate: number;
  versionName: string;
  effectiveDate: string;
}

export interface UserInput {
  employeeName: string;
  isAnnualMode: boolean;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  bonuses: number;
  pensionRate: number;
  nhfRate: number;
  otherDeductions: number;
  annualRent: number;
  claimsRentRelief: boolean;
  stateOfResidence: string;
}

export interface CalculationResult {
  grossAnnual: number;
  grossMonthly: number;
  annualPension: number;
  annualNHF: number;
  annualOtherDeductions: number;
  rentPaid: number;
  rentRelief: number;
  totalAllowableDeductions: number;
  chargeableIncome: number;
  annualPAYE: number;
  monthlyPAYE: number;
  annualNetPay: number;
  monthlyNetPay: number;
  explanation: string;
  bandBreakdown: {
    band: TaxBand;
    taxableInBand: number;
    taxPaid: number;
  }[];
}

export interface TaxHistoryEntry {
  id: string;
  timestamp: number;
  userEmail: string;
  employeeName: string;
  grossAnnual: number;
  totalDeductions: number;
  annualPAYE: number;
  monthlyNetPay: number;
  input: UserInput;
  result: CalculationResult;
}

export type UserRole = 'individual' | 'organisation' | 'admin';
