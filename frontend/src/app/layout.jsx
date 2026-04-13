import '../styles/globals.css';
import { AuthProvider } from '../components/AuthProvider';
import AppContent from '../components/AppContent';

export const metadata = {
  title: 'Rook ♜ — Your Agent\'s Home',
  description: 'Deploy OpenClaw agents in one click. No credit card required.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </body>
    </html>
  );
}
