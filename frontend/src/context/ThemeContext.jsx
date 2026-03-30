import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('ft_theme');
    return stored ? stored === 'dark' : true; // default dark
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) { root.classList.add('dark'); root.classList.remove('light'); }
    else       { root.classList.add('light'); root.classList.remove('dark'); }
    localStorage.setItem('ft_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = () => setDark(d => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
