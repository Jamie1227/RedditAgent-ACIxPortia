import os
from dotenv import load_dotenv
from rich import print as rprint 
import json

import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

# Add CORS middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model for chat messages
class ChatMessage(BaseModel):
    message: str

# Response model
class ChatResponse(BaseModel):
    response: str

@app.get("/")
def read_root():
    return {"message": "FastAPI Backend is running!"}

@app.post("/chat")
def chat_endpoint(chat_message: ChatMessage):
    # For now, just return "Hello world" regardless of input
    return ChatResponse(response="Hello world")

# Alternative GET endpoint if you prefer
@app.get("/hello")
def hello_world():

    return {"message": "Hello world"}

@app.post("/search_reddit")
def search_reddit(subreddit: ChatMessage):
    """
    Search the Reddit API for posts matching the query.
    """
    from config import config, tool_registry
    from portia import Portia

    portia_instance = Portia(config=config, tools=tool_registry)

    prompt = f"""
    1. retrieve the latest 5 posts from the r/{subreddit.message} subreddit 
    2. summarise each posts with source link
    3. list posts with High engagement
    4. for post with high engagement, draft a comment that are relevant to the thread
    5. Turn the outputs into a Markdown format
    """

    # test_prompt = f"""Turn 'Top {subreddit.message} Libraries
    #     Pydantic, Polars, and `FastAPI` are amazing!

    #     [Visit Python.org](https://www.python.org)' into a markdown
    #     """

    step = None
    final_output = None

    try:
        # Step 1: Create plan
        plan = portia_instance.plan(prompt)
        steps = plan.model_dump()

        # Extract further sub-sections from 'steps'
        plan_context = steps['plan_context']
        plan_steps = steps['steps']

        # Format steps into markdown
        formatted_steps = []
        formatted_steps.append(f"### Available Tools\n")
        for tool_id in plan_context['tool_ids']:
            formatted_steps.append(f"- **{tool_id}**\n")
        formatted_steps.append(f"\n\n### Execution Steps\n")
        
        for step in plan_steps:
            formatted_step = f"\n**Task:** {step['task']} \n**Tool:** {step['tool_id']}"
            formatted_steps.append(formatted_step)
        
        formatted_steps_str = "\n".join(formatted_steps)

        plan_steps_str = json.dumps(plan_steps, indent=2)

        # Extracting from plan_context
        tool_ids = plan_context['tool_ids']

        # Step 2: Run plan
        plan_run = portia_instance.run_plan(plan)

        # if plan_run.state == PlanRunState.NEED_CLARIFICATION:
        #     # steps.append({
        #     #     "step": "Clarification Needed",
        #     #     "message": "The plan requires clarification. Please resolve via CLI or interactive interface."
        #     # })

        if plan_run.outputs and plan_run.outputs.final_output:
            final_output = plan_run.outputs.final_output.value
        # elif plan_run.state == PlanRunState.COMPLETE:
        #     steps.append({
        #         "step": "Plan Complete",
        #         "message": "Plan completed successfully, but no final output found."
        #     })
        # else:
        #     steps.append({
        #         "step": "Incomplete Plan",
        #         "message": f"Plan run ended with state: {plan_run.state}."
        #     })

    except Exception as e:
        import traceback
        import io
        tb = io.StringIO()
        traceback.print_exc(file=tb)

    return JSONResponse(content={
        "steps": formatted_steps_str,
        #"tool_ids": tool_ids,
        "final_output": final_output
    })
 

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
