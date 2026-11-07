import './globals.css';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ 
  subsets: ['latin'],
  variable: '--font-cinzel',
});

export const metadata = {
  title: "TANGI'S CALMA | Portfolio",
  description: 'Portfolio de ilustración tradicional',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={cinzel.variable}>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}