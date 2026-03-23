import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const DarkTheme: ThemeTypes = {
  name: 'DarkTheme',
  dark: true,
  variables: {
    'border-color': '#333333',
    'carousel-control-size': 10
  },
  colors: {
    primary: '#1e88e5',
    secondary: '#5e35b1',
    info: '#03c9d7',
    success: '#00c853',
    accent: '#FFAB91',
    warning: '#ffc107',
    error: '#f44336',
    lightprimary: '#1e293b',
    lightsecondary: '#2e263d',
    lightsuccess: '#1b3b22',
    lighterror: '#442525',
    lightwarning: '#443d25',
    darkText: '#ffffff',
    lightText: '#b0b0b0',
    darkprimary: '#1565c0',
    darksecondary: '#4527a0',
    borderLight: '#333333',
    inputBorder: '#4d5e6d',
    containerBg: '#121212',
    surface: '#1e1e1e',
    'on-surface-variant': '#1e1e1e',
    facebook: '#4267b2',
    twitter: '#1da1f2',
    linkedin: '#0e76a8',
    gray100: '#1e1e1e',
    primary200: '#90caf9',
    secondary200: '#b39ddb',
    background: '#121212'
  }
};

export { DarkTheme };
