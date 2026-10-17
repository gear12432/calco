import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CalcPulse - Modern Scientific Calculator',
  description: 'A sleek, responsive calculator app featuring standard and scientific modes, calculation history, unit conversions, memory functions, and full keyboard support.',
  openGraph: {
    title: 'CalcPulse - Modern Scientific Calculator',
    description: 'A sleek, responsive calculator app featuring standard and scientific modes, calculation history, unit conversions, memory functions, and full keyboard support.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalcPulse - Modern Scientific Calculator',
    description: 'A sleek, responsive calculator app featuring standard and scientific modes, calculation history, unit conversions, memory functions, and full keyboard support.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
