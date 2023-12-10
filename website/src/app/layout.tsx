'use client';

import "../styles/globals.css";

import { FC, PropsWithChildren } from 'react';
import { Page } from '../components/display/Page';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <html>
      <head>
        <title>Chesski</title>
        <link rel="icon" href="/chesski-logo.svg" />
      </head>
      <body>
        <Page>
          {children}
        </Page>
      </body>
    </html>
  );
};

export default Layout;
