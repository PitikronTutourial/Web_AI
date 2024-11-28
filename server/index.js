const express = require('express');
const app = express();
const mysql = require('mysql2');

const cors = require('cors');

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const jwt = require('jsonwebtoken')
const secret = 'AI-Project'


const allowedOrigins = ['http://192.168.15.227:5777', 'http://192.168.15.227:5780'];
const corsOptions = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const c = require('lodash')

//create folder
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // กำหนดโฟลเดอร์ที่ไฟล์จะถูกบันทึกไว้

//middleware
const { auth } = require('./middleware/auth')

// {/*localhost xmapp*/}
// const db = mysql.createConnection({
//     user: "root",
//     host: "localhost",
//     password: "",
//     database: "ai_project"
// })

// {/* docker */}
const db = mysql.createConnection({
    user: "root",
    host: "db",
    password: "root",
    database: "ai_project"
})

app.get('/professor', (req, res) => {
    db.query("SELECT * FROM professor", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.post('/login', (req, res) => {
    db.execute('SELECT * FROM professor WHERE username=?', [req.body.username],
        function(err, professor, fields) {
            if (err) {
                res.json({ status: 'error', message: err })
                return
            }
            if (professor.length == 0) {
                res.json({ status: 'error', message: 'no user found' })
                return
            }

            console.log(req.body.password)

            if (!c.isEqual(professor[0].password, req.body.password)) {
                return res.status(400).send("Password Incorrect")
            }

            if (professor.length > 0) {
                const payload = {
                    professor: {
                        username: professor[0].username,
                        password: professor[0].password
                    },
                };
                const token = jwt.sign(payload, secret, { expiresIn: '10h' }, (err, token) => {
                        if (err) throw err;
                        res.json({ token, payload })
                    })
                    //res.json({ status: 'ok', message: 'login success', token })
                return
            } else {
                res.json({ status: 'error', message: 'login failed' })
                return
            }
        })
})

app.post("/current-user", auth, function(req, res, next) {
    try {
        db.execute('SELECT * FROM professor WHERE username=?', [req.professor.username],
            function(err, professor, fields) {
                if (err) {
                    return
                } else {
                    const userInfo = {
                        ID: professor[0].p_id,
                        Name: professor[0].p_name + professor[0].p_sname,
                        Username: professor[0].username,
                        Password: professor[0].password
                    }
                    return res.send(userInfo)
                }
            })
    } catch (err) {
        console.log(err)
        res.status(500).send("Server Error")
    }
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const studentId = req.body.studentId; // รหัสนักศึกษาที่ส่งมาจาก client
        const folderPath = path.join(__dirname, 'student_folders', studentId);
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

app.post('/studentadd', upload.single('file'), jsonParser, function(req, res, next) {
    db.execute('SELECT * FROM student WHERE s_id=?', [req.body.studentId], function(err, student, fields) {
        if (student.length === 0) {
            const { studentId, firstName, lastName, birthDate, gender } = req.body;

            const folderPath = path.join(__dirname, 'student_folders', studentId);

            fs.mkdir(folderPath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).json({ status: 'error', message: 'Failed to create student folder.' });
                }

                const updatedPicPath = path.join('student_folders', studentId);
                
                // Multer จะเพิ่ม property `file` ใน `req` ซึ่งจะมีข้อมูลเกี่ยวกับไฟล์ที่อัปโหลด
                const uploadedFile = req.file;
                
                // ตรวจสอบว่าไฟล์ถูกอัปโหลดหรือไม่
                if (uploadedFile) {
                    // ระบุ path ที่ไฟล์จะถูกบันทึก
                    const filePath = path.join(folderPath, uploadedFile.originalname);
                    
                    // ย้ายไฟล์ไปยังโฟลเดอร์ปลายทาง
                    fs.rename(uploadedFile.path, filePath, (err) => {
                        if (err) {
                            return res.status(500).json({ status: 'error', message: 'Failed to save file.' });
                        }

                        // ทำตามขั้นตอนที่เหลือในการเพิ่มข้อมูลลงในฐานข้อมูล
                        db.execute('INSERT INTO student (s_id, s_name, s_sname, dateofbirth, gender, pic) VALUES (?, ?, ?, ?, ?, ?)', [studentId, firstName, lastName, birthDate, gender, updatedPicPath], function(err, results, fields) {
                            if (err) {
                                return res.status(500).json({ status: 'error', message: 'Failed to update database.' });
                            }
                            res.json({ status: 'ok' });
                        });
                    });
                } else {
                    // ถ้าไม่มีไฟล์ถูกอัปโหลด
                    res.status(400).json({ status: 'error', message: 'File not uploaded.' });
                }
            });

            return;
        }

        if (err) {
            return res.status(500).json({ status: 'error', message: 'Database error.' });
        }

        if (c.isEqual(student[0].s_id, req.body.studentId)) {
            return res.status(400).send("Student ID is already existed");
        }
    });
});

app.post('/studentadd/:studentId', upload.single('file'), function(req, res) {
    const studentId = req.params.studentId;

    const folderPath = path.join(__dirname, 'student_folders', studentId);

    // Create the student_folders/s_id directory if it doesn't exist
    fs.mkdirSync(folderPath, { recursive: true });

    const uploadedFile = req.file;

    if (uploadedFile) {

        const timestamp = new Date().getTime();
        const uniqueFilename = `${timestamp}_${uploadedFile.originalname}`;
        const filePath = path.join(folderPath, uniqueFilename);

        // Move the file from the temporary storage to the desired folder
        fs.renameSync(uploadedFile.path, filePath);

        // Continue with the rest of the database update process if needed
        res.json({ status: 'ok' });
    } else {
        res.status(400).json({ status: 'error', message: 'File not uploaded.' });
    }
});

app.get('/student', (req, res) => {
    const searchQuery = req.query.search || ''; // ดึงคำค้นหาจาก query parameters

    let query = "SELECT * FROM student";
    if (searchQuery) {
        query += ` WHERE s_name LIKE '%${searchQuery}%' OR s_sname LIKE '%${searchQuery}%' OR s_id LIKE '%${searchQuery}%'`;
    }

    db.query(query, (err, result) => {
        if (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
        } else {
        res.send(result);
        }
    });
});

app.get('/student/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    //console.log('Received studentId:', studentId); // Log or print the studentId to the console

    if (!studentId) {
        // If studentId is not provided, return an error response
        return res.status(400).json({ error: 'Student ID is required.' });
    }

    db.query("SELECT * FROM student WHERE s_id = ?", [studentId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            //console.log(result)
            if (result.length === 0) {
                // If no student is found with the provided ID, return a not found response
                return res.status(404).json({ error: 'Student not found.' });
            }

            // If student is found, return the result
            res.json(result[0]);
        }
    });
});

