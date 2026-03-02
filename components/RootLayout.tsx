// Compatibility wrapper for case-sensitive deployments (Linux/Vercel).
// Some older commits import RootLayout from "./components/RootLayout".
// Keep this file to avoid build failures.

import React from 'react';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default RootLayout;
