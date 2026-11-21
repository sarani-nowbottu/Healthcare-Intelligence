"""
Comprehensive Pytest Test Suite
AI-Powered Healthcare Policy Intelligence & Prediction System
"""

import os
import sys
import pytest
import json

# Add current dir and submodules to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
sys.path.append(os.path.join(current_dir, 'ml'))
sys.path.append(os.path.join(current_dir, 'rag'))

from dataset_loader import load_and_preprocess_data, FEATURE_MAPPING, TARGET_VARIABLE
from predictor import predictor
from vector_store import vector_store
from gemini_client import gemini_assistant
from explainer import integrated_explainer
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# 1. Dataset & Preprocessing Tests
def test_dataset_loader():
    df = load_and_preprocess_data()
    assert len(df) >= 700, "Dataset should have at least 700 districts"
    assert TARGET_VARIABLE in df.columns, "Target variable must be present"
    assert 'performance_tier' in df.columns, "Performance tier column must be present"
    for col in FEATURE_MAPPING.keys():
        assert col in df.columns, f"Feature {col} must exist in processed dataset"
        assert df[col].isna().sum() == 0, f"Feature {col} should have no missing values after imputation"

# 2. Machine Learning Model Tests
def test_predictor_loaded():
    assert len(predictor.models) >= 4, "At least 4 regression models must be loaded"
    assert 'Gradient Boosting' in predictor.models
    assert 'Random Forest' in predictor.models
    assert 'Decision Tree' in predictor.models
    assert 'K-Nearest Neighbors' in predictor.models
    assert len(predictor.classifiers) >= 1, "At least one classifier must be loaded"

def test_prediction_inference():
    # Test on Patna, Bihar profile
    profile = predictor.get_district_profile('Patna', 'Bihar')
    assert profile is not None, "Patna, Bihar profile should exist"
    assert profile['actual_institutional_births'] > 0

    features = {k: v['value'] for k, v in profile['indicators'].items()}
    pred = predictor.predict(features, selected_model='Gradient Boosting')

    assert 'predicted_institutional_delivery_rate' in pred
    assert 0.0 <= pred['predicted_institutional_delivery_rate'] <= 100.0
    assert pred['predicted_performance_tier'] in ['High', 'Medium', 'Low']
    assert len(pred['multi_model_comparison']) == 4, "All 4 models must produce comparison predictions"
    assert len(pred['top_positive_drivers']) > 0, "Positive drivers must be identified"
    assert 'prediction_interval' in pred
    assert pred['prediction_interval']['lower_bound_95'] <= pred['predicted_institutional_delivery_rate'] <= pred['prediction_interval']['upper_bound_95']

def test_model_evaluation_metrics():
    eval_data = predictor.evaluation_meta
    assert 'regression_metrics' in eval_data
    assert 'classification_metrics' in eval_data
    
    # Check that all 4 models are benchmarked
    for m in ['Decision Tree', 'Random Forest', 'K-Nearest Neighbors', 'Gradient Boosting']:
        assert m in eval_data['regression_metrics']
        metrics = eval_data['regression_metrics'][m]
        assert 'MAE' in metrics and metrics['MAE'] > 0
        assert 'RMSE' in metrics and metrics['RMSE'] > 0
        assert 'R2' in metrics and metrics['R2'] > 0

# 3. RAG & Policy Retrieval Tests
def test_vector_store_indexing():
    assert len(vector_store.documents) >= 4, "At least 4 policy documents should be indexed"
    assert len(vector_store.chunks) >= 4, "Policy chunks should be generated"

def test_semantic_retrieval():
    query = "cash assistance for institutional delivery under JSY"
    results = vector_store.search(query, top_k=2)
    assert len(results) > 0, "Retrieval should return matching passages"
    assert 'Janani' in results[0]['document_title'] or 'PM-JAY' in results[0]['document_title']
    assert 'page_number' in results[0]

def test_gemini_grounded_answer():
    sample_chunk = [{
        'document_title': 'Janani Suraksha Yojana JSY Guidelines',
        'document_name': 'Janani_Suraksha_Yojana_JSY_Guidelines.pdf',
        'page_number': 1,
        'total_pages': 1,
        'score': 0.45,
        'text': 'Janani Suraksha Yojana promotes institutional delivery among poor pregnant women through conditional cash assistance.'
    }]
    res = gemini_assistant.generate_grounded_answer("What is JSY?", sample_chunk)
    assert 'answer' in res
    assert len(res['citations']) > 0

# 4. Integrated ML + GenAI Explainer Tests
def test_integrated_explainer():
    pred_data = {
        'predicted_institutional_delivery_rate': 82.5,
        'predicted_performance_tier': 'Medium',
        'selected_algorithm': 'Gradient Boosting',
        'prediction_interval': {'lower_bound_95': 74.4, 'upper_bound_95': 90.6},
        'top_positive_drivers': [{'display_name': 'Electricity Access (%)', 'input_value': 99.0}],
        'key_bottlenecks': [{'display_name': 'At Least 4 ANC Visits (%)', 'input_value': 45.0, 'national_mean': 58.5}]
    }
    exp = integrated_explainer.generate_explanation_and_recommendations(pred_data, {'district': 'Gaya', 'state': 'Bihar'})
    assert 'explanation_text' in exp
    assert 'Prediction Interpretation' in exp['explanation_text']
    assert 'Janani Suraksha Yojana' in exp['explanation_text'] or 'PMMVY' in exp['explanation_text']

# 5. Flask REST API Integration Tests
def test_flask_health_endpoint(client):
    res = client.get('/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'healthy'
    assert data['models_loaded'] >= 4

def test_flask_districts_endpoint(client):
    res = client.get('/api/ml/districts')
    assert res.status_code == 200
    data = res.get_json()
    assert data['total_districts'] >= 700
    assert 'Bihar' in data['grouped_by_state']

def test_flask_predict_endpoint(client):
    payload = {
        'district_name': 'Patna',
        'state_name': 'Bihar',
        'selected_model': 'Gradient Boosting'
    }
    res = client.post('/api/ml/predict', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'prediction' in data
    assert 'policy_explanation' in data
    assert 'citations' in data

def test_flask_analytics_overview(client):
    res = client.get('/api/analytics/overview')
    assert res.status_code == 200
    data = res.get_json()
    assert data['total_districts'] >= 700
    assert 'national_average_rate' in data

def test_flask_rag_query(client):
    payload = {'query': 'What is the benefit under PM-JAY?'}
    res = client.post('/api/rag/query', json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert 'answer' in data
    assert 'citations' in data
