import Hashids from 'hashids';

// Obfuscates numeric transaction IDs so they don't appear as guessable
// sequential integers in the URL (e.g. /dashboard/transactions/93).
// This is not an access-control boundary — the API still authorizes by
// buyer/seller ownership server-side — it only hides the raw DB id from
// casual viewing/enumeration in the address bar.
const SALT = process.env.NEXT_PUBLIC_ID_HASH_SALT || 'rekber-transaction-id-salt';
const hashids = new Hashids(SALT, 8);

export function encodeTransactionId(id: number | string): string {
  return hashids.encode(Number(id));
}

// Falls back to the raw value when it isn't a valid encoded hash, so
// old-style numeric links (or manual edits) keep working.
export function decodeTransactionId(hash: string): string {
  const decoded = hashids.decode(hash);
  if (decoded.length > 0) {
    return String(decoded[0]);
  }
  return hash;
}
