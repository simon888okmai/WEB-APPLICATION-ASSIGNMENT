// File: frontend/app/page.js
'use client'; // ต้องเป็น Client Component เพราะเราจะ fetch ข้อมูลและเก็บ state

import { useEffect } from 'react';
import { useDrone } from '../context/DroneContext'; // 1. Import Hook ที่เราสร้าง

export default function ConfigPage() {
  // 2. ดึง "กล่อง" ข้อมูล และ "ฟังก์ชัน" จาก Context
  const { config, setConfig, loading, setLoading } = useDrone();

  // 3. ดึง ID และ API URL จาก .env
  const droneId = process.env.NEXT_PUBLIC_DRONE_ID;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 4. useEffect จะทำงาน 1 ครั้งเมื่อหน้าเว็บโหลด
  useEffect(() => {
    // กันไม่ให้ fetch ซ้ำถ้ามีข้อมูลแล้ว
    if (config) {
      setLoading(false);
      return;
    }

    async function fetchConfig() {
      try {
        console.log(`Fetching config from: ${apiUrl}/configs/${droneId}`);

        // 5. นี่คือการเรียก API ของ Assignment #1 (Backend) 
        const response = await fetch(`${apiUrl}/configs/${droneId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }

        const data = await response.json();

        // 6. บันทึกข้อมูลลง "กล่อง" ส่วนกลาง (Context)
        setConfig(data); 

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []); // [] หมายถึง ทำงานครั้งเดียว

  // --- 7. ส่วนแสดงผล (UI) ---
  if (loading) {
    return <div>Loading Config...</div>;
  }

  if (!config) {
    return <div>Error: Could not load config. (Is Backend server running?)</div>;
  }

  // แสดงผลตามโจทย์ Assignment #2 [cite: 100-104]
  return (
    <main>
      <h1>Page #1: View Config</h1>
      <h2>Drone ID: {config.drone_id}</h2>
      <ul>
        <li>Drone Name: {config.drone_name}</li>
        <li>Light: {config.light}</li>
        <li>Country: {config.country}</li>
        {/* (Weight ไม่ได้อยู่ใน list ที่โจทย์ให้แสดง) */}
      </ul>
    </main>
  );
}
