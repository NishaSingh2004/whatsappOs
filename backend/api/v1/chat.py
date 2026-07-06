from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from google import genai
from google.genai import types
import json

from core.database import get_db
from core.config import settings
from models.user import User
from models.chat import OrganizationMessage
from models.admin import Settings
from schemas.chat import OrgMessageCreate, OrgMessageResponse
from api.deps import get_current_user
from core.jira import JiraService
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter()
ai_client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "YOUR_GEMINI_API_KEY" else None

def send_chat_notification_email(sender_name: str, org_users: list[User], message_content: str):
    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        
        if settings.SMTP_USER != "your_email@gmail.com":
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            for u in org_users:
                msg = MIMEMultipart()
                msg['From'] = f"WorkOS Chat <{settings.SMTP_USER}>"
                msg['To'] = u.email
                msg['Subject'] = f"New message from {sender_name} in Team Chat"
                
                body = f"""
                Hello {u.first_name},
                
                {sender_name} just sent a new message in the Team Chat:
                
                "{message_content}"
                
                Log in to WorkOS to reply!
                """
                msg.attach(MIMEText(body, 'plain'))
                server.send_message(msg)
            print(f"Chat notifications sent successfully")
        else:
            print(f"Mock Chat Notifications sent (Please configure SMTP_USER to send real emails)")
            
        server.quit()
    except Exception as e:
        print(f"Failed to send email: {e}")

@router.get("", response_model=list[OrgMessageResponse])
def get_org_messages(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(OrganizationMessage).filter(OrganizationMessage.org_id == current_user.org_id).order_by(OrganizationMessage.created_at.asc()).all()

@router.post("", response_model=OrgMessageResponse)
async def send_message(msg: OrgMessageCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Save Human Message
    user_message = OrganizationMessage(content=msg.content, user_id=current_user.id, is_ai=False, org_id=current_user.org_id)
    db.add(user_message)
    db.flush()

    # Trigger Email Notification to all OTHER users in the org
    org_users = db.query(User).filter(User.org_id == current_user.org_id, User.id != current_user.id).all()
    if org_users:
        background_tasks.add_task(send_chat_notification_email, f"{current_user.first_name} {current_user.last_name}", org_users, msg.content)
    
    # 2. Check if AI was mentioned or it's a direct command
    is_ai_command = "@WorkOS" in msg.content or msg.content.lower().startswith("/ai")
    
    if is_ai_command:
        ai_response_text = "AI is currently offline. Please configure your `GEMINI_API_KEY`."
        if ai_client:
            try:
                # Prepare History
                history = db.query(OrganizationMessage).filter(OrganizationMessage.org_id == current_user.org_id).order_by(OrganizationMessage.created_at.asc()).limit(20).all()
                
                contents = [
                    types.Content(
                        role="user", 
                        parts=[types.Part.from_text(text=f"System Context: You are WorkOS AI. You exist in an organization chat. The current user is {current_user.first_name}. If asked to create a Jira task, return a JSON block EXACTLY like this (and no markdown): {{\"tool\": \"create_jira_issue\", \"project_key\": \"PROJ\", \"summary\": \"Task Name\", \"description\": \"Task details\"}}. Otherwise, reply normally.")]
                    ),
                    types.Content(
                        role="model", 
                        parts=[types.Part.from_text(text="Understood.")]
                    )
                ]
                
                for h_msg in history:
                    gemini_role = "model" if h_msg.is_ai else "user"
                    prefix = "" if h_msg.is_ai else f"{h_msg.user.first_name}: " if h_msg.user else ""
                    contents.append(
                        types.Content(
                            role=gemini_role,
                            parts=[types.Part.from_text(text=f"{prefix}{h_msg.content}")]
                        )
                    )
                
                response = ai_client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=contents
                )
                
                if response.text:
                    if "{\"tool\": \"create_jira_issue\"" in response.text or '{"tool": "create_jira_issue"' in response.text:
                        # Extract JSON
                        try:
                            start = response.text.find("{")
                            end = response.text.rfind("}") + 1
                            tool_call = json.loads(response.text[start:end])
                            
                            # Execute Jira creation
                            org_settings = db.query(Settings).filter(Settings.org_id == current_user.org_id).first()
                            if org_settings and org_settings.jira_api_token:
                                jira = JiraService(org_settings.jira_base_url, org_settings.jira_email, org_settings.jira_api_token)
                                await jira.create_issue(
                                    project_key=tool_call.get("project_key", "PROJ"),
                                    summary=tool_call.get("summary", "New Task from AI"),
                                    description=tool_call.get("description", "Created via Chat")
                                )
                                ai_response_text = f"✅ Successfully created Jira issue in project {tool_call.get('project_key')}!"
                            else:
                                ai_response_text = "⚠️ Jira is not configured in Organization Settings. Please ask your Admin to set it up."
                        except Exception as e:
                            ai_response_text = f"Failed to execute Jira task creation: {e}"
                    else:
                        ai_response_text = response.text
            except Exception as e:
                ai_response_text = f"Error connecting to AI: {str(e)}"
                
        # Save AI Response
        ai_message = OrganizationMessage(content=ai_response_text, is_ai=True, org_id=current_user.org_id)
        db.add(ai_message)
        
    db.commit()
    db.refresh(user_message)
    return user_message
