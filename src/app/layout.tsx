import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '#PremAbhaar',
  description: 'Generate Prem Abhaar DP photos',
  applicationName: '#PremAbhaar',
  authors: [{ name: 'rvk IT Team' }],
  keywords: ['image', 'frame', 'generator', 'photo', 'border'],
};

import Footer from "./Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ paddingBottom: '60px' }}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
