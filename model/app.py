import cv2
from flask import Flask, render_template, Response
import numpy as np
from deepface import DeepFace
import glob
import json
import datetime
import os
import pyttsx3
import requests
import threading
import time

app = Flask(__name__)

camera = cv2.VideoCapture(0)
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
detectvision = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
previous_face_image = None
getsay = None
models = ["VGG-Face", "Facenet", "Facenet512", "OpenFace", "DeepFace", "DeepID", "ArcFace", "Dlib", "SFace"]
imgdb_path = glob.glob("./model/imgFromServer/**/*.jpeg", recursive=True)


with open('./model/my_list.json', 'w') as f:
    f.write('')
    

# สร้างฟังก์ชันสำหรับเรียกใช้ predict_and_save() ในเธรดใหม่
def predict_thread(face_image_resized, frame):
    thread = threading.Thread(target=predict, args=(face_image_resized, frame))
    thread.start()
    thread.join()


def cap_img_thread(faces, frame):
    thread = threading.Thread(target=cap_img, args=(faces, frame))
    thread.start()
    thread.join()

    
def detect_face():
    ret, frame = camera.read()

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detectvision.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(200, 200), flags=cv2.CASCADE_SCALE_IMAGE)

    if len(faces) > 0:
        cv2.imwrite('./model/full.jpeg', frame)
        cap_img_thread(faces, frame)

    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y-20), (x+w, y+h+40), (255, 0, 255), 2)
    
    return cv2.imencode('.jpeg', frame)[1].tobytes() #บันทึกภาพ


def generate_frames():
    while True:
        frame_bytes = detect_face()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n\r\n')


def cap_img(faces, frame):
    global previous_face_image
    global mse
    face_image_resized = None

    for i, (x, y, w, h) in enumerate(faces):
        face_image = frame[y:y+h, x:x+w]
        face_image_resized = cv2.resize(face_image, (100, 100))
    
    if(previous_face_image is None):
        previous_face_image = face_image_resized
        print("first previous_face_image")
        predict_thread(previous_face_image, frame)
    else:
        error = mse(previous_face_image, face_image_resized)
        if(error > 120):
            previous_face_image = face_image_resized
            predict_thread(face_image_resized, frame)
        else:
            pass
        
        
        # result = DeepFace.verify(previous_face_image, face_image_resized, model_name=models[0], enforce_detection=False)
        # if(result["verified"] == False):
        #     previous_face_image = face_image_resized
        #     print("NOT first previous_face_image")
        #     predict_thread(previous_face_image, frame)
        # else:
        #     pass
    

def predict(face_image_resized, frame):
    global getsay
    print("เข้า predict")
    result_list = []
    global s_id
    
    cv2.imwrite('../model/face.jpeg', face_image_resized)
    
    for db_img in imgdb_path:
        result = DeepFace.verify(db_img, './model/face.jpeg', model_name=models[0], enforce_detection=False)
        print(result["verified"])
        if (result["verified"] == True):
            s_id = os.path.basename(os.path.dirname(db_img))
            break
        else:
            print("เป็น False น่ะ")
            s_id = 'stranger'
        
    anaimg = DeepFace.analyze('./model/face.jpeg', enforce_detection=False, actions=("emotion", "age", "gender"))
    current_time = datetime.datetime.now()
    res = {
            "s_id": s_id,
            "pic_r": './face.jpeg',
            "pic_cam": './full.jpeg',
            "date": current_time.strftime("%d/%m/%Y %H:%M:%S"),
            "mood": anaimg[0]["dominant_emotion"],
            "age": anaimg[0]["age"],
            "gender": anaimg[0]["dominant_gender"]
        }
    result_list.append((res))
    send_result_list(result_list)
    getsay = get_greet()
    sayhi()

def mse(image1, image2):
    if image1 is None or image2 is None:
        return 0  

    diff = cv2.subtract(image1, image2)
    err = np.sum(diff**2)
    mse = err / (float(100 * 100))
    return mse

# ฟังก์ชันสำหรับเชื่อมต่อฐานข้อมูลและดึงข้อมูล
def get_data_from_database():
    url = 'http://localhost:3001/get-report-fromdb'  # URL ของเซิร์ฟเวอร์ Express.js
    headers = {'Content-Type': 'application/json'}
    response = requests.get(url, headers=headers)
    print(response.text)
    return response.text


# ฟังก์ชันสำหรับเชื่อมต่อฐานข้อมูลและดึงข้อมูล
def get_greet():
    url = 'http://localhost:3002/get-greet'  # URL ของเซิร์ฟเวอร์ Express.js
    headers = {'Content-Type': 'application/json'}
    response = requests.get(url, headers=headers)
    print(response.text)
    return response.text


def sayhi():
    engine = pyttsx3.init()
    TH_voice_id = "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_THAI"
    engine.setProperty('volume', 0.9)  # Volume 0-1
    engine.setProperty('rate', 120)  #148
    engine.setProperty('voice', TH_voice_id)

    if getsay is not None:
        engine.say(getsay)
        engine.runAndWait()
    else:
        #print("setname is None")
        pass

def send_result_list(result_list):
    url = 'http://localhost:3002/send-result-list'  # URL ของเซิร์ฟเวอร์ Express.js
    headers = {'Content-Type': 'application/json'}
    data = json.dumps({'result_list': result_list})
    
    response = requests.post(url, data=data, headers=headers)
    
    if response.status_code == 200:
        print('Result list sent successfully')
    else:
        print('Failed to send result list')


@app.route('/')
def index():
    # ดึงข้อมูลจากฐานข้อมูล
    data_string = get_data_from_database()
    # แปลงสตริง JSON เป็นโครงสร้างข้อมูล Python
    data = json.loads(data_string)
    print("data : ",data)
    # ส่งข้อมูลไปยัง HTML template
    return render_template("kiosk.html", data=data)


@app.route('/Video')
def Video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)