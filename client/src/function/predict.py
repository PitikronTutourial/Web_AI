from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import glob
import os
import uuid

app = Flask(__name__)
CORS(app)

@app.route('/verify', methods=['POST'])
def verify_face():
    # รับไฟล์ที่ถูก crop จาก React frontend
    uploaded_file = request.files['file']
    
    # ทำการ verify โดยตรง
    true_results = loopimg(uploaded_file)
    
    # ส่งผลลัพธ์กลับไปยัง React frontend
    return jsonify({'true_results': true_results})

def loopimg(uploaded_file):
    models = ["VGG-Face", "Facenet", "Facenet512", "OpenFace", "DeepFace", "DeepID", "ArcFace", "Dlib", "SFace"]

    imgdb_path = glob.glob("./server/student_folders/**/*.jpeg", recursive=True)

    true_results = []

    for db_image in imgdb_path:
        result = DeepFace.verify(uploaded_file, db_image, model_name=models[0], enforce_detection=False)
        if result["verified"]:
            true_results.append(os.path.basename(os.path.dirname(db_image)))

    return true_results

if __name__ == '__main__':
    app.run(debug=True, port=5000)
