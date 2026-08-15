// Formats an amount with PKR-style thousands grouping. `maximumFractionDigits`
// defaults to 2 to match the Decimal(12,2) ledger; pass `decimals` to force an
// exact number of decimals (e.g. 2 for a balance, 0 for a whole-number chip).
// An explicit locale guarantees grouping on Android Hermes, where calling
// toLocaleString() with no locale can silently skip the thousands separators.
export function formatPKR(
  amount: number,
  opts: { decimals?: number } = {},
): string {
  const maxDecimals = opts.decimals ?? 2;
  return amount.toLocaleString("en-PK", {
    minimumFractionDigits: opts.decimals ?? 0,
    maximumFractionDigits: maxDecimals,
  });
}