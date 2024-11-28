const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3002; // กำหนดพอร์ต

const corsOptions = {
  origin: 'http://192.168.15.227:5777', // หรือที่ตั้ง React app ของคุณ
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Middleware for parsing JSON body

// กำหนดเส้นทางที่รูปภาพจะถูกเก็บไว้
const imageFolderPath = 'imgFromServer';

/* -------------- API รับมาจาก client ตอน Add student -------------- */
//เก็บรูปลง Folder imgFromServer
app.post('/sendimg-model', (req, res) => {
  //console.log("req: ",req.body.base64Image)
  const { base64Image, studentId } = req.body;

  // แปลง base64 เป็น buffer
  let imageBuffer;
  try {
    // แยกส่วนของข้อมูล header และ data
    const base64Data = base64Image.split(',')[1];
    // แปลง base64 เป็น buffer
    imageBuffer = Buffer.from(base64Data, 'base64');
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Invalid base64 string' });
  }
  
  // สร้างชื่อไฟล์สำหรับรูปภาพโดยใช้ studentId พร้อมกับ date
  const imageName = `${studentId}_${Date.now()}.jpeg`;

  // กำหนด path สำหรับบันทึกไฟล์
  const studentFolderPath = path.join(imageFolderPath, studentId);
  const filePath = path.join(studentFolderPath, imageName);

  // เช็คว่าโฟลเดอร์ชื่อ studentId มีอยู่หรือไม่
  if (!fs.existsSync(studentFolderPath)) {
    // ถ้าไม่มี ให้สร้างโฟลเดอร์ชื่อ studentId
    fs.mkdirSync(studentFolderPath, { recursive: true });
  }

  // เขียน buffer เป็นไฟล์รูปภาพ
  fs.writeFile(filePath, imageBuffer, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save image' });
    }

    // ส่ง response กลับไปพร้อมกับ path ของไฟล์ที่บันทึก
    return res.status(200).json({ message: 'Image uploaded successfully', filePath });
  });

});

const ImagePath = 'static/picdata'; // กำหนด path ของโฟลเดอร์ picdata

// /* -------------- Function ส่งรูปไปที่ server พร้อมกับข้อมูลรูปภาพ -------------- */
// function sendImageData(imageDataface, imageDatafull, image_id) {
//   // ส่ง API request ไปยังเซิร์ฟเวอร์อีกตัว
//   axios.post('http://192.168.15.227:5778/sendimg-server', { imageDataface, imageDatafull, image_id })
//     .then((response) => {
//       console.log('API request sent successfully:', response.data);
//     })
//     .catch((error) => {
//       console.error('Error sending API request:', error);
//     });
// }

/* -------------- Function สำหรับเก็บข้อมูลไว้ส่ง Server  -------------- */
// function startWatchingFolders() {
//   let filePathface = '';
//   let filePathfull = '';

//   const watchPromise = new Promise((resolve, reject) => {
//     fs.watch(ImagePath, { recursive: true }, (eventType, filename) => {
//       // ตรวจสอบว่าเป็นการสร้างไฟล์ใหม่หรือไม่
//       if (eventType === 'rename') {
//         let image_split = filename.split('\\')[1];
//         image_split = image_split.split('_')[0];
//         if (image_split === 'face' && filePathface === '') {
//           filePathface = path.join(ImagePath, filename);
//         }
//         if (image_split === 'full' && filePathfull === '') {
//           filePathfull = path.join(ImagePath, filename);
//         }
//         // ตรวจสอบว่าทั้ง filePathface และ filePathfull ได้ถูกกำหนดค่าแล้วหรือไม่
//         if (filePathface !== '' && filePathfull !== '') {
//           resolve({ filePathface, filePathfull, filename });
//         }
//       }
//     });
//   });

//   watchPromise.then(({ filePathface, filePathfull, filename }) => {
//     const image_id = filename.split('_')[1];
//     console.log(image_id)
//     const imageDataface = fs.readFileSync(filePathface, { encoding: 'base64' });
//     const imageDatafull = fs.readFileSync(filePathfull, { encoding: 'base64' });
//     sendImageData(imageDataface, imageDatafull, image_id);
//   }).catch(error => {
//     console.error('An error occurred:', error);
//   });
// }


/* -------------- API รับมาจาก camera.py -------------- */
//เก็บข้อมูลที่ predict ได้ลงในไฟล์ my_list.json
app.post('/send-result-list', (req, res) => {
  const { result_list } = req.body;

  // ตรวจสอบขนาดของไฟล์ JSON
  const filePath = '../my_list.json';
  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;

  // ตรวจสอบว่าไฟล์ว่างเปล่าหรือไม่
  if (fileSize === 0) {
      fs.writeFileSync(filePath, JSON.stringify(result_list, null, 4));
      updateDatabaseFromJson();
      //startWatchingFolders();
  } else {
      // อ่านข้อมูล JSON ที่มีอยู่ในไฟล์
      const existingData = JSON.parse(fs.readFileSync(filePath));

      // เพิ่มข้อมูลใหม่ลงในลิสต์ของ JSON
      // ตรวจสอบว่า result_list เป็นอาร์เรย์หรือไม่
      if (Array.isArray(result_list)) {
          existingData.push(...result_list);
      } else {
          existingData.push(result_list);
      }

      // เขียนข้อมูล JSON ทั้งหมดลงในไฟล์
      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 4));
      updateDatabaseFromJson();
      //startWatchingFolders();
  }

  // ส่ง response กลับเพื่อยืนยันการรับข้อมูล
  res.status(200).json({ message: 'Result list received successfully' });
});


