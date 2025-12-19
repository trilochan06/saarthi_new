from google.cloud import translate_v2 as translate
from google.cloud import texttospeech

def translate_text(text: str, target_lang: str, source_lang: str = "en") -> str:
    """
    Uses Google Cloud Translate.
    target_lang: "hi", "ta", "en" etc.
    """
    client = translate.Client()
    res = client.translate(text, target_language=target_lang, source_language=source_lang)
    return res["translatedText"]

def synthesize_speech_mp3(text: str, lang: str) -> bytes:
    """
    Uses Google Cloud Text-to-Speech and returns MP3 bytes.
    lang examples: "hi-IN", "ta-IN", "en-IN"
    """
    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code=lang,
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config,
    )

    return response.audio_content
