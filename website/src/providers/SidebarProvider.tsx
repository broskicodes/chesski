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
  Desktop = "Desktop",
}

export const ScreenSizeBoardMap: { [key in ScreenSize]: number } = {
  Mobile: 348,
  Tablet: 464,
  Desktop: 464,
};

export interface SidebarProviderContext {
  expanded: boolean;
  screenSize: ScreenSize | null;
  screenWidth: number;
  toggleExpanded: (on?: boolean) => void;
}

const SidebarContext = createContext<SidebarProviderContext>({
  expanded: false,
  screenSize: null,
  screenWidth: 0,
  toggleExpanded: () => {
    throw new Error("SidebarProvider not initialized");
  },
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: PropsWithChildren) => {
  const [expanded, setExpanded] = useState(false);
  const [screenSize, setScreenSize] = useState<ScreenSize | null>(null);
  const [screenWidth, setScreenWidth] = useState(0);

  const toggleExpanded = useCallback((on?: boolean) => {
    setExpanded((curr) => on ?? !curr);
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
    if (screenWidth > 1024) {
      toggleExpanded(true);
    } else {
      toggleExpanded(false);
    }
  }, [screenWidth, toggleExpanded]);

  useEffect(() => {
    findScreenSize();
    setScreenWidth(window.innerWidth);

    const resizeHandler = () => {
      findScreenSize();
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [findScreenSize]);

  const value: SidebarProviderContext = useMemo(
    () => ({
      expanded,
      screenSize,
      screenWidth,
      toggleExpanded,
    }),
    [expanded, screenSize, screenWidth, toggleExpanded],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
