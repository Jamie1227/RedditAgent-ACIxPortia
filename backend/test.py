

import os
from dotenv import load_dotenv
from rich import print as rprint 

import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()


"""
Search the Reddit API for posts matching the query.
"""
from config import config, tool_registry
from portia import (
Portia,
PlanRunState)

portia_instance = Portia(config=config, tools=tool_registry)

test_prompt = f"""Turn 'Top python Libraries
    Pydantic, Polars, and `FastAPI` are amazing!

    [Visit Python.org](https://www.python.org)' into a markdown
    """

step = None
final_output = None

# Step 1: Create plan
plan = portia_instance.plan(test_prompt)
steps_section = plan.model_dump()

# Extract further sub-sections from 'steps'
plan_id = steps_section['id']
plan_context = steps_section['plan_context']
plan_steps = steps_section['steps']
plan_inputs = steps_section['plan_inputs']

# Extracting from plan_context
query = plan_context['query']
tool_ids = plan_context['tool_ids']

# Example: Extract first step
first_step = plan_steps[0]
task = first_step['task']
inputs = first_step['inputs']
tool_id = first_step['tool_id']
output = first_step['output']
condition = first_step['condition']

print(f"\nPlan ID:", plan_id)
print("Query:", query)
print("Tool IDs:", tool_ids)
print("Steps:", plan_steps)
print("First Task:", task)
print(f"\nFinal Output:", final_output)

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
#     })`
