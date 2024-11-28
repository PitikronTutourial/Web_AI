# เลือกภาพที่มี Node.js เป็นฐาน
FROM node:latest

# ระบุไดเร็กทอรีที่เก็บโค้ดของ client
WORKDIR /usr/src/app

# คัดลอกไฟล์ package.json และ package-lock.json เพื่อติดตั้ง dependencies
COPY package*.json ./

# ติดตั้ง dependencies โดยใช้ npm
RUN npm install

# คัดลอกโค้ดของ client ไปยัง Docker image
COPY . .

EXPOSE 8000

# กำหนดคำสั่งที่จะใช้เมื่อเริ่มต้น container
CMD ["npm", "start"]