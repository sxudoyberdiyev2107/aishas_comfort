const SERVER_URL = 'https://aishascomfort-production.up.railway.app';

// Rasm manzilini to'liq ko'rinishga aylantirish
export function getImageSrc(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${SERVER_URL}${url}`;
  return url; // eski rasmlar (frontend/public ichida)
}
