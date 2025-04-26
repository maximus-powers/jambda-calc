import type React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Sidebar from '@/components/sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'jambda-calc docs',
  description: 'Docs for the jambda-calc JS-to-Lambda transpiler and visualizer (node package).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              const mode = localStorage.getItem('theme');
              if (mode === 'dark') {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          })();
        `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto md:ml-64">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
