/**
 * ChalMeter — Central Brand Configuration & Theme Tokens
 *
 * Hindi: चाल + मीटर
 * Tagline (Hindi): "Aapki Chal. Aapka Score."
 * Tagline (English): "Your Driving. Your Reputation."
 */

export const BRAND = {
  name: 'ChalMeter',
  nameShort: 'ChalMeter',
  hindiName: 'चालमीटर',
  hindiEtymology: 'चाल + मीटर',
  taglineHindi: 'Aapki Chal. Aapka Score.',
  taglineEnglish: 'Your Driving. Your Reputation.',
  heroTagline: 'Aapki nazar, sadak ka hisaab.',
  description:
    'Indian community-powered vehicle driving behaviour and reputation platform. Identify vehicles, share observed driving conduct, and consult crowd-verified safety scores.',
  shortDescription: 'Community vehicle driving behaviour and reputation platform for India.',
  country: 'India',
  countryCode: 'IND',

  // Color Palette as defined in the ChalMeter Design System
  colors: {
    primaryDarkNavy: '#0B1424',
    secondaryNavy: '#15243A',
    navySurface: '#0E1A2E',
    electricLime: '#A5ED45',
    electricLimeDark: '#8CD62C',
    white: '#FFFFFF',
    lightBackground: '#F4F6F8',
    cardBackground: '#15243A',
    cardLightBackground: '#FFFFFF',
    mutedGrey: '#8994A5',
    positive: '#36B879',
    warning: '#E8A63A',
    negative: '#D95D5D',
  },

  // URLs & endpoints
  websiteUrl: 'https://chalmeter.in',
  supportEmail: 'citizen@chalmeter.in',
} as const;
