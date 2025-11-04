// File: frontend/app/page.js (อัปเกรดแล้ว! 🚀)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDrone } from '../context/DroneContext';

export default function DashboardPage() {
  // --- Part 1: Config State (from Context) ---
  const { config, setConfig, loading: configLoading, setLoading: setConfigLoading } = useDrone();

  // --- Part 3: Logs State (อัปเกรด) ---
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // <-- 1. เพิ่ม State หน้าปัจจุบัน
  const [paginationInfo, setPaginationInfo] = useState(null); // <-- 2. เพิ่ม State ข้อมูลแบ่งหน้า

  // --- Part 2: Form State ---
  const [celsius, setCelsius] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState('');

  // --- Environment Variables ---
  const droneId = process.env.NEXT_PUBLIC_DRONE_ID;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // --- Part 1 Logic: Fetch Config (เหมือนเดิม) ---
  useEffect(() => {
    if (config || !droneId || !apiUrl) {
      setConfigLoading(false);
      return;
    }
    async function fetchConfig() {
      try {
        console.log(`Fetching config from: ${apiUrl}/configs/${droneId}`);
        const response = await fetch(`${apiUrl}/configs/${droneId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error(error);
      } finally {
        setConfigLoading(false);
      }
    }
    fetchConfig();
  }, [config, setConfig, setConfigLoading, droneId, apiUrl]);


  // --- Part 3 Logic: Fetch Logs Function (อัปเกรด) ---
  const fetchLogs = useCallback(async (pageToFetch) => {
    if (!droneId || !apiUrl) return;

    setLogsLoading(true);
    try {
      // 3. ส่ง "page" ไปกับ request
      console.log(`Fetching logs from: ${apiUrl}/logs/${droneId}?page=${pageToFetch}`);
      const response = await fetch(`${apiUrl}/logs/${droneId}?page=${pageToFetch}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      
      // 4. รับ Response object ใหม่
      const data = await response.json(); // (นี่คือ { logs: [], pagination: {} })
      
      setLogs(data.logs); // <-- 5. อัปเดต logs
      setPaginationInfo(data.pagination); // <-- 6. อัปเดตข้อมูลแบ่งหน้า
      setCurrentPage(data.pagination.page); // <-- 7. อัปเดตหน้าปัจจุบัน
      
    } catch (error) {
      console.error(error);
    } finally {
      setLogsLoading(false);
    }
  }, [droneId, apiUrl]);

  // Fetch logs on page load (เรียกหน้า 1)
  useEffect(() => {
    fetchLogs(1); 
  }, [fetchLogs]);


  // --- Part 2 Logic: Handle Form Submit (อัปเกรด) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage('');
    if (!config) { /* ... (เช็ค config เหมือนเดิม) ... */ }

    const dataToLog = { /* ... (ข้อมูล log เหมือนเดิม) ... */ };

    try {
      const response = await fetch(`${apiUrl}/logs`, { /* ... (POST เหมือนเดิม) ... */ });

      if (response.ok) {
        setMessage('Log created successfully!');
        setCelsius(''); 
        fetchLogs(1); // ⭐️ (อัปเกรด) Refresh กลับไปหน้า 1
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  // --- 8. เพิ่ม Function คลิกปุ่ม Next/Prev ---
  const handleNextPage = () => {
    if (paginationInfo && currentPage < paginationInfo.totalPages) {
      fetchLogs(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchLogs(currentPage - 1);
    }
  };

  // --- RENDER (JSX) ---
  return (
    <>
      <h1>Drone Dashboard</h1>
      <div className="dashboard-grid">
        {/* --- Card 1: View Config (เหมือนเดิม) --- */}
        <section className="card">
          <h2>Drone Config</h2>
          {configLoading ? (
            <p>Loading Config...</p>
          ) : config ? (
            <ul className="config-list">
              <li><strong>ID:</strong> {config.drone_id}</li>
              <li><strong>Name:</strong> {config.drone_name}</li>
              <li><strong>Country:</strong> {config.country}</li>
              <li><strong>Light:</strong> {config.light}</li>
            </ul>
          ) : (
            <p>Error: Could not load config.</p>
          )}
        </section>

        {/* --- Card 2: Log Form (เหมือนเดิม) --- */}
        <section className="card">
          <h2>Log Temperature</h2>
          <form className="log-form" onSubmit={handleSubmit}>
            <label htmlFor="celsius">Temperature (Celsius):</label>
            <input /* ... (Input attributes เหมือนเดิม) ... */
              id="celsius"
              type="number"
              step="0.1"
              value={celsius}
              onChange={(e) => setCelsius(e.target.value)}
              required
              disabled={formLoading}
            />
            <button type="submit" disabled={formLoading || configLoading}>
              {formLoading ? 'Submitting...' : 'Submit Log'}
            </button>
            {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
          </form>
        </section>

        {/* --- Card 3: View Logs (อัปเกรด) --- */}
        <section className="card log-table-container">
          <h2>Recent Logs</h2> {/* (ลบ "Last 12" ออก) */}
          {logsLoading ? (
            <p>Loading logs...</p>
          ) : (
            <>
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Celsius</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id.substring(0, 8)}...</td>
                        <td>{log.celsius}°C</td>
                        <td>{new Date(log.created).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* --- 9. เพิ่มปุ่ม Pagination! --- */}
              <div className="pagination-controls">
                <button 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1 || logsLoading}>
                  Previous
                </button>
                {paginationInfo && (
                  <span>
                    Page {paginationInfo.page} of {paginationInfo.totalPages}
                  </span>
                )}
                <button 
                  onClick={handleNextPage} 
                  disabled={(paginationInfo && currentPage === paginationInfo.totalPages) || logsLoading}>
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
