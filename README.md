
# WEB-APPLICATION-ASSIGNMENT

โปรเจคนี้จัดทำเพื่อส่งวิชา Web Application Development ทำโดย 66010348 ธนากร วิศิษฏ์กิจการ

โปรเจกต์นี้เป็น Monorepo ที่ประกอบด้วย 2 ส่วนหลัก:

* **`/backend`**: API Server (Backend)
    * สร้างด้วย **Node.js + Express**
    * ทำหน้าที่ดึงข้อมูล Config, Status และจัดการ Logs (GET/POST)
    * Deploy บน **Render.com**

* **`/frontend`**: Dashboard (Frontend)
    * สร้างด้วย **Next.js + React**
    * เป็นหน้า Dashboard แบบ Single-Page ที่รวมการแสดงผล (Config), การส่งข้อมูล (Form), และตาราง (Logs + Pagination)
    * Deploy บน **Vercel**



##  URLs 

* [**Backend API**](https://web-application-assignment.onrender.com)  
    *(เมื่อคลิกเข้าไป จะต้องแสดง JSON {"status":"ok",...})*

* [**Frontend Dashboard**](https://web-application-assignment-mocha.vercel.app) 
    *(เมื่อเข้าครั้งแรกแล้ว Error ต้องรอ 30-60วินาที แล้ว Refesh เนื่องจาก API Server อยู่ในช่วง Spin Down )*

## Environment
การสร้างไฟล์ `.env` เพื่อใช้งาน
โปรเจกต์นี้ต้องใช้ไฟล์ Environment Variables (ไฟล์ความลับ) 2 จุด เพื่อให้โปรเจกต์ทำงานได้ (ไฟล์นี้จะถูก `.gitignore` บล็อกไว้ ไม่ให้ขึ้น GitHub)

### 1. Backend (`/backend`)

ในโฟลเดอร์ `backend/` ให้สร้างไฟล์ชื่อ **`.env`**

```ini
DRONE_CONFIG_URL=
LOG_URL=
LOG_API_TOKEN=
PORT=3001
```
### 2. Frontend (`/frontend`)

ในโฟลเดอร์ `frontend/` ให้สร้างไฟล์ชื่อ **`.env.local`**
```ini
NEXT_PUBLIC_DRONE_ID=
NEXT_PUBLIC_API_URL=
```
## การติดตั้ง
### 1. Backend
```bash 
cd backend
npm install
```
### 2. Frontend
```bash
cd frontend
npm install
```

## การรันโปรเจกต์ 

หลังจากติดตั้ง (npm install) ทั้ง `backend` และ `frontend` และสร้างไฟล์ `.env` ทั้ง 2 ที่แล้ว...


### 1. รัน Backend 

```bash
cd backend
node app.js
```
Server รันที่ `http://localhost:3001`
### 2. รัน Frontend 

```bash
cd frontend
npm run dev
```
Server รันที่ `http://localhost:3000`
## API Backend
-    `GET /`  ตรวจสอบว่า API Server ทำงานอยู่หรือไม่
-   `GET /configs/:droneId`  ดึงข้อมูลของ Drone
-   `GET /status/:droneId`  ดึงข้อมูล Status ของ Drone
-   `GET /logs/:droneId?page=<หมายเลขหน้า>`  ดึงรายการ Log
-   `POST /logs`  สร้าง Log ใหม่ 
