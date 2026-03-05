from fastapi import FastAPI, Query
from ddgs import DDGS # Updated to the new 2026 library
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow your Vercel frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the search client once for better performance
ddgs_client = DDGS()

@app.get("/api/chat")
async def get_search_context(q: str = Query(...)):
    """The 'Eyes' - Fetches live data from the web"""
    try:
        # Using the modern ddgs.text() method
        results = ddgs_client.text(q, max_results=5)
        
        if not results:
            return {"context": "No live web data found."}
        
        # Format the results into a single string for the AI Brain
        context = "\n".join([f"Source: {r.get('href')} | Info: {r.get('body')}" for r in results])
        return {"context": context}
    except Exception as e:
        return {"context": f"Search logic error: {str(e)}"}
