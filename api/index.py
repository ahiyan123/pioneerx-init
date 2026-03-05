import os
from fastapi import FastAPI, Query
from duckduckgo_search import DDGS
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# 1. Secure Connection to OpenRouter (Free Only)
api_key = os.getenv("OPENROUTER_API_KEY")
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key if api_key else "missing_key",
)

def get_live_web_context(query: str):
    """The Pioneer Search: Scrapes the live web for current events."""
    try:
        with DDGS() as ddgs:
            # We use backend="auto" to get real search results, not just facts
            results = ddgs.text(
                query, 
                region='wt-wt', 
                safesearch='moderate', 
                backend="auto", 
                max_results=5
            )
            
            if not results:
                return "No live data found. Use your internal knowledge."
            
            # Combine the results into a single string for the AI to read
            blob = ""
            for r in results:
                blob += f"\n---\nSource: {r['href']}\nTitle: {r['title']}\nInfo: {r['body']}"
            return blob
    except Exception as e:
        print(f"Search Crash: {e}")
        return "The web search is currently down. Use your internal knowledge."

@app.get("/api/chat")
async def chat(q: str = Query(..., description="The user's question")):
    if api_key == "missing_key":
        return {"reply": "Error: Please add your OPENROUTER_API_KEY to Vercel Settings."}

    # A. Get real-time context
    web_context = get_live_web_context(q)
    
    # B. Generate the answer using a FREE model
    try:
        response = client.chat.completions.create(
            model="openrouter/auto:free", 
            messages=[
                {
                    "role": "system", 
                    "content": f"You are a highly Intelligent AI. Use this LIVE web data to answer the user accurately: {web_context}"
                },
                {"role": "user", "content": q}
            ],
            extra_headers={
                "HTTP-Referer": "https://pioneer-ai.vercel.app",
                "X-Title": "Pioneer Intelligent AI",
            }
        )
        return {
            "reply": response.choices[0].message.content,
            "sources": "Live Web Data utilized."
        }
    except Exception as e:
        return {"reply": f"The Brain is struggling: {str(e)}"}
    
    return {
        "reply": response.choices[0].message.content,
        "sources": web_context
    }
