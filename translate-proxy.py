"""Translation proxy - hides API key from frontend"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

BAI_API = "https://api.b.ai/v1/chat/completions"
BAI_KEY = os.environ.get("BAI_KEY", "sk-dk1eflbtuz623in5dmjcdzjbvn5gbpag")

@app.post("/api/translate")
async def translate(request: Request):
    body = await request.json()
    async with httpx.AsyncClient() as client:
        resp = await client.post(BAI_API, json=body, headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {BAI_KEY}"
        }, timeout=30)
        return resp.json()
