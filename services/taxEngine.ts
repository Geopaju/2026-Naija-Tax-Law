
import { TaxConfig, UserInput, CalculationResult, TaxBand } from '../types';

/**
 * Nigeria PAYE Calculation Engine (2026 Rules)
 * 
 * Reusable service logic for computing personal income tax.
 * strictly follows the 6-step functional specification.
 */
export const calculatePAYE = (input: UserInput, config: TaxConfig): CalculationResult => {
  const formatNaira = (amt: number) => `₦${Math.round(amt).toLocaleString()}`;

  // Step 0: Normalize to Annual Values
  const annualBasic = input.basicSalary * (input.isAnnualMode ? 1 : 12);
  const annualHousing = input.housingAllowance * (input.isAnnualMode ? 1 : 12);
  const annualTransport = input.transportAllowance * (input.isAnnualMode ? 1 : 12);
  const annualOthers = input.otherAllowances * (input.isAnnualMode ? 1 : 12);
  const annualBonuses = input.bonuses * (input.isAnnualMode ? 1 : 12);

  const grossAnnual = annualBasic + annualHousing + annualTransport + annualOthers + annualBonuses;
  
  // Statutory Deductions (Annual)
  const annualPension = annualBasic * input.pensionRate;
  const annualNHF = annualBasic * input.nhfRate;
  const annualOtherDeductions = input.otherDeductions * (input.isAnnualMode ? 1 : 12);

  // Step 1: Compute Rent Relief
  // Rule: 20% of annual rent paid, capped at config limit (₦500,000)
  let rentRelief = 0;
  if (input.claimsRentRelief && input.annualRent > 0) {
    rentRelief = Math.min(input.annualRent * config.rentReliefPercent, config.rentReliefCap);
  }

  // Step 2: Compute Chargeable Income
  // Formula: grossIncome − (rentRelief + pension + nhf + otherReliefs)
  const totalAllowableDeductions = annualPension + annualNHF + annualOtherDeductions + rentRelief;
  const chargeableIncome = Math.max(0, grossAnnual - totalAllowableDeductions);

  // Step 3: Apply Progressive Tax Bands
  const sortedBands = [...config.bands].sort((a, b) => a.lowerBound - b.lowerBound);
  
  let taxSum = 0;
  let remainingChargeable = chargeableIncome;
  const breakdown: { band: TaxBand; taxableInBand: number; taxPaid: number }[] = [];

  for (let i = 0; i < sortedBands.length; i++) {
    const band = sortedBands[i];
    const lower = band.lowerBound;
    const upper = band.upperBound;
    
    // Width of the band
    const bandWidth = (upper === null) ? Infinity : (upper - lower);
    
    // Amount of income that falls into this band
    const taxableInThisBand = Math.max(0, Math.min(remainingChargeable, bandWidth));
    
    const taxInThisBand = taxableInThisBand * band.rate;
    
    taxSum += taxInThisBand;
    remainingChargeable -= taxableInThisBand;

    breakdown.push({
      band,
      taxableInBand: taxableInThisBand,
      taxPaid: taxInThisBand
    });

    if (remainingChargeable <= 0) break;
  }

  // Step 4 & 5: Calculate Final Sums
  const annualPAYE = taxSum;
  const monthlyPAYE = annualPAYE / 12;

  // Step 6: Net Income Calculation
  const annualNetPay = grossAnnual - annualPAYE - annualPension - annualNHF - annualOtherDeductions;
  const monthlyNetPay = annualNetPay / 12;

  // Generate Explanation Text
  const explanation = `
    Based on a gross annual income of ${formatNaira(grossAnnual)}, your taxable (chargeable) income was determined by subtracting 
    statutory reliefs: Pension (${formatNaira(annualPension)}), NHF (${formatNaira(annualNHF)}), and 
    Rent Relief of ${formatNaira(rentRelief)} (20% of rent, capped at ${formatNaira(config.rentReliefCap)}). 
    This left a Chargeable Income of ${formatNaira(chargeableIncome)}.
    Applying the progressive PAYE bands resulted in a total annual tax of ${formatNaira(annualPAYE)}, 
    leaving you with a monthly take-home pay of ${formatNaira(monthlyNetPay)}.
  `.trim();

  return {
    grossAnnual,
    grossMonthly: grossAnnual / 12,
    annualPension,
    annualNHF,
    annualOtherDeductions,
    rentPaid: input.annualRent,
    rentRelief,
    totalAllowableDeductions,
    chargeableIncome,
    annualPAYE,
    monthlyPAYE,
    annualNetPay,
    monthlyNetPay,
    explanation,
    bandBreakdown: breakdown,
  };
};
