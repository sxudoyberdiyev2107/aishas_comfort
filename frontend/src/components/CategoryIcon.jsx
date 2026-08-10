// Aishas Comfort — kategoriya ikonkalari kutubxonasi
// 32 ta brend ikonka. Har biri key (masalan 'sofa') bo'yicha chaqiriladi.
// Ishlatish: <CategoryIcon name="sofa" className="w-6 h-6" />
// stroke="currentColor" — asosiy chiziqlar rangi CSS "color" orqali boshqariladi.
// Qizil (#F45B5B) va sariq (#FFC27A) accent ranglar har doim saqlanadi.

import React from "react";

export const CATEGORY_ICONS = {
  sofa: {
    label: "Divan",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="20" y="58" width="88" height="31" rx="8"/><path d="M27 58v-8c0-8 6-14 14-14h46c8 0 14 6 14 14v8M64 58v31M31 89v8M97 89v8"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  armchair: {
    label: "Kreslo",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M34 61V45c0-9 7-16 16-16h28c9 0 16 7 16 16v16"/><rect x="28" y="59" width="72" height="32" rx="9"/><path d="M38 91v7M90 91v7M28 70H18v15M100 70h10v15"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  coffee_table: {
    label: "Jurnal stoli",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="22" y="48" width="84" height="20" rx="10"/><path d="M34 68v27M94 68v27M48 68l-8 27M80 68l8 27"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  tv_stand: {
    label: "TV tumba",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="30" y="24" width="68" height="44" rx="5"/><path d="M54 68v9M74 68v9M43 77h42"/><rect x="20" y="80" width="88" height="17" rx="4"/><path d="M49 80v17M79 80v17"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  bed: {
    label: "Karavot",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M20 44v54M108 59v39M20 62h88v27H20zM29 62V48h34c9 0 16 6 16 14M29 89v9M99 89v9"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  wardrobe: {
    label: "Shkaf",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="31" y="23" width="66" height="75" rx="5"/><path d="M64 23v75M55 59h-5M73 59h5M39 98v5M89 98v5"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  dresser: {
    label: "Komod",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="27" y="36" width="74" height="62" rx="5"/><path d="M27 56h74M27 77h74M58 46h12M58 67h12M58 88h12M36 98v5M92 98v5"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  nightstand: {
    label: "Tumba",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="38" y="44" width="52" height="54" rx="5"/><path d="M38 62h52M59 53h10M59 79h10M46 98v5M82 98v5"/><path d="M51 44v-8h26v8"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  dining_table: {
    label: "Ovqat stoli",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="20" y="48" width="88" height="17" rx="6"/><path d="M31 65v34M97 65v34M49 65l-5 34M79 65l5 34"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  dining_chair: {
    label: "Stul",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M42 26v42h44V26M42 44h44M38 68h52M45 68l-5 31M83 68l5 31"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  office_desk: {
    label: "Ofis stoli",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="18" y="46" width="92" height="18" rx="4"/><path d="M29 64v35M99 64v35"/><rect x="69" y="64" width="30" height="28" rx="3"/><path d="M69 78h30M80 71h8M80 85h8"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  office_chair: {
    label: "Ofis kreslosi",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="43" y="25" width="42" height="44" rx="17"/><path d="M39 69h50v17H39zM64 86v11M47 101h34M51 97l-9 8M77 97l9 8"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  office_cabinet: {
    label: "Ofis shkafi",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="35" y="23" width="58" height="76" rx="5"/><path d="M35 48h58M35 73h58M59 35h10M59 60h10M59 85h10"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  bookshelf: {
    label: "Javon",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="29" y="22" width="70" height="78" rx="4"/><path d="M29 49h70M29 76h70M43 29v14M52 29v14M64 56v14M78 56v14M42 83v11M55 83v11M72 83v11"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  school_desk: {
    label: "Maktab partasi",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M23 48h82l-7 20H30l-7-20Z"/><path d="M37 68l-7 31M91 68l7 31M48 68v14h32V68M55 37h18"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  student_chair: {
    label: "O‘quvchi stuli",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="42" y="28" width="44" height="34" rx="8"/><path d="M38 66h52v16H38zM46 82l-6 18M82 82l6 18M47 66V62M81 66V62"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  kids_swing: {
    label: "Bolalar arg‘imchog‘i",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M22 98 52 27h24l30 71M42 98h44M53 42l11 18 11-18M52 60v25M76 60v25M49 85h30"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  kids_set: {
    label: "Bolalar stol-stuli",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="38" y="48" width="52" height="16" rx="5"/><path d="M47 64v34M81 64v34M22 68h20v15H22zM27 83v15M37 83v15M86 68h20v15H86zM91 83v15M101 83v15"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  kitchenware: {
    label: "Oshxona buyumlari",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M31 50h66v37c0 8-6 14-14 14H45c-8 0-14-6-14-14V50ZM25 50h78M43 38h42M55 30h18M97 61h10c8 0 10 16 0 20H97"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  tableware: {
    label: "Idishlar",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <circle cx="53" cy="66" r="29"/><circle cx="53" cy="66" r="17"/><path d="M87 48h17v31H87c-7 0-12-6-12-15s5-16 12-16ZM104 55h5c9 0 9 17 0 17h-5"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  kitchen_organizer: {
    label: "Oshxona organayzeri",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M27 34h74v65H27zM27 59h74M27 82h74"/><rect x="38" y="42" width="17" height="17" rx="3"/><rect x="63" y="39" width="26" height="20" rx="3"/><path d="M40 70h14M64 70h25M40 92h23M72 92h17"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  storage_box: {
    label: "Saqlash qutisi",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M26 47h76v52H26zM20 37h88v15H20zM55 61h18M34 47v52M94 47v52"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  laundry_basket: {
    label: "Kir savati",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M31 46h66l-7 54H38l-7-54Z"/><path d="M42 46V33M86 46V33M49 59v27M64 59v27M79 59v27M26 46h76"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  shoe_rack: {
    label: "Oyoq kiyim javoni",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M25 38h78v61H25zM25 68h78M37 38v61M91 38v61"/><path d="M47 55c5 5 12 6 19 1l7 7H45c-5 0-5-6 2-8ZM52 85c5 5 12 6 19 1l7 7H50c-5 0-5-6 2-8Z"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  floor_lamp: {
    label: "Yoritish",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M64 30v67M47 101h34M44 54h40L75 31H53L44 54ZM56 68h16"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  home_decor: {
    label: "Uy dekori",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M48 48h32l7 42c1 7-4 12-11 12H52c-7 0-12-5-11-12l7-42Z"/><path d="M64 48V30M64 38c-9-11-18-8-22-2 9 6 16 6 22 2ZM64 42c9-11 18-8 22-2-9 6-16 6-22 2Z"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  cleaning: {
    label: "Tozalash buyumlari",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M77 27 51 91M72 25l11 4M44 91h28l-6 11H38l6-11Z"/><path d="M92 45v43M82 88h20l-4 14H86l-4-14ZM91 45h3"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  textiles: {
    label: "Uy tekstili",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <rect x="29" y="35" width="70" height="30" rx="10"/><path d="M36 65h56v16H36zM43 81h42v17H43zM45 48h38M51 73h26M55 89h18"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  delivery: {
    label: "Yetkazib berish",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M19 43h57v43H19zM76 58h18l15 17v11H76V58ZM83 65h10l7 9H83v-9Z"/><circle cx="39" cy="91" r="9"/><circle cx="91" cy="91" r="9"/><path d="M48 91h34"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  assembly: {
    label: "Yig‘ish xizmati",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M36 31c9 0 15 7 15 15 0 3-1 6-2 8l31 31-13 13-31-31c-2 1-5 2-8 2-9 0-15-7-15-15 0-4 1-7 3-10l10 10 9-9-10-10c3-3 7-4 11-4Z"/><path d="m76 36 14-8 11 11-8 14-10 2-9-9 2-10Z"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  warranty: {
    label: "Kafolat",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M64 24 99 38v25c0 21-14 35-35 42-21-7-35-21-35-42V38l35-14Z"/><path d="m46 64 12 12 25-27"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
  consultation: {
    label: "Konsultatsiya",
    svg: (
      <><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"> <path d="M24 31h80v56H62L43 101V87H24V31Z"/><path d="M42 51h44M42 66h31"/><circle cx="91" cy="68" r="4" fill="#17233C" stroke="none"/> </g> <path d="M45 109c6 7 12 10 19 10s13-3 19-10" fill="none" stroke="#F45B5B" strokeWidth="5" strokeLinecap="round"/> <circle cx="105" cy="23" r="5" fill="#FFC27A"/></>
    ),
  },
};

export const CATEGORY_ICON_LIST = [
  { key: "sofa", label: "Divan" },
  { key: "armchair", label: "Kreslo" },
  { key: "coffee_table", label: "Jurnal stoli" },
  { key: "tv_stand", label: "TV tumba" },
  { key: "bed", label: "Karavot" },
  { key: "wardrobe", label: "Shkaf" },
  { key: "dresser", label: "Komod" },
  { key: "nightstand", label: "Tumba" },
  { key: "dining_table", label: "Ovqat stoli" },
  { key: "dining_chair", label: "Stul" },
  { key: "office_desk", label: "Ofis stoli" },
  { key: "office_chair", label: "Ofis kreslosi" },
  { key: "office_cabinet", label: "Ofis shkafi" },
  { key: "bookshelf", label: "Javon" },
  { key: "school_desk", label: "Maktab partasi" },
  { key: "student_chair", label: "O‘quvchi stuli" },
  { key: "kids_swing", label: "Bolalar arg‘imchog‘i" },
  { key: "kids_set", label: "Bolalar stol-stuli" },
  { key: "kitchenware", label: "Oshxona buyumlari" },
  { key: "tableware", label: "Idishlar" },
  { key: "kitchen_organizer", label: "Oshxona organayzeri" },
  { key: "storage_box", label: "Saqlash qutisi" },
  { key: "laundry_basket", label: "Kir savati" },
  { key: "shoe_rack", label: "Oyoq kiyim javoni" },
  { key: "floor_lamp", label: "Yoritish" },
  { key: "home_decor", label: "Uy dekori" },
  { key: "cleaning", label: "Tozalash buyumlari" },
  { key: "textiles", label: "Uy tekstili" },
  { key: "delivery", label: "Yetkazib berish" },
  { key: "assembly", label: "Yig‘ish xizmati" },
  { key: "warranty", label: "Kafolat" },
  { key: "consultation", label: "Konsultatsiya" },
];

export default function CategoryIcon({ name, className = "w-6 h-6", ...props }) {
  const icon = name && CATEGORY_ICONS[name];
  if (!icon) return null;
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {icon.svg}
    </svg>
  );
}
