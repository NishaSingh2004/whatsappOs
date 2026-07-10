import asyncio
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from playwright.async_api import async_playwright
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from api.deps import get_current_user

router = APIRouter()

@router.get("/config")
def get_whatsapp_config(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Placeholder endpoint for fetching WhatsApp config"""
    return {"status": "success", "message": "WhatsApp config endpoint ready"}

@router.post("/config")
def update_whatsapp_config(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Placeholder endpoint for updating WhatsApp config"""
    return {"status": "success", "message": "WhatsApp config updated"}

@router.get("/members")
def get_whatsapp_members(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Placeholder endpoint for fetching WhatsApp members"""
    return {"status": "success", "members": []}

@router.websocket("/ws/qr")
async def whatsapp_qr_ws(websocket: WebSocket):
    await websocket.accept()
    browser = None
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            await websocket.send_json({"type": "status", "message": "Waiting for QR Scan"})
            
            # Navigating to WhatsApp Web
            await page.goto("https://web.whatsapp.com", timeout=60000)
            
            last_qr = ""
            while True:
                try:
                    # Look for the element containing the QR code data string
                    qr_element = await page.query_selector('div[data-ref]')
                    if qr_element:
                        data_ref = await qr_element.get_attribute('data-ref')
                        if data_ref and data_ref != last_qr:
                            last_qr = data_ref
                            await websocket.send_json({"type": "qr_code", "data": data_ref})
                            
                    # Check if session is connected (looks for chat list container or profile picture)
                    is_connected = await page.query_selector('div[id="side"]')
                    if is_connected:
                        await websocket.send_json({"type": "status", "message": "Connected"})
                        break
                        
                    # Check if reload button appeared (QR expired)
                    reload_btn = await page.query_selector('span[data-icon="refresh"]')
                    if reload_btn:
                        await websocket.send_json({"type": "status", "message": "Session Expired"})
                        # Optionally click it to reload: await reload_btn.click()
                        
                    await asyncio.sleep(1.5)
                except Exception as e:
                    print(f"Error checking page state: {e}")
                    await asyncio.sleep(2)
                    
            # Maintain connection state if successfully logged in
            while True:
                await asyncio.sleep(10)
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WS error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass
    finally:
        if browser:
            await browser.close()
