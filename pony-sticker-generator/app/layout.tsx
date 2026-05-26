import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pony Sticker Generator',
  description: 'Pixel pony to hand-drawn reaction sticker workflow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
