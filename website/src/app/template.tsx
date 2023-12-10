'use client';

import { FC, PropsWithChildren } from 'react';
import { useSidebar } from '../providers/SidebarProvider';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { expanded } = useSidebar();

  return (
    <div className={`${expanded ? "md:ml-72" : "md:ml-20"}`}>
      {children}
    </div>
  );
};

export default Layout;
