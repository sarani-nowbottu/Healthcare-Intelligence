"""
Model Context Protocol (MCP) Server for Healthcare Policy Intelligence
Exposes tools for LLMs & AI Assistants:
- search_policy_documents
- predict_institutional_delivery
- get_district_indicators
- get_model_benchmark_report
- generate_policy_recommendations
"""

import os
import sys
import json
import logging

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
flask_dir = os.path.join(base_dir, 'flask_service')
sys.path.append(flask_dir)
sys.path.append(os.path.join(flask_dir, 'ml'))
sys.path.append(os.path.join(flask_dir, 'rag'))

from predictor import predictor
from vector_store import vector_store
from explainer import integrated_explainer

# Ensure vector store is initialized
policies_dir = os.path.join(flask_dir, 'policies_storage')
if os.path.exists(policies_dir):
    vector_store.build_index(policies_dir)

TOOLS_DEFINITION = [
    {
        "name": "search_policy_documents",
        "description": "Searches authentic Indian healthcare policy guidelines (PM-JAY, JSY, PMMVY, National Health Policy) for relevant clauses, entitlements, and eligibility rules.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query about healthcare schemes or eligibility"},
                "top_k": {"type": "integer", "default": 3, "description": "Number of passages to return"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "predict_institutional_delivery",
        "description": "Runs machine learning models (Gradient Boosting, Random Forest, KNN, Decision Tree) to predict the district-level institutional delivery rate and performance tier.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "district_name": {"type": "string", "description": "Name of district (e.g. Patna, Varanasi)"},
                "state_name": {"type": "string", "description": "State name (optional)"},
                "algorithm": {"type": "string", "default": "Gradient Boosting", "enum": ["Gradient Boosting", "Random Forest", "K-Nearest Neighbors", "Decision Tree"]}
            },
            "required": ["district_name"]
        }
    },
    {
        "name": "get_district_indicators",
        "description": "Retrieves official NFHS-5 maternal, child health, and infrastructure indicators for any of the 702 Indian districts.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "district_name": {"type": "string", "description": "Name of the district"},
                "state_name": {"type": "string", "description": "State name (optional)"}
            },
            "required": ["district_name"]
        }
    },
    {
        "name": "get_model_benchmark_report",
        "description": "Returns comparative academic evaluation metrics (MAE, MSE, RMSE, R² for regression and Accuracy, F1 for classification) across all 4 ML algorithms.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    }
]

def handle_tool_call(tool_name, arguments):
    if tool_name == "search_policy_documents":
        q = arguments.get("query", "")
        k = int(arguments.get("top_k", 3))
        hits = vector_store.search(q, top_k=k)
        return {"results": hits}

    elif tool_name == "predict_institutional_delivery":
        d_name = arguments.get("district_name")
        s_name = arguments.get("state_name")
        algo = arguments.get("algorithm", "Gradient Boosting")
        profile = predictor.get_district_profile(d_name, s_name)
        if not profile:
            return {"error": f"District '{d_name}' not found."}
        features = {k: v['value'] for k, v in profile['indicators'].items()}
        res = predictor.predict(features, selected_model=algo)
        return {"prediction": res, "district": profile['district'], "state": profile['state']}

    elif tool_name == "get_district_indicators":
        d_name = arguments.get("district_name")
        s_name = arguments.get("state_name")
        profile = predictor.get_district_profile(d_name, s_name)
        return profile or {"error": f"District '{d_name}' not found."}

    elif tool_name == "get_model_benchmark_report":
        return predictor.evaluation_meta

    else:
        return {"error": f"Unknown tool: {tool_name}"}

def run_mcp_cli():
    """Simple JSON-RPC stdin/stdout loop compatible with MCP clients."""
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            req = json.loads(line)
            method = req.get("method")
            req_id = req.get("id")

            if method == "tools/list":
                resp = {"jsonrpc": "2.0", "id": req_id, "result": {"tools": TOOLS_DEFINITION}}
            elif method == "tools/call":
                params = req.get("params", {})
                tool_name = params.get("name")
                args = params.get("arguments", {})
                tool_result = handle_tool_call(tool_name, args)
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [{"type": "text", "text": json.dumps(tool_result, indent=2)}]
                    }
                }
            else:
                resp = {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": "Method not found"}}

            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()
        except Exception as e:
            err_resp = {"jsonrpc": "2.0", "id": None, "error": {"code": -32603, "message": str(e)}}
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()

if __name__ == '__main__':
    # Test tool execution directly
    test_res = handle_tool_call("predict_institutional_delivery", {"district_name": "Patna", "state_name": "Bihar"})
    print("MCP Tool Call Test (predict_institutional_delivery for Patna):")
    print(f"Predicted Rate: {test_res['prediction']['predicted_institutional_delivery_rate']}%")
    print(f"Performance Tier: {test_res['prediction']['predicted_performance_tier']}")
