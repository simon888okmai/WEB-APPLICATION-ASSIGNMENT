// File: frontend/app/layout.js
'use client'; 

import './globals.css';
import { DroneProvider } from '../context/DroneContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DroneProvider>
          {/* เราไม่ต้องใช้ <nav> แล้ว เพราะทุกอย่างอยู่ในหน้าเดียว */}
          <main>
            {children}
          </main>
        </DroneProvider>
      </body>
    </html>
  );
}