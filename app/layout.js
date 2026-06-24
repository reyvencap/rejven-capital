import "./globals.css";

export const metadata = {
  title: "Rejven Capital",
  description: "Every position. Every trade. In the open.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
