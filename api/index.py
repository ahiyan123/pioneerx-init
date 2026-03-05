import os
from fastapi import FastAPI, Query
from duckduckgo_search import DDGS
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# 1. Pioneer Connect: OpenRouter + Safety Lock
api_key = os.getenv("OPENROUTER_API_KEY")
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key if api_key else "missing_key",
)

def get_live_web_context(query: str):
    """The 'Pioneer Eyes' - Using Lite backend for better reliability"""
    try:
        with DDGS() as ddgs:
            # backend="lite" is faster and less likely to be blocked by bot filters
            results = ddgs.text(
                query, 
                region='wt-wt', 
                safesearch='moderate', 
                backend="lite", 
                max_results=5
            )
            
            # Convert generator to list and check if empty
            res_list = list(results)
            if not res_list:
                return "No recent web data found. Please use your general knowledge."
            
            # Formatting for the AI
            blob = "\n".join([f"Info: {r['body']} (Source: {r['href']})" for r in res_list])
            return blob
    except Exception as e:
        print(f"Search Crash: {e}")
        return "The web search engine is currently resting."

@app.get("/api/chat")
async def chat(q: str = Query(..., description="The user's question")):
    if api_key == "missing_key":
        return {"reply": "Engineer Error: Add your OPENROUTER_API_KEY to Vercel."}

    # A. Get real-time context from the web
    web_context = get_live_web_context(q)
    
    # B. Generate the answer using a FREE model
    # System prompt forces the AI to look at the 'web_context' first
    try:
        response = client.chat.completions.create(
            model="openrouter/auto:free", 
            messages=[
                {
                    "role": "system", 
                    "content": f"You are a highly Intelligent AI. Use this LIVE web data to answer: {web_context}"
                },
                {"role": "user", "content": q}
            ],
            extra_headers={
                "HTTP-Referer": "https://pioneer-ai.vercel.app",
                "X-Title": "Pioneer Intelligent AI",
            }
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        return {"reply": f"The Brain encountered a glitch: {str(e)}"}
            extra_headers={"X-Title": "Pioneer Intelligent AI"}
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        return {"reply": f"Brain Error: {str(e)}"}
