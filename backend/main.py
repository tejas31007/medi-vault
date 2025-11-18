from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
import asyncio
import json
from typing import List

from quantum_engine import generate_bb84_key

app = FastAPI()

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "secure_uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to client: {e}")

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {"message": "Medi-Vault Backend is Running!"}

@app.get("/check")
def check_health():
    return {"status": "Quantum Server is Online", "qubits": 50}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"info": f"File saved at {file_location}"}

@app.get("/files")
def list_files():
    files = []
    if os.path.exists(UPLOAD_DIR):
        for filename in os.listdir(UPLOAD_DIR):
            files.append({
                "name": filename,
                "size": os.path.getsize(f"{UPLOAD_DIR}/{filename}"),
                "status": "ENCRYPTED (AES-256)"
            })
    return files

@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = f"{UPLOAD_DIR}/{filename}"
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    print("🔌 New Client Connected via WebSocket")
    
    try:
        while True:
            data_text = await websocket.receive_text()
            data = json.loads(data_text)
            print(f"📩 Received command: {data}")

            if data.get("action") == "START_KEY_GEN":
                is_hacker_active = data.get("hacker", False)
                
                # 1. Tell EVERYONE we are starting
                msg = "⚠️ INTERCEPTING PHOTONS..." if is_hacker_active else "Aligning Polarizers..."
                await manager.broadcast({"status": "initializing", "message": msg})
                
                await asyncio.sleep(1) 

                # 2. Run Simulation
                result = generate_bb84_key(num_bits=100, intercept=is_hacker_active)
                key = result["key"]
                qber = result["error_rate"]
                
                # 3. Broadcast the Result to EVERYONE
                await manager.broadcast({
                    "status": "complete", 
                    "key": key,
                    "qber": qber,
                    "message": f"Key Generated. QBER: {qber}%"
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected")
    except Exception as e:
        print(f"❌ WebSocket Error: {e}")
        manager.disconnect(websocket)