import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('darkMode');

const themeSlice = createSlice({
  name: 'theme',
  initialState: { darkMode: saved === 'true' },
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    initTheme(state) {
      document.documentElement.classList.toggle('dark', state.darkMode);
    }
  }
});

export const { toggleDarkMode, initTheme } = themeSlice.actions;
export default themeSlice.reducer;
