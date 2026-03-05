import os
from fastapi import FastAPI, Query
from duckduckgo_search import DDGS
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# 1. Setup OpenRouter
api_key = os.getenv("OPENROUTER_API_KEY")
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key if api_key else "missing",
)

def get_live_web_context(query: str):
    """Enhanced search to find current news like DeepSeek"""
    try:
        with DDGS() as ddgs:
            # We use 'auto' backend to ensure we get real web snippets
            results = list(ddgs.text(query, max_results=5, backend="auto"))
            if not results:
                return "No recent web data found."
            
            # Formatting as a clear list for the AI to digest
            return "\n".join([f"WEB RESULT: {r['body']} (Source: {r['href']})" for r in results])
    except Exception as e:
        return f"Search error: {str(e)}"

@app.get("/api/chat")
async def chat(q: str = Query(..., description="The user's question")):
    if api_key == "missing":
        return {"reply": "Configuration Error: API Key missing in Vercel settings."}

    # A. Perform the search
    web_data = get_live_web_context(q)
    
    # B. The 'Pioneer' Instructions: Force the AI to use the web data
    system_instruction = (
        "You are a highly Intelligent AI with real-time web access. "
        "The user is asking about current events. Use the following LIVE WEB DATA to answer. "
        "If the data mentions DeepSeek, Liang Wenfeng, or High-Flyer Capital, use that info! "
        f"\n\nLIVE WEB DATA:\n{web_data}"
    )

    try:
        response = client.chat.completions.create(
            model="openrouter/auto:free", 
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": q}
            ],
            extra_headers={"X-Title": "Pioneer Intelligent AI"}
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        return {"reply": f"Brain Error: {str(e)}"}
