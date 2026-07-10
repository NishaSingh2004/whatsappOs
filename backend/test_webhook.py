import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        # Create a payload that mimics the Node.js service
        payload = {
            "message": "Hello, can you help me create a Jira ticket?",
            "phone_number": "1234567890",
            "profile_name": "Test User",
            "org_id": "1"
        }
        print("Sending payload:", payload)
        try:
            response = await client.post("http://127.0.0.1:8000/api/v1/whatsapp/webhook", json=payload)
            print("Status:", response.status_code)
            print("Response:", response.json())
        except Exception as e:
            print("Error:", str(e))

if __name__ == "__main__":
    asyncio.run(main())
