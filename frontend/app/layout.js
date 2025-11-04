// File: frontend/app/layout.js
import { DroneProvider } from '../context/DroneContext'; // 1. Import
import './globals.css';
// (import อื่นๆ ... )

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DroneProvider> {/* 2. ครอบ children ด้วย Provider */}
          {children}
        </DroneProvider>
      </body>
    </html>
  );
}
