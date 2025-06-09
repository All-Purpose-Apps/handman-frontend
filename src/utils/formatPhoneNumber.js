export function formatPhoneNumber(input) {
  if (typeof input !== 'string') return 'Invalid input';

  // Separate extension if present
  const [mainPart, extPart] = input.toLowerCase().split(/x|ext/);

  // Remove all non-numeric characters
  const cleaned = mainPart.replace(/\D/g, '');

  if (cleaned.length === 10) {
    const formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    return extPart ? `${formatted} x${extPart.trim()}` : formatted;
  }

  // Handle international format (prepend +, then group into 3-4 digit segments)
  if (cleaned.length > 10) {
    const countryCode = cleaned.slice(0, cleaned.length - 10);
    const nationalNumber = cleaned.slice(-10);
    const segments = [];

    segments.push(`+${countryCode}`);
    segments.push(nationalNumber.substring(0, 3));
    segments.push(nationalNumber.substring(3, 6));
    segments.push(nationalNumber.substring(6));

    const formatted = segments.join(' ');
    return extPart ? `${formatted} x${extPart.trim()}` : formatted;
  }

  return 'Invalid phone number';
}
