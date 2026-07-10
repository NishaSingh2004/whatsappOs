import asyncio
from sqlalchemy.orm import Session
from core.database import SessionLocal
from core.ai_whatsapp import WhatsAppAIAssistant
from core.config import settings

async def main():
    print(f"Loaded GEMINI_API_KEY: {settings.GEMINI_API_KEY[:5]}***")
    db: Session = SessionLocal()
    try:
        assistant = WhatsAppAIAssistant(db, org_id="1", profile_name="Test User")
        reply = await assistant.process_message("Hello, how are you?")
        print("Reply from AI:", reply)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
