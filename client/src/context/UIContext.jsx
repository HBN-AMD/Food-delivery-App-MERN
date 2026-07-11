import { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <UIContext.Provider value={{ isMobileMenuOpen, toggleMobileMenu, closeMobileMenu }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}
