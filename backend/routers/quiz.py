from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import os

from backend.services.file_service import FileService
from backend.services.ai_service import AIService

router = APIRouter()

@router.post("/generate_quiz")
async def generate_quiz(
    files: List[UploadFile] = File(...),
    grade: str = Form(...),
    question_count: int = Form(...),
    question_type: str = Form(...),
    force_regenerate: bool = Form(False)
):
    try:
        # Step 1: Save files and get hash
        file_hash, file_paths = await FileService.save_files_and_hash(files)
        
        # Step 2: Check cache
        if not force_regenerate:
            cached_quiz = FileService.get_cached_quiz(file_hash)
            if cached_quiz:
                return {"status": "success", "source": "cache", "data": cached_quiz}
            
        # Step 3: Extract text from all uploaded files
        use_vision = os.getenv("USE_VISION_MODEL", "True").lower() in ("true", "1", "t")
        combined_text = ""
        
        for path in file_paths:
            extracted = FileService.extract_text_from_file(path, use_vision)
            combined_text += f"--- Document: {os.path.basename(path)} ---\n{extracted}\n\n"
            
        if len(combined_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Could not extract any meaningful text from the uploaded files.")
            
        # Step 4: Generate quiz using AI
        quiz_data = await AIService.generate_quiz(combined_text, grade, question_count, question_type)
        
        if "error" in quiz_data:
            raise HTTPException(status_code=500, detail=quiz_data["error"])
            
        # Step 5: Save to cache
        FileService.save_to_cache(file_hash, quiz_data)
        
        # Step 6: Return result
        return {"status": "success", "source": "ai", "data": quiz_data}
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
