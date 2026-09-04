import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

// Mirrors the HSL custom properties in global.css so nav chrome (header,
// tab bar, screen background during transitions) stays in sync with the
// NativeWind/Tailwind color tokens used everywhere else.
export const NAV_THEME: { light: Theme; dark: Theme } = {
  light: {
    ...DefaultTheme,
    colors: {
      background: 'hsl(0 0% 100%)',
      border: 'hsl(0 0% 89.8%)',
      card: 'hsl(0 0% 100%)',
      notification: 'hsl(0 84.2% 60.2%)',
      primary: 'hsl(0 0% 9%)',
      text: 'hsl(0 0% 3.9%)',
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: 'hsl(0 0% 3.9%)',
      border: 'hsl(0 0% 14.9%)',
      card: 'hsl(0 0% 3.9%)',
      notification: 'hsl(0 62.8% 30.6%)',
      primary: 'hsl(0 0% 98%)',
      text: 'hsl(0 0% 98%)',
    },
  },
};
