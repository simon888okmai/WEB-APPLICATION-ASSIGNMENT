// File: frontend/context/DroneContext.js
'use client'; // บอก Next.js ว่าไฟล์นี้ใช้ในฝั่ง Client

import { createContext, useContext, useState } from 'react';

// 1. สร้าง "กล่อง" เก็บข้อมูล
const DroneContext = createContext();

// 2. สร้าง "ผู้ให้บริการ" ที่จะส่งข้อมูลให้ลูกๆ
export function DroneProvider({ children }) {
  const [config, setConfig] = useState(null); // นี่คือข้อมูล config ที่เราจะเก็บ
  const [loading, setLoading] = useState(true);

  return (
    <DroneContext.Provider value={{ config, setConfig, loading, setLoading }}>
      {children}
    </DroneContext.Provider>
  );
}

// 3. สร้าง Hook สั้นๆ ให้หน้าอื่นเรียกใช้
export function useDrone() {
  return useContext(DroneContext);
}