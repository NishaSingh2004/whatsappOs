import httpx
from fastapi import HTTPException

class JiraService:
    def __init__(self, base_url: str, email: str, api_token: str):
        if not base_url or not email or not api_token:
            raise ValueError("Jira credentials missing")
        self.base_url = base_url.rstrip("/")
        self.email = email
        self.api_token = api_token

    def _get_headers(self):
        # httpx supports auth=(email, token) for Basic Auth
        return {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
    def _get_auth(self):
        return (self.email, self.api_token)

    async def get_projects(self):
        url = f"{self.base_url}/rest/api/3/project"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, auth=self._get_auth(), headers=self._get_headers())
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch Jira projects")
            return response.json()

    async def get_issues(self, jql: str = "assignee=currentuser()"):
        url = f"{self.base_url}/rest/api/3/search"
        params = {"jql": jql, "maxResults": 15}
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, auth=self._get_auth(), headers=self._get_headers())
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch Jira issues")
            return response.json()
            
    async def create_issue(self, project_key: str, summary: str, issue_type: str = "Task", description: str = ""):
        url = f"{self.base_url}/rest/api/3/issue"
        payload = {
            "fields": {
                "project": {"key": project_key},
                "summary": summary,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [{"type": "text", "text": description}]
                        }
                    ]
                },
                "issuetype": {"name": issue_type}
            }
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, auth=self._get_auth(), headers=self._get_headers())
            if response.status_code != 201:
                raise HTTPException(status_code=response.status_code, detail="Failed to create Jira issue")
            return response.json()

    async def create_project(self, name: str, key: str, lead_account_id: str = ""):
        url = f"{self.base_url}/rest/api/3/project"
        payload = {
            "key": key,
            "name": name,
            "projectTypeKey": "software",
            "projectTemplateKey": "com.pyxis.greenhopper.jira:gh-simplified-scrum-classic",
            "leadAccountId": lead_account_id,
            "description": f"Synced from WorkOS"
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, auth=self._get_auth(), headers=self._get_headers())
            if response.status_code not in [200, 201]:
                print(f"Jira project sync failed: {response.text}")
                # We won't raise an exception here so local DB creation still succeeds
            return response.json()
