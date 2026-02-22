// Compatibility wrapper for case-sensitive deployments (Linux/Vercel).
// Some older commits import RootLayout from "./components/RootLayout".
// Keep this file to avoid build failures.

import RootLayout from '../app/layout';
export default RootLayout;
