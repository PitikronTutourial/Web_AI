FROM node:latest

# ระบุไดเร็กทอรีที่เก็บโค้ดของ server
WORKDIR /usr/src/model

# คัดลอกไฟล์ package.json และ package-lock.json เพื่อติดตั้ง dependencies
COPY package.json ./

# ติดตั้ง dependencies โดยใช้ npm
RUN npm install

COPY . .

# กำหนดคำสั่งที่จะใช้เมื่อเริ่มต้น container
CMD ["npm", "start"]