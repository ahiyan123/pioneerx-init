from fastapi import FastAPI, Query
from duckduckgo_search import DDGS
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow the frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/chat")
async def get_search_context(q: str = Query(...)):
    """The 'Eyes' - Only returns search results to the frontend"""
    try:
        with DDGS() as ddgs:
            # We use 5 results for the 'Golden Ratio'
            results = list(ddgs.text(q, max_results=5, backend="lite"))
            if not results:
                return {"context": "No live web data found."}
            
            context = "\n".join([f"Source: {r['href']} | Info: {r['body']}" for r in results])
            return {"context": context}
    except Exception as e:
        return {"context": f"Search error: {str(e)}"}
