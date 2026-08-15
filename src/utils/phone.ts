export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    return "+92" + digits.slice(1);
  }
  if (digits.startsWith("92") && digits.length === 12) {
    return "+" + digits;
  }
  return "+" + digits; // fallback
}

export function isValidPakistaniNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return /^0[3][0-9]{9}$/.test(digits) || /^92[3][0-9]{9}$/.test(digits);
}