app.put('/student/:studentId', async (req, res) => {
    const studentId = req.params.studentId;
    const updatedStudent = req.body;

    try {
        const result = await db.query('UPDATE student SET ? WHERE s_id = ?', [updatedStudent, studentId]);
        console.log('Student updated successfully');
        res.status(200).json(updatedStudent);  // ส่งข้อมูลที่ถูกอัปเดตกลับ
    } catch (err) {
        console.log('Error updating student:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/student/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    db.query("DELETE FROM student WHERE s_id = ?", [studentId], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'An error occurred deleting data.' });
        } else {
            if (result.affectedRows > 0) {
                res.json({ message: 'Student information has been deleted.' });
            } else {
                res.status(404).json({ message: 'The student you want to delete was not found.' });
            }
        }
    });
});


app.get('/greetword', (req, res) => {
    db.query("SELECT * FROM greetword", (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.send(result);
        }
    });
});

app.post('/greetword', (req, res) => {
    const { greeting, g_category } = req.body;

    db.query("INSERT INTO greetword (greeting, g_category) VALUES (?, ?)", [greeting, g_category], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.json({ message: 'Greetword added successfully.' });
        }
    });
});

app.delete('/greetword/:greeting', (req, res) => {
    const greetingToDelete = req.params.greeting;

    db.query("DELETE FROM greetword WHERE greeting = ?", [greetingToDelete], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            if (result.affectedRows > 0) {
                res.json({ message: 'Greetword has been deleted.' });
            } else {
                res.status(404).json({ message: 'The greetword you want to delete was not found.' });
            }
        }
    });
});