// เริ่มต้นค่า previous_modification_time เป็น null
let previousModificationTime = null;

/* -------------- Function เพิ่มข้อมูลลง report จากการอ่านไฟล์.json -------------- */
async function updateDatabaseFromJson() {
  // อ่านข้อมูลจากไฟล์ JSON
  const jsonData = fs.readFileSync('../my_list.json', 'utf-8');
  const data = JSON.parse(jsonData);

  // ตรวจสอบการเปลี่ยนแปลงในไฟล์ JSON
  const currentModificationTime = fs.statSync('../my_list.json').mtimeMs;
  if (previousModificationTime !== null && currentModificationTime > previousModificationTime) {
    const lastEntry = data[data.length - 1];
        // ตรวจสอบว่า entry เป็น array และมีความยาวมากกว่า 1 หรือไม่
        if (typeof lastEntry === 'object' && lastEntry !== null && data.length > 1) {
          const details = lastEntry;
          const formattedDate = details['date'].split(" ")[0];
          const studentId = details['s_id']
          const imageface = fs.readFileSync('../face.jpeg', { encoding: 'base64' });
          const imagefull = fs.readFileSync('../full.jpeg', { encoding: 'base64' });
          const val = {
            s_id : details['s_id'],
            pic_r: imageface,
            pic_cam: imagefull,
            date: details['date'],
            mood: details['mood'],
            age: details['age'],
            gender: details['gender']
          }
          console.log(val)
          if(studentId.length === 13) {
            // เช็คว่าข้อมูลที่จะเพิ่มเข้าฐานข้อมูลมีอยู่แล้วหรือไม่
            const result = await axios.get(`http://192.168.15.227:5778/model-report/${studentId}?date=${formattedDate}`);
            const responseData = result.data;
            if (responseData) {
              // ส่ง API ไปยังเซิร์ฟเวอร์พร้อมกับข้อมูลเก็บลง table report
              await axios.post('http://192.168.15.227:5778/datamodel-report', val )
                .then((response) => {
                  console.log('API request sent successfully:', response.data);
                })
                .catch((error) => {
                  console.error('Error sending API request:', error);
                });
            } else {
              console.log('Data to be added to the database already exists.')
            }
          } else if(studentId.length === 8) {
            // ส่ง API ไปยังเซิร์ฟเวอร์พร้อมกับข้อมูลเก็บลง table report
            await axios.post('http://192.168.15.227:5778/datamodel-report', val )
            .then((response) => {
              console.log('API request sent successfully:', response.data);
            })
            .catch((error) => {
              console.error('Error sending API request:', error);
            });
          }
        } else {
          console.log("entry is null!")
        }
      
  } else {
      console.log("ไม่มีการเปลี่ยนแปลงในไฟล์ JSON");
  }

  // อัพเดตเวลาการแก้ไขไฟล์ JSON
  previousModificationTime = currentModificationTime; // กำหนดค่าใหม่ให้กับ previousModificationTime
}


/* -------------- Function ดึงข้อมูลจาก greetword จากการอ่านไฟล์.json -------------- */
app.get('/get-greet', async (req, res) => {
  let setsay = null;

  try {
    // อ่านข้อมูลจากไฟล์ JSON
    const jsonData = fs.readFileSync('../my_list.json', 'utf-8');
    const data = JSON.parse(jsonData);
    console.log("อ่านไฟล์ละนะ")

    // ตรวจสอบการเปลี่ยนแปลงในไฟล์ JSON
    const currentModificationTime = fs.statSync('../my_list.json').mtimeMs;
    if (previousModificationTime !== null && currentModificationTime > previousModificationTime) {
        const lastEntry = data[data.length - 1];
        if (typeof lastEntry === 'object' && lastEntry!== null && data.length > 1) {
            const details = lastEntry;
            const studentId = details['s_id']
            const mood = details['mood']
            const moodToCategory = { 'neutral': 1, 'happy': 2, 'surprise': 3, 'fear': 4, 'sad': 5, 'disgust': 6, 'angry': 7 };
            const g_category = moodToCategory[mood] || 1;
            if (studentId.length === 13) {
                const setnameResponse = await axios.get(`http://192.168.15.227:5778/student-from-server/${studentId}`);
                const setgreetResponse = await axios.get(`http://192.168.15.227:5778/getmood/${g_category}`);
                
                const setname = setnameResponse.data;
                const setgreet = setgreetResponse.data;
                console.log(setname);
                console.log(setgreet);
                if (setgreet !== undefined && setgreet !== null && setgreet.length !== 0) {
                  setsay = setgreet[0].greeting + setname[0].s_name;
                  console.log(setsay)
                }else{
                  setsay = "สวัสดีครับ" + setname[0].s_name;
                  console.log(setsay);
                }
            } else {
              setsay = "สวัสดีครับ";
              console.log(setsay);
            }
        
      }
    }
    // อัพเดตเวลาการแก้ไขไฟล์ JSON
    previousModificationTime = currentModificationTime; // กำหนดค่าใหม่ให้กับ previousModificationTime
    
    res.json(setsay); // ส่งค่า setsay กลับเมื่อทุกอย่างเสร็จสมบูรณ์
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Internal Server Error' }); // ส่งข้อความผิดพลาดเมื่อเกิดข้อผิดพลาด
  }
});


// รันเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});