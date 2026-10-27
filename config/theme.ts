export const COLORS = {
  primary: "#B8325B",
  accent: "#F07B68",
  background: "#FFF9F5",
  surface: "#FFFFFF",
  text: "#281A22",
  muted: "#806F78",
  gray: "#A29299",
  border: "#F0E3E8",
  error: "#D9435F",
  success: "#25866E",
  soft: "#F8E8ED",
  highlight: "#FFE8D6",
  black: "#000000",
  white: "#FFFFFF",
};

export const TYPOGRAPHY = {
  lg: 20,
  sm: 14,
  md: 16,
  title: 25,
  big: 33,
};

const THEME = {
  dark: {
    colors: {
      ...COLORS,
      primary: "#F18AA1",
      accent: "#F39A82",
      background: "#171117",
      surface: "#241C24",
      text: "#FFF6F7",
      muted: "#C2AFB9",
      gray: "#9E8A94",
      border: "#3B2D38",
      soft: "#3A2632",
      highlight: "#3B2B2A",
    },
  },
  light: {
    colors: {
      ...COLORS,
    },
  },
};

export const RADII = {
  sm: 12,
  md: 18,
  lg: 26,
  pill: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export type THEME_KEY = keyof typeof THEME;

export default THEME;
