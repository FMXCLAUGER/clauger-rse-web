export const CLAUGER_COLORS = {
  brand: {
    primary: '#0088CC',
    secondary: '#F8B500',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
    white: '#FFFFFF',
  },
  background: {
    page: '#F9FAFB',
    card: '#FFFFFF',
    cardDark: '#1F2937',
  },
  border: {
    light: '#E5E7EB',
    DEFAULT: '#D1D5DB',
    dark: '#9CA3AF',
  },
  sidebar: {
    background: '#FFFFFF',
    border: '#E5E7EB',
    hoverBg: '#F0F9FF',
  },
  interactive: {
    primary: '#0088CC',
    primaryHover: '#006BA3',
    icon: '#666666',
    iconHover: '#0088CC',
  },
  progress: {
    background: '#E5E7EB',
    fill: '#0088CC',
    gradientStart: '#0088CC',
    gradientEnd: '#F8B500',
    text: '#666666',
  },
  thumbnail: {
    border: 'transparent',
    borderHover: '#0088CC',
    borderActive: '#0088CC',
    backgroundActive: '#F0F9FF',
    shadowHover: 'rgba(0, 136, 204, 0.15)',
    shadowActive: 'rgba(0, 136, 204, 0.1)',
  },
  navigation: {
    headerBg: 'rgba(255, 255, 255, 0.95)',
    headerBorder: '#E5E7EB',
    buttonColor: '#666666',
    buttonColorHover: '#0088CC',
    buttonBgHover: '#F0F9FF',
  },
  focus: {
    background: '#FAFAFA',
    overlayBg: 'rgba(44, 62, 80, 0.95)',
  },
  resume: {
    background: '#F8B500',
    text: '#333333',
  },
  tooltip: {
    background: '#2C3E50',
    text: '#FFFFFF',
    kbdBackground: '#0088CC',
    kbdText: '#FFFFFF',
  },
  dashboard: {
    kpiCard: {
      background: '#FFFFFF',
      border: '#E5E7EB',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      shadowHover: '0 4px 12px rgba(0, 136, 204, 0.15)',
      labelColor: '#666666',
      valueColor: '#0088CC',
      iconGradientStart: '#0088CC',
      iconGradientEnd: '#F8B500',
    },
    chart: {
      primary: '#0088CC',
      secondary: '#F8B500',
      tertiary: '#10B981',
      gridLines: '#E5E7EB',
      textColor: '#666666',
    },
  },
} as const

export const ZOOM_LEVELS = [75, 100, 125, 150, 200] as const

export type ZoomLevel = typeof ZOOM_LEVELS[number]
