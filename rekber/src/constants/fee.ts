// Skema fee Rekber.com — dipakai bersama oleh fitur kalkulator harga jual.
export const REKBER_FEE_THRESHOLD = 100_000_000; // Rp 100 juta
export const REKBER_FEE_RATE_STANDARD = 0.01; // 1% untuk transaksi <= threshold
export const REKBER_FEE_RATE_HEMAT = 0.005; // 0.5% untuk transaksi > threshold
export const REKBER_FEE_MINIMUM = 10_000; // fee minimum Rp 10.000

export function calculateRekberFee(amount: number): number {
  if (amount <= 0) return 0;
  const rate = amount <= REKBER_FEE_THRESHOLD ? REKBER_FEE_RATE_STANDARD : REKBER_FEE_RATE_HEMAT;
  return Math.max(amount * rate, REKBER_FEE_MINIMUM);
}
