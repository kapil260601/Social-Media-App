import '../styles/globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Social Media App',
  description: 'A simple social media app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
