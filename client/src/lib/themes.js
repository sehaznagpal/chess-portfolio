export const themes = {
  watermelon: {
    bgLight: '#e3fdad',
    boardDark: '#095256',
    boardLight: '#86a873',
    boardBorder: '#636363',
    accent: '#c1ff40',
    accent2: '#f7567c',
    ink: '#121212',
    surface: '#f5f5f5',
  },
  strawberry: {
    bgLight: '#edd2cf',
    boardDark: '#ae4242',
    boardLight: '#fba9ab',
    boardBorder: '#636363',
    accent: '#c1ff40',
    accent2: '#f7567c',
    ink: '#121212',
    surface: '#f5f5f5',
  },
  banana: {
    bgLight: '#ffedbb',
    boardDark: '#a58f40',
    boardLight: '#ebdf7a',
    boardBorder: '#636363',
    accent: '#c1ff40',
    accent2: '#f7567c',
    ink: '#121212',
    surface: '#f5f5f5',
  },
  blueberry: {
    bgLight: '#96c1ed',
    boardDark: '#0092d6',
    boardLight: '#cfd1c2',
    boardBorder: '#636363',
    accent: '#c1ff40',
    accent2: '#f7567c',
    ink: '#121212',
    surface: '#f5f5f5',
  },
};

export function applyTheme(themeName) {
  const t = themes[themeName] || themes.watermelon;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(t)) {
    root.style.setProperty(`--${key}`, value);
  }
}
