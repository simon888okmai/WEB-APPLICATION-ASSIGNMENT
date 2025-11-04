// File: backend/index.js

// 1. โหลด Library
require('dotenv').config(); // ต้องอยู่บรรทัดแรกสุด!
const express = require('express');
const cors = require('cors');

// 2. ตั้งค่า Server
const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares (สิ่งที่ต้องทำก่อน) ---
app.use(cors()); // อนุญาตให้ Frontend (Vercel) เรียกได้
app.use(express.json()); // ทำให้ Server อ่าน JSON จาก req.body ได้ (สำหรับ POST)

// --- API Endpoints (ตามโจทย์ Assignment #1) ---

/**
 * -------------------------------------
 * Endpoint #1: GET /configs/:droneId
 * -------------------------------------
 */
app.get('/configs/:droneId', async (req, res) => {
  console.log('Request received for GET /configs');
  try {
    // 1. ดึง droneId จาก URL (เช่น /configs/3001)
    const { droneId } = req.params;

    // 2. ดึง URL ของ Server 1 จาก .env
    const configUrl = process.env.DRONE_CONFIG_URL;

    // 3. เรียก Server 1 (Google Script)
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Server 1: ${response.statusText}`);
    }
    const allConfigs = await response.json();

    console.log('--- Data from Server 1: ---');
    console.log(allConfigs);

    // 4. หา Config ของ ID ที่ตรงกัน
    const config = allConfigs.data.find((item) => item.drone_id == droneId);

    if (!config) {
      return res.status(404).json({ error: 'Drone ID not found' });
    }

    // 5. กรองข้อมูลเฉพาะ field ที่โจทย์ต้องการ
    const filteredConfig = {
      drone_id: config.drone_id,
      drone_name: config.drone_name,
      light: config.light,
      country: config.country,
      weight: config.weight,
    };

    // 6. ส่งข้อมูลที่กรองแล้วกลับไป
    res.json(filteredConfig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * -------------------------------------
 * Endpoint #2: GET /status/:droneId
 * -------------------------------------
 */
app.get('/status/:droneId', async (req, res) => {
  console.log('Request received for GET /status');
  try {
    // 1. ดึง droneId (เหมือน /configs)
    const { droneId } = req.params;

    // 2. เรียก Server 1 (เหมือน /configs) 
    const configUrl = process.env.DRONE_CONFIG_URL;
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Server 1: ${response.statusText}`);
    }
    const allConfigs = await response.json();

    // 3. หา Config ที่ตรงกัน (เหมือน /configs, ใช้ .data ที่เราแก้ไปแล้ว)
    const config = allConfigs.data.find((item) => item.drone_id == droneId);

    if (!config) {
      return res.status(404).json({ error: 'Drone ID not found' });
    }

    // 4. กรอง field (จุดที่ต่าง!)
    //    โจทย์สั่งให้เอาแค่ condition 
    const filteredStatus = {
      condition: config.condition
    };

    // 5. ส่ง JSON กลับไป [cite: 43]
    res.json(filteredStatus);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * -------------------------------------
 * Endpoint #3: GET /logs/:droneId
 * -------------------------------------
 */
/**
 * -------------------------------------
 * Endpoint #3: GET /logs/:droneId
 * -------------------------------------
 */
app.get('/logs/:droneId', async (req, res) => {
  console.log('Request received for GET /logs');
  try {
    const { droneId } = req.params;

    // 1. นี่คือการเรียก Server 2 (Pockethost) [cite: 54]
    //    เราสร้าง URL ให้กรอง (filter) ตาม droneId,
    //    เรียง (sort) ตามวันที่สร้างล่าสุด (-created),
    //    และจำกัด 12 รายการ (perPage=12) ตามโจทย์ 
    const url = `${process.env.LOG_URL}?filter=(drone_id='${droneId}')&sort=-created&perPage=12`;

    // 2. เรียก fetch โดยใส่ 'Authorization' Header (API Token) [cite: 18]
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.LOG_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Server 2: ${response.statusText}`);
    }

    const logData = await response.json();

    // 3. กรอง field ข้อมูล (Pockethost จะส่ง field มาเยอะมาก)
    //    (โจทย์ใน PDF สั่งเอา drone_name, country ด้วย [cite: 57]
    //     แต่ Server 2 ไม่มีข้อมูลนั้น เราจึงเอาเฉพาะเท่าที่มี)
    const filteredLogs = logData.items.map((log) => ({
      id: log.id,
      drone_id: log.drone_id,
      celsius: log.celsius,
      created: log.created,
    }));

    res.json(filteredLogs); // ส่ง JSON Array ที่กรองแล้วกลับไป
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * -------------------------------------
 * Endpoint #4: POST /logs
 * -------------------------------------
 */
/**
 * -------------------------------------
 * Endpoint #4: POST /logs
 * -------------------------------------
 */
app.post('/logs', async (req, res) => {
  console.log('Request received for POST /logs');
  try {
    // 1. ดึงข้อมูล (JSON) ที่ Frontend (Assignment #2) ส่งมา 
    const dataToLog = req.body;
    
    // (โจทย์ Assignment #2 บอกว่า Frontend จะส่ง:
    //  drone_id, drone_name, country, celsius) [cite: 117-118]
    //  เราจะส่งข้อมูลทั้งหมดนี้ต่อไปยัง Server 2 [cite: 78]

    // 2. ส่งข้อมูลนี้ (POST) ไปยัง Server 2
    const response = await fetch(process.env.LOG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LOG_API_TOKEN}`, // อย่าลืม Token
      },
      body: JSON.stringify(dataToLog), // แปลง object เป็น string JSON
    });

    if (!response.ok) {
      // อ่าน error จาก Server 2
      const errorData = await response.json();
      throw new Error(`Failed to POST to Server 2: ${JSON.stringify(errorData)}`);
    }

    // 3. ส่งผลลัพธ์ที่ได้จาก Server 2 กลับไป
    const createdLog = await response.json();
    res.status(201).json(createdLog); // 201 = Created

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --- 5. สั่งให้ Server เริ่มทำงาน ---
app.listen(PORT, () => {
  console.log(`✅ API Server (Assignment #1) is running on:`);
  console.log(`http://localhost:${PORT}`);
});