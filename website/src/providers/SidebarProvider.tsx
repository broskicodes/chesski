import {
  PropsWithChildren,
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from "react";

export enum ScreenSize {
  Mobile = "Mobile",
  Tablet = "Tablet",
  Desktop = "Desktop"
}

export const ScreenSizeBoardMap: { [key in ScreenSize]: number } = {
  "Mobile": 348,
  "Tablet": 464,
  "Desktop": 512,
}

export interface SidebarProviderContext {
  expanded: boolean;
  screenSize: ScreenSize | null;
  toggleExpanded: () => void;
}

const SidebarContext = createContext<SidebarProviderContext>({
  expanded: false,
  screenSize: null,
  toggleExpanded: () => {
    throw new Error("SidebarProvider not initialized");
  },
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: PropsWithChildren) => {
  const [expanded, setExpanded] = useState(false);
  const [screenSize, setScreenSize] = useState<ScreenSize | null>(null);

  const toggleExpanded = useCallback(() => {
    setExpanded((curr) => !curr);
  }, []);

  const findScreenSize = useCallback(() => {
    const width = window.innerWidth;
    // const height = window.innerHeight;

    if (width < 640) {
      setScreenSize(ScreenSize.Mobile);
    } else if (width < 1024) {
      setScreenSize(ScreenSize.Tablet);
    } else {
      setScreenSize(ScreenSize.Desktop);
    }
  }, []);

  useEffect(() => {
    findScreenSize();

    const resizeHandler = () => {
      findScreenSize();
    };

    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    }
  }, [findScreenSize]);

  const value: SidebarProviderContext = useMemo(() => ({
    expanded, screenSize, toggleExpanded
  }), [expanded, screenSize, toggleExpanded]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};
