import asyncio
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from models.admin import Settings
from core.jira import JiraService
from core.config import settings as app_settings

class WhatsAppAIAssistant:
    def __init__(self, db: Session, org_id: str, profile_name: str = "Employee"):
        self.db = db
        self.org_id = org_id
        self.profile_name = profile_name
        self.client = genai.Client(api_key=app_settings.GEMINI_API_KEY)
        
        # Load Jira settings
        self.org_settings = self.db.query(Settings).filter(Settings.org_id == org_id).first()
        self.jira_service = None
        if self.org_settings and self.org_settings.jira_base_url and self.org_settings.jira_api_token:
            self.jira_service = JiraService(
                base_url=self.org_settings.jira_base_url,
                email=self.org_settings.jira_email,
                api_token=self.org_settings.jira_api_token
            )

    async def _execute_create_jira_issue(self, summary: str, description: str, project_key: str = "KAN") -> str:
        if not self.jira_service:
            return "Error: Jira is not configured for this organization."
        try:
            res = await self.jira_service.create_issue(
                project_key=project_key,
                summary=summary,
                description=description
            )
            return f"Successfully created Jira issue. Ticket Key: {res.get('key', 'Unknown')}"
        except Exception as e:
            return f"Failed to create Jira issue: {str(e)}"

    async def _execute_list_jira_issues(self) -> str:
        if not self.jira_service:
            return "Error: Jira is not configured for this organization."
        try:
            res = await self.jira_service.get_issues("order by created DESC")
            issues = res.get("issues", [])
            if not issues:
                return "No recent issues found."
            formatted = []
            for i in issues[:5]:
                key = i.get('key')
                summary = i.get('fields', {}).get('summary', 'No summary')
                status = i.get('fields', {}).get('status', {}).get('name', 'Unknown')
                formatted.append(f"- {key}: {summary} ({status})")
            return "Recent Jira Issues:\n" + "\n".join(formatted)
        except Exception as e:
            return f"Failed to list Jira issues: {str(e)}"

    async def process_message(self, user_message: str) -> str:
        system_instruction = (
            f"You are a helpful WorkOS Assistant responding to {self.profile_name} on WhatsApp. "
            f"You can help them create Jira tickets, list recent tickets, or answer general questions. "
            f"Keep your responses concise, friendly, and formatted nicely for WhatsApp."
        )

        def create_jira_issue(summary: str, description: str, project_key: str) -> str:
            """Creates a new Jira ticket/issue. project_key is required (e.g. KAN)."""
            pass

        def list_recent_jira_issues() -> str:
            """Lists the most recent Jira tickets."""
            pass
            
        tools = []
        if self.jira_service:
            tools = [create_jira_issue, list_recent_jira_issues]

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=tools if tools else None,
            temperature=0.7
        )

        try:
            # We do a basic multi-turn loop. Max 2 turns (one for function call, one for final answer)
            chat = self.client.chats.create(model='gemini-2.5-flash', config=config)
            response = chat.send_message(user_message)
            
            if response.function_calls:
                for fc in response.function_calls:
                    if fc.name == "create_jira_issue":
                        args = fc.args
                        res_str = await self._execute_create_jira_issue(
                            summary=args.get("summary", "New Ticket"),
                            description=args.get("description", ""),
                            project_key=args.get("project_key", "KAN")
                        )
                        # Send the function response back to the chat
                        response = chat.send_message(
                            types.Part.from_function_response(
                                name=fc.name,
                                response={"result": res_str}
                            )
                        )
                    elif fc.name == "list_recent_jira_issues":
                        res_str = await self._execute_list_jira_issues()
                        response = chat.send_message(
                            types.Part.from_function_response(
                                name=fc.name,
                                response={"result": res_str}
                            )
                        )
            
            return response.text

        except Exception as e:
            print(f"Gemini error: {e}")
            return "I'm sorry, I'm having trouble connecting to my AI core right now."
