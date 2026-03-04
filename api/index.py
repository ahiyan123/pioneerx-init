import os
from fastapi import FastAPI, Query
from duckduckgo_search import DDGS
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# 1. Connect to OpenRouter
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENROUTER_API_KEY"),
)

def get_live_web_context(query: str):
    """The DuckDuckGo Add-on: Fetches real-time web data for $0."""
    try:
        with DDGS() as ddgs:
            # We grab 3 results to keep it fast and free
            results = [r for r in ddgs.text(query, max_results=3)]
            return "\n".join([f"Source: {r['href']}\nInfo: {r['body']}" for r in results])
    except Exception:
        return "No live web data found."

@app.get("/api/chat")
async def chat(q: str = Query(..., description="The user's question")):
    # A. Get real-time context for free
    web_context = get_live_web_context(q)
    
    # B. Ask the AI (LOCKED TO FREE MODELS ONLY)
    # Using 'openrouter/auto:free' ensures zero cost
    response = client.chat.completions.create(
        model="openrouter/auto:free", 
        messages=[
            {
                "role": "system", 
                "content": f"You are a highly Intelligent AI. Use this LIVE web data: {web_context}"
            },
            {"role": "user", "content": q}
        ],
        extra_headers={
            "HTTP-Referer": "https://pioneer-ai.vercel.app", # Replace with your URL later
            "X-Title": "Pioneer Intelligent AI",
        }
    )
    
    return {
        "reply": response.choices[0].message.content,
        "sources": web_context
    }
