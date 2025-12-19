from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel
from .services_google import translate_text, synthesize_speech_mp3

router = APIRouter(prefix="/i18n")

class TranslateReq(BaseModel):
    text: str
    targetLang: str   # "hi" or "ta" or "en"
    sourceLang: str | None = "en"

@router.post("/translate")
def translate(req: TranslateReq):
    out = translate_text(req.text, req.targetLang, req.sourceLang or "en")
    return {"translatedText": out}

class TtsReq(BaseModel):
    text: str
    lang: str  # "hi-IN" or "ta-IN" or "en-US"

@router.post("/tts")
def tts(req: TtsReq):
    audio_bytes = synthesize_speech_mp3(req.text, req.lang)
    return Response(content=audio_bytes, media_type="audio/mpeg")
