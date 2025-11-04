
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDrone } from '../context/DroneContext';

export default function DashboardPage() {
  
  const { config, setConfig, loading: configLoading, setLoading: setConfigLoading } = useDrone();

  
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState(null);

  
  const [celsius, setCelsius] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState('');

  
  const droneId = process.env.NEXT_PUBLIC_DRONE_ID;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  
  useEffect(() => {
    if (config || !droneId || !apiUrl) {
      setConfigLoading(false);
      return;
    }
    async function fetchConfig() {
      try {
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

  
  const fetchLogs = useCallback(async (pageToFetch) => {
    if (!droneId || !apiUrl) return;
    setLogsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/logs/${droneId}?page=${pageToFetch}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data.logs);
      setPaginationInfo(data.pagination);
      setCurrentPage(data.pagination.page);
    } catch (error) {
      console.error(error);
    } finally {
      setLogsLoading(false);
    }
  }, [droneId, apiUrl]);

  
  useEffect(() => {
    fetchLogs(1); 
  }, [fetchLogs]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage('');
    
    if (!config) {
      setMessage('Error: Config not loaded. Please wait or refresh.');
      setFormLoading(false);
      return;
    }

    const dataToLog = { 
      drone_id: config.drone_id,
      drone_name: config.drone_name,
      country: config.country,
      celsius: parseFloat(celsius),
    };

    try {
      const response = await fetch(`${apiUrl}/logs`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToLog) 
      });

      if (response.ok) {
        setMessage('Log created successfully!');
        setCelsius(''); 
        fetchLogs(1);
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

  
  return (
    <>
      <h1>Drone Dashboard</h1>
      <div className="dashboard-grid">
        
        
        <section className="card">
          
          <h2>Drone Configuration</h2>
          {configLoading ? (
            <p>Loading Config...</p>
          ) : config ? (
            
            <div className="config-grid">
              <div className="config-item">
                <span className="config-item-header">ID</span>
                <span className="config-item-data">{config.drone_id}</span>
              </div>
              <div className="config-item">
                <span className="config-item-header">Name</span>
                <span className="config-item-data">{config.drone_name}</span>
              </div>
              <div className="config-item">
                <span className="config-item-header">Country</span>
                <span className="config-item-data">{config.country}</span>
              </div>
              <div className="config-item">
                <span className="config-item-header">Light</span>
                <span className="config-item-data">{config.light}</span>
              </div>
            </div>
          ) : (
            <p>Error: Could not load config.</p>
          )}
        </section>

        
        <section className="card">
          <h2>Log Temperature</h2>
          <form className="log-form" onSubmit={handleSubmit}>
            <label htmlFor="celsius">Temperature (Celsius):</label>
            <input
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

        
        <section className="card log-table-container">
          <h2>Recent Logs</h2>
          {logsLoading ? (
            <p>Loading logs...</p>
          ) : (
            <>
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Created</th>
                    <th>Country</th>
                    <th>Drone ID</th>
                    <th>Drone Name</th>
                    <th>Celsius</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.created).toLocaleString()}</td>
                        <td>{log.country}</td>
                        <td>{log.drone_id}</td>
                        <td>{log.drone_name}</td>
                        <td>{log.celsius}°C</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              
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