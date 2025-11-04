
'use client'; 

import './globals.css';
import { DroneProvider } from '../context/DroneContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DroneProvider>
          
          <main>
            {children}
          </main>
        </DroneProvider>
      </body>
    </html>
  );
}