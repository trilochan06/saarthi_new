from typing import List
from .models import SuggestRequest

ACTIVITY_BANK = {
    "speech": [
        "Picture Naming (AAC): show image → child says word",
        "Repeat-after-me: 5 short words → 3 rounds",
        "Syllable tapping: clap for each syllable",
        "Mirror practice: mouth shapes for 5 phonemes",
    ],
    "attention": [
        "Match the Pair: 8 cards → find pairs",
        "Visual schedule: 4-step routine ordering",
        "Color/shape sorting: 10 objects",
        "Spot the difference: 5 differences",
    ],
    "social": [
        "Emotion cards: identify happy/sad/angry",
        "Turn-taking game: roll & move",
        "Greeting practice: hello/please/thank you",
        "Role play: simple daily scenarios",
    ],
}

LANG_TEMPLATES = {
    "en": "Suggestions based on goal, difficulty and age.",
    "hi": "लक्ष्य, कठिनाई और उम्र के आधार पर सुझाव।",
    "ta": "இலக்கு, கடினம் மற்றும் வயதை வைத்து பரிந்துரைகள்.",
}

def suggest(req: SuggestRequest) -> List[str]:
    base = ACTIVITY_BANK.get(req.goal, ACTIVITY_BANK["attention"]).copy()

    # Simple difficulty filter (demo-friendly)
    if req.difficulty == "easy":
        base = base[:2]
    elif req.difficulty == "medium":
        base = base[:3]
    else:
        base = base[:4]

    # Age-based tweak
    if req.child_age <= 6:
        base = [b + " (short 5–7 min)" for b in base]
    elif req.child_age <= 10:
        base = [b + " (10 min)" for b in base]
    else:
        base = [b + " (12–15 min)" for b in base]

    return base

def rationale(language: str) -> str:
    lang = "en"
    if language.lower().startswith("hi"):
        lang = "hi"
    elif language.lower().startswith("ta"):
        lang = "ta"
    return LANG_TEMPLATES[lang]