app.get('/report', (req, res) => {
    const searchQuery = req.query.search || '';

    let query = `
        SELECT report.*, student.*, 
        CASE 
            WHEN report.s_id = 'stranger' THEN report.gender
            ELSE student.gender
        END AS gender
        FROM report
        LEFT JOIN student ON student.s_id = report.s_id
    `;

    if (searchQuery) {
        query += ` WHERE report.s_id LIKE '%${searchQuery}%' OR student.s_name LIKE '%${searchQuery}%' OR report.date LIKE '%${searchQuery}%'OR student.gender LIKE '%${searchQuery}%' `;
    }

    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            const combinedData = result.map(row => ({
                ...row,
                studentInfo: {
                    s_id: row.s_id,
                    s_name: row.s_name
                }
            }));

            res.send(combinedData);
            //console.log(combinedData);
        }
    });
});

app.post('/sendimg-server', (req, res) => {
    // รับข้อมูลรูปภาพและประเภทของรูปภาพจาก request body
    const { imageDataface, imageDatafull, image_id } = req.body;

    // ทำการตรวจสอบประเภทของรูปภาพและดำเนินการตามเงื่อนไข
    if (imageDataface !== '' && imageDatafull !== '') {
        db.query('INSERT INTO image (face, full, image_id) VALUES (?, ?, ?)',
            [imageDataface, imageDatafull, image_id ], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log('image added to the database successfully');
                res.status(200).json();
            }
        )
    } else {
      // ประเภทของรูปภาพไม่ถูกต้อง
      return res.status(400).json({ error: 'Image is None' });
    }
    // ส่งข้อความยืนยันการรับรูปภาพกลับไปยัง client
    return res.status(200).json({ message: 'Image received successfully' });
});


app.post('/datamodel-report', (req, res) => {
    const reportData = req.body; // รับข้อมูลที่ส่งมาจาก client

    // ดำเนินการบันทึกข้อมูลลงในฐานข้อมูล MySQL
    db.query('INSERT INTO report (s_id, pic_r, pic_cam, date, mood, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)', 
             [reportData.s_id, reportData.pic_r, reportData.pic_cam, reportData.date, reportData.mood, reportData.age, reportData.gender],
             (err, result) => {
                 if (err) {
                     console.error(err);
                     return res.status(500).json({ error: 'Internal Server Error' });
                 }
                 console.log('Data from model added to the database successfully');
                 res.status(200).json({ message: 'Data added to the database successfully' });
             });
});


app.get('/model-report/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    const date = req.query.date; // เพิ่มการรับค่า date จาก query parameter
    const formattedDate = date.split(" ")[0]; // ตัด string ของ date เพื่อให้เหลือแค่วันที่
    
    let sql = "SELECT * FROM report WHERE s_id = ?";
    let params = [studentId];

    // เพิ่มเงื่อนไขใน SQL query ในกรณีที่มีค่า date ถูกส่งมา
    if (formattedDate) {
        sql += " AND SUBSTRING(date, 1, 10) = ?";
        params.push(formattedDate);
    }
    
    db.query(sql, params, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (result.length === 0) {
                // ส่งข้อมูล report กลับไป
                res.json(result);
            }
        }
    });
});


app.get('/student-from-server/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    if (!studentId) {
        // If studentId is not provided, return an error response
        return res.status(400).json({ error: 'Student ID is required.' });
    }

    db.query("SELECT s_name FROM student WHERE s_id = ?", [studentId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // If student is found, return the result
            res.json(result);
        }
    });
})


app.get('/getmood/:g_category', (req, res) => {
    const g_category = req.params.g_category;
    if (!g_category) {
        // If g_category is not provided, return an error response
        return res.status(400).json({ error: 'g_category is required.' });
    }

    db.query("SELECT greeting FROM greetword WHERE g_category = ?", [g_category], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // If result > 1 ramdom
            if (result.length > 1) {
                const randomGreeting = result[Math.floor(Math.random() * result.length)].greeting;
                console.log(randomGreeting)
                res.json(randomGreeting);
            } else {
                res.json(result);
            }
        }
    });
})

app.get('/get-last-report', (req, res) => {
    db.query("SELECT s_id, pic_r, mood, age, gender FROM report ORDER BY number DESC LIMIT 5", (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.send(result);
        }
    });
});


{/* XAMPP AND DOCKER*/}
app.listen('3001', () => {
    console.log('Server is running on port 3001');
});
