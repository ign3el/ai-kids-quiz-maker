import os
from openai import AsyncOpenAI
import json

class AIService:
    @staticmethod
    async def generate_quiz(text_content: str, grade: str, question_count: int, question_type: str) -> dict:
        api_key = os.getenv("OPENROUTER_API_KEY")
        model = os.getenv("OPENROUTER_MODEL", "google/gemini-1.5-flash")
        
        if not api_key or api_key == "your_openrouter_key_here":
            return {"error": "OpenRouter API Key is missing or invalid. Please check your .env file."}

        client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

        system_prompt = f"""
You are an expert CBSE Curriculum Designer specializing in Grade {grade}. Your goal is to transform educational text into a high-quality, standalone quiz.

### OBJECTIVES
1. **Contextual Extraction**: Identify questions within the text. You MUST rephrase them to be **100% Standalone and Self-Contained**. 
   - **Zero-Reference Rule**: Assume the student CANNOT see the source document and CANNOT see previous questions. 
   - **Data-First Requirement**: Identifiers like "Movie A", "The City", or "The first number" are NOT sufficient context. You MUST inject the actual values/data associated with those identifiers directly into the question text.
   - *Bad Question*: "Which movie earned the most?"
   - *Good Question*: "Based on these earnings—Movie A (₹7,08,09,000), Movie B (₹70,890,000), and Movie C (₹7,089,000)—which movie earned the most?"
   - Skip questions that are unsolvable without an image.
2. **Knowledge Synthesis**: Create {question_count} original questions based on the key concepts of the text to ensure full coverage of the topic.
3. **Strict Formatting**: The user requested the quiz format to be: **{question_type}**. 
   - If "MCQ": Create 1 clear correct answer and 3 plausible distractors (exactly 4 options).
   - If "True/False": Convert questions into factual statements (options must be exactly ["True", "False"]).
   - If "Short Answer": Leave options empty.
   - If "Mix": Randomly distribute the questions among MCQ, True/False, and Short Answer.

### OUTPUT RULES
- **Tone**: Encouraging, simple, and age-appropriate for a {grade} student.
- **Language**: Match the primary language of the source text (English/Hindi/Math).
- **Format**: Return ONLY a raw JSON object. Do not include markdown blocks (```json) or conversational filler.

### JSON SCHEMA
{{
    "title": "A catchy, relevant title for the quiz",
    "grade": "{grade}",
    "subject_area": "Identify the subject from the text",
    "questions": [
        {{
            "id": 1,
            "question": "The rephrased or new question text",
            "type": "Must be exactly 'MCQ', 'True/False', or 'Short Answer'",
            "options": ["Option 1", "Option 2"], 
            "correct_answer": "The exact string of the correct option",
            "explanation": "A friendly, 'level-up' explanation explaining the 'why' in simple terms."
        }}
    ]
}}
"""

        try:
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Here is the document text:\n\n{text_content}"}
                ],
                # Temperature 0.3 for more deterministic, educational output
                temperature=0.3
            )
            
            raw_response = response.choices[0].message.content.strip()
            
            # Clean up potential markdown blocks if the AI ignores instructions
            if raw_response.startswith("```json"):
                raw_response = raw_response[7:]
            if raw_response.endswith("```"):
                raw_response = raw_response[:-3]
                
            quiz_data = json.loads(raw_response.strip())
            return quiz_data
            
        except json.JSONDecodeError:
            return {"error": "The AI failed to return a valid JSON format. Please try again."}
        except Exception as e:
            return {"error": f"An error occurred while contacting the AI: {str(e)}"}
