// Savatchadagi qatorni aniqlovchi kalit.
//
// Bir mahsulotning turli ranglari savatchada ALOHIDA qator bo'lishi
// kerak, shuning uchun mahsulot raqami va rang raqami birga olinadi.
// Masalan: kreslo (id=3) ko'k rangda va qizil rangda — ikki qator.
//
// Eski savatchalarda (ranglar qo'shilishidan oldin qo'shilgan
// mahsulotlarda) color_id umuman bo'lmaydi. U holda 'none'
// ishlatiladi, ya'ni eski qatorlar ham to'g'ri ishlaydi.
export function getCartLineKey(item) {
  const colorPart = (item.color_id === undefined || item.color_id === null)
    ? 'none'
    : item.color_id;
  return `${item.id}::${colorPart}`;
}

// Ikki qator bir xilmi? Soni o'zgartirish va o'chirishda shu
// tekshiruv ishlatiladi — id bo'yicha solishtirilsa, ko'k va qizil
// variantlar aralashib ketardi.
export function isSameCartLine(a, b) {
  return getCartLineKey(a) === getCartLineKey(b);
}
