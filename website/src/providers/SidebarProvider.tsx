import {
  PropsWithChildren,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";

const SidebarContext = createContext({
  expanded: true,
  toggleExpanded: (): void => {
    throw new Error("SidebarProvider not initialized");
  },
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: PropsWithChildren) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setExpanded((curr) => !curr);
  }, []);

  return (
    <SidebarContext.Provider value={{ expanded, toggleExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
};
