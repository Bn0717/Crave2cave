// Single source of truth for vendor data. Add/edit a vendor here only —
// every screen (Navigation, Admin, Driver, Landing Page, Student ordering,
// driver fare calculation) reads from this file instead of its own copy.
//
// Field guide:
// - name: short display name, used everywhere except the landing page.
// - landingName: full/long display name, shown only on the landing page
//   (there's room there; other screens are short on space).
// - icon: emoji used across all screens.
// - enabled: whether a student can pick this vendor for a NEW order.
//   Disabled vendors are still kept in this file (with real data) so
//   past orders placed under them still display correctly everywhere —
//   only the two vendor-picker screens (Landing Page, Student ordering)
//   filter on this flag. Flip it back to true to bring a vendor back
//   everywhere at once.
// - selectionColor: accent color used on the vendor-picker cards
//   (Landing Page and Student ordering).
// - driverTagColor / driverTagBg: colors for the vendor tag pill shown
//   in the Driver tab.
// - category: used only for AdminTab's suggested-driver-cost grouping.
//   Vendors without a category are excluded from that grouping (matches
//   existing behavior — kfc/mcd/douglas_street were never categorized).
// - surcharge: per-vendor surcharge added in calculateDriverFare.js.
//   Vendors without one contribute 0.

export const VENDOR_CATALOG = {
  mixue: {
    name: 'MIXUE',
    icon: '🧋',
    enabled: true,
    selectionColor: '#ff69b4',
    driverTagColor: '#ef0a0aff',
    driverTagBg: '#F9EBEB',
    category: 1,
    surcharge: 1,
  },
  dominos: {
    name: "Domino's",
    landingName: "Domino's Pizza",
    icon: '🍕',
    enabled: true,
    selectionColor: '#0078d4',
    driverTagColor: '#006491',
    driverTagBg: '#E5F0F4',
    category: 1,
  },
  ayam_gepuk: {
    name: 'Ayam Gepuk',
    landingName: 'Ayam Gepuk Pak Gembus',
    icon: '🍗',
    enabled: true,
    selectionColor: '#ffcc02',
    driverTagColor: '#f1af20ff',
    driverTagBg: '#FFDBCF',
    category: 1,
  },
  family_mart: {
    name: 'Family Mart',
    icon: '🏪',
    enabled: true,
    selectionColor: '#009a44',
    driverTagColor: '#00642e',
    driverTagBg: '#E6F5EC',
    category: 2,
    surcharge: 2,
  },
  bakers_cottage: {
    name: "Baker's Cottage",
    icon: '🥐',
    enabled: true,
    selectionColor: '#D97706',
    driverTagColor: '#92400e',
    driverTagBg: '#FEF3C7',
    category: 1,
  },
  zus_coffee: {
    name: 'Zus Coffee',
    icon: '☕',
    enabled: true,
    selectionColor: '#0057A0',
    driverTagColor: '#003a71',
    driverTagBg: '#E0EFFF',
    category: 3,
    surcharge: 3,
  },
  kfc: {
    name: 'KFC',
    icon: '🍗',
    enabled: true,
    selectionColor: '#e4002b',
    driverTagColor: '#e4002b',
    driverTagBg: '#FCE4E7',
    surcharge: 3,
  },
  mcd: {
    name: "McDonald's",
    icon: '🍔',
    enabled: false, // TEMP: disabled everywhere it's selectable — flip to true to bring it back
    selectionColor: '#ffc72c',
    driverTagColor: '#946200',
    driverTagBg: '#FFF6DC',
    surcharge: 2,
  },
  douglas_street: {
    name: 'The Douglas Street',
    icon: '🍽️',
    enabled: true,
    selectionColor: '#4b5563',
    driverTagColor: '#374151',
    driverTagBg: '#F1F5F9',
    surcharge: 3,
  },
};
