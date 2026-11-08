import './globals.css';

export const metadata = {
  title: "Tangi's Calma — Portfolio",
  description: "3D Interactive Art Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}