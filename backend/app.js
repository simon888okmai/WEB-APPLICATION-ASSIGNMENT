require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/configs/:droneId', async (req, res) => {
  try {
    const { droneId } = req.params;
    const configUrl = process.env.DRONE_CONFIG_URL;
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Server 1: ${response.statusText}`);
    }
    const allConfigs = await response.json();
    const config = allConfigs.data.find((item) => item.drone_id == droneId);
    if (!config) {
      return res.status(404).json({ error: 'Drone ID not found' });
    }
    const filteredConfig = {
      drone_id: config.drone_id,
      drone_name: config.drone_name,
      light: config.light,
      country: config.country,
      weight: config.weight,
    };
    res.json(filteredConfig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/status/:droneId', async (req, res) => {
  try {
    const { droneId } = req.params;
    const configUrl = process.env.DRONE_CONFIG_URL;
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Server 1: ${response.statusText}`);
    }
    const allConfigs = await response.json();
    const config = allConfigs.data.find((item) => item.drone_id == droneId);
    if (!config) {
      return res.status(404).json({ error: 'Drone ID not found' });
    }
    const filteredStatus = {
      condition: config.condition
    };
    res.json(filteredStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/logs/:droneId', async (req, res) => {
  try {
    const { droneId } = req.params;
    const page = req.query.page || 1;
    const logsPerPage = 8;
    const url = `${process.env.LOG_URL}?filter=(drone_id='${droneId}')&sort=-created&perPage=${logsPerPage}&page=${page}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.LOG_API_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch from Server 2: ${response.statusText}`);
    }
    const logData = await response.json();
    const filteredLogs = logData.items.map((log) => ({
      id: log.id,
      drone_id: log.drone_id,
      celsius: log.celsius,
      created: log.created,
    }));
    const responseData = {
      logs: filteredLogs,
      pagination: {
        page: logData.page,
        perPage: logData.perPage,
        totalPages: logData.totalPages,
        totalItems: logData.totalItems,
      },
    };
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/logs', async (req, res) => {
  try {
    const dataToLog = req.body;
    const response = await fetch(process.env.LOG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LOG_API_TOKEN}`,
      },
      body: JSON.stringify(dataToLog),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to POST to Server 2: ${JSON.stringify(errorData)}`);
    }
    const createdLog = await response.json();
    res.status(201).json(createdLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Server is running on:`);
  console.log(`http://localhost:${PORT}`);
});