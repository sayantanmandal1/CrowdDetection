from fastapi import APIRouter, UploadFile, File
from services.crowd_counter import detect_crowd
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/image/")
async def analyze_crowd_image(file: UploadFile = File(...)):
    result = await detect_crowd(file)
    return JSONResponse(content=result) 