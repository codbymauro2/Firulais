import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface MenuContextType {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

const MenuContext = createContext<MenuContextType | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MenuContext.Provider value={{ isOpen, openMenu: () => setIsOpen(true), closeMenu: () => setIsOpen(false) }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu debe usarse dentro de MenuProvider");
  return ctx;
}
