import os
import shutil
from typing import List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pdf2image import convert_from_path
import uuid
from sqlalchemy.orm import Session
import models
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS setup
# Allowing specific origins + wildcard to be safe, but user requested "*" with credentials.
# Note: allow_origins=["*"] with allow_credentials=True is technically not allowed by standard CORS specs,
# but FastAPI/Starlette might handle it. To be 100% safe for Netlify -> Render, we explicitly add the Netlify URL.
origins = [
    "https://capable-kashata-6e415e.netlify.app",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_unique_filename(filename):
    ext = os.path.splitext(filename)[1]
    return f"{uuid.uuid4()}{ext}"

def log_conversion(db: Session, filename: str, source: str, target: str, size: int):
    db_log = models.ConversionLog(
        filename=filename,
        source_format=source,
        target_format=target,
        file_size=size
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)

@app.post("/convert-image")
async def convert_image(file: UploadFile = File(...), target_format: str = Form(...), db: Session = Depends(get_db)):
    try:
        # Save uploaded file
        input_filename = get_unique_filename(file.filename)
        input_path = os.path.join(UPLOAD_DIR, input_filename)
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Open image
        img = Image.open(input_path)
        
        # Handle RGBA to RGB for JPEG/BMP
        if img.mode in ("RGBA", "P") and target_format.lower() in ("jpg", "jpeg", "bmp"):
            img = img.convert("RGB")

        # Define output filename
        output_filename = f"{os.path.splitext(input_filename)[0]}.{target_format.lower()}"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        # Save converted image
        img.save(output_path)
        
        # Log to DB
        log_conversion(db, file.filename, os.path.splitext(file.filename)[1][1:], target_format, os.path.getsize(output_path))

        return FileResponse(output_path, filename=f"converted.{target_format.lower()}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/image-to-pdf")
async def image_to_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        input_filename = get_unique_filename(file.filename)
        input_path = os.path.join(UPLOAD_DIR, input_filename)
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        img = Image.open(input_path)
        if img.mode != "RGB":
            img = img.convert("RGB")

        output_filename = f"{os.path.splitext(input_filename)[0]}.pdf"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        img.save(output_path, "PDF", resolution=100.0)
        
        # Log to DB
        log_conversion(db, file.filename, os.path.splitext(file.filename)[1][1:], "pdf", os.path.getsize(output_path))

        return FileResponse(output_path, filename="converted.pdf")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/pdf-to-image")
async def pdf_to_image(file: UploadFile = File(...), target_format: str = Form(...), db: Session = Depends(get_db)):
    try:
        input_filename = get_unique_filename(file.filename)
        input_path = os.path.join(UPLOAD_DIR, input_filename)
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Convert first page only for simplicity
        images = convert_from_path(input_path)
        
        if not images:
             raise HTTPException(status_code=400, detail="Could not convert PDF")

        img = images[0]
        
        output_filename = f"{os.path.splitext(input_filename)[0]}.{target_format.lower()}"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        img.save(output_path)
        
        # Log to DB
        log_conversion(db, file.filename, "pdf", target_format, os.path.getsize(output_path))

        return FileResponse(output_path, filename=f"converted.{target_format.lower()}")

    except Exception as e:
        # Check for poppler error
        if "poppler" in str(e).lower():
             raise HTTPException(status_code=500, detail="Poppler not found. Please install Poppler.")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
