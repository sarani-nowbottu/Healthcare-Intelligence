"""
Flask AI/ML & Policy Intelligence Microservice
AI-Powered Healthcare Policy Intelligence & Prediction System
Runs on Port 5001
"""

import os
import sys
import shutil
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Ensure local directories are in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, 'ml'))
sys.path.append(os.path.join(current_dir, 'rag'))

from predictor import predictor
from dataset_loader import FEATURE_MAPPING, TARGET_VARIABLE
from vector_store import vector_store
from gemini_client import gemini_assistant
from explainer import integrated_explainer

app = Flask(__name__)
CORS(app)

@app.before_request
def require_service_token():
    """Restrict public Flask API routes to the Express service when configured."""
    expected_token = os.environ.get('FLASK_SERVICE_TOKEN')
    if request.path.startswith('/api/') and expected_token:
        if request.headers.get('X-Service-Token') != expected_token:
            return jsonify({'error': 'This endpoint is available through the application API only.'}), 401

DEFAULT_POLICIES_DIR = os.path.join(current_dir, 'policies_storage')
POLICIES_DIR = os.environ.get('POLICIES_DIR', DEFAULT_POLICIES_DIR)
os.makedirs(POLICIES_DIR, exist_ok=True)

# Seed a mounted persistent directory with the bundled policy PDFs on first boot.
if os.path.abspath(POLICIES_DIR) != os.path.abspath(DEFAULT_POLICIES_DIR):
    for filename in os.listdir(DEFAULT_POLICIES_DIR):
        source = os.path.join(DEFAULT_POLICIES_DIR, filename)
        destination = os.path.join(POLICIES_DIR, filename)
        if filename.lower().endswith('.pdf') and os.path.isfile(source) and not os.path.exists(destination):
            shutil.copy2(source, destination)

# Ensure vector index is built
vector_store.build_index(POLICIES_DIR)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'AI/ML & Policy Intelligence Microservice',
        'models_loaded': len(predictor.models),
        'classifiers_loaded': len(predictor.classifiers),
        'policies_indexed': len(vector_store.documents),
        'chunks_indexed': len(vector_store.chunks),
        'gemini_live': gemini_assistant.is_live,
        'gemini_model': gemini_assistant.model_name if gemini_assistant.is_live else 'offline_grounded_index'
    }), 200

# ----------------- ML ENDPOINTS -----------------

@app.route('/api/ml/districts', methods=['GET'])
def get_districts():
    """Returns all supported districts grouped by state."""
    try:
        grouped = predictor.get_supported_districts()
        all_districts = []
        for state, d_list in grouped.items():
            for d in d_list:
                all_districts.append({'state': state, 'district': d})
        return jsonify({
            'total_districts': len(all_districts),
            'states_count': len(grouped),
            'grouped_by_state': grouped,
            'districts': all_districts
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/district/<district_name>', methods=['GET'])
def get_district_profile(district_name):
    """Retrieves verified NFHS-5 indicator profile for a district."""
    state_name = request.args.get('state')
    profile = predictor.get_district_profile(district_name, state_name)
    if not profile:
        return jsonify({'error': f"District '{district_name}' not found."}), 404
    return jsonify(profile), 200

@app.route('/api/ml/predict', methods=['POST'])
def predict_outcome():
    """
    Accepts district indicator values, runs ML regression and tier classification,
    and returns feature impacts plus integrated policy explanation.
    """
    data = request.get_json() or {}
    features = data.get('features', {})
    selected_model = data.get('selected_model', 'Gradient Boosting')
    district_name = data.get('district_name')
    state_name = data.get('state_name')

    # If district name provided without features, auto-populate from historical dataset
    district_info = None
    if district_name and not features:
        profile = predictor.get_district_profile(district_name, state_name)
        if profile:
            features = {k: v['value'] for k, v in profile['indicators'].items()}
            district_info = {'district': profile['district'], 'state': profile['state']}

    if not features:
        return jsonify({'error': 'No input features or valid district provided.'}), 400

    try:
        pred_result = predictor.predict(features, selected_model=selected_model)
        
        # Connect ML + GenAI for integrated policy explanation
        explainer_res = integrated_explainer.generate_explanation_and_recommendations(
            pred_result, district_info=district_info
        )
        
        response = {
            'success': True,
            'prediction': pred_result,
            'policy_explanation': explainer_res['explanation_text'],
            'citations': explainer_res['citations'],
            'district_info': district_info
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': f"Prediction failed: {str(e)}"}), 500

@app.route('/api/ml/model-performance', methods=['GET'])
def get_model_performance():
    """Returns comparative metrics, feature importance, and residuals."""
    try:
        meta = predictor.evaluation_meta
        return jsonify(meta), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/feature-importance', methods=['GET'])
def get_feature_importance():
    """Returns sorted feature importances with descriptive categories."""
    try:
        return jsonify({
            'features': predictor.feature_importance,
            'feature_mapping': FEATURE_MAPPING,
            'target': TARGET_VARIABLE
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----------------- ANALYTICS ENDPOINTS -----------------

@app.route('/api/analytics/overview', methods=['GET'])
def get_analytics_overview():
    """Returns national aggregate summary, distributions, and tier breakdown."""
    try:
        df = predictor.dataset
        target_series = df[TARGET_VARIABLE]
        
        tier_counts = df['performance_tier'].value_counts().to_dict()
        
        # State averages
        state_agg = df.groupby('state')[TARGET_VARIABLE].mean().round(2).sort_values(ascending=False).to_dict()
        
        # Top 5 and Bottom 5 districts
        top_5 = df[['state', 'district', TARGET_VARIABLE]].sort_values(TARGET_VARIABLE, ascending=False).head(5).to_dict(orient='records')
        bottom_5 = df[['state', 'district', TARGET_VARIABLE]].sort_values(TARGET_VARIABLE, ascending=True).head(5).to_dict(orient='records')

        return jsonify({
            'total_districts': len(df),
            'national_average_rate': round(float(target_series.mean()), 2),
            'national_median_rate': round(float(target_series.median()), 2),
            'min_rate': round(float(target_series.min()), 2),
            'max_rate': round(float(target_series.max()), 2),
            'tier_distribution': tier_counts,
            'state_averages': state_agg,
            'top_5_districts': top_5,
            'bottom_5_districts': bottom_5,
            'national_benchmarks': predictor.national_benchmarks
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/regions', methods=['GET'])
def get_regional_indicators():
    """Returns state-level averages across all 15 indicators for comparative heatmaps."""
    try:
        df = predictor.dataset
        feature_cols = list(FEATURE_MAPPING.keys()) + [TARGET_VARIABLE]
        state_summary = df.groupby('state')[feature_cols].mean().round(2).reset_index()
        return jsonify({
            'regions': state_summary.to_dict(orient='records'),
            'indicators': FEATURE_MAPPING
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----------------- RAG & POLICY ASSISTANT ENDPOINTS -----------------

@app.route('/api/rag/query', methods=['POST'])
def rag_query():
    """Grounded question answering across official healthcare policy documents."""
    data = request.get_json() or {}
    query = data.get('query', '').strip()
    chat_history = data.get('chat_history', [])

    if not query:
        return jsonify({'error': 'Query text is required.'}), 400

    try:
        retrieved = vector_store.search(query, top_k=4)
        response = gemini_assistant.generate_grounded_answer(query, retrieved, chat_history=chat_history)
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': f"RAG query failed: {str(e)}"}), 500

@app.route('/api/policies', methods=['GET'])
def list_policies():
    """Lists all available official policy documents and indexing status."""
    try:
        docs = vector_store.list_documents()
        return jsonify({
            'total_policies': len(docs),
            'total_chunks': len(vector_store.chunks),
            'policies': docs
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rag/summarize', methods=['POST'])
def summarize_policy():
    """Generates structured summary of a specific policy document."""
    data = request.get_json() or {}
    doc_name = data.get('document_name', '')
    if not doc_name:
        return jsonify({'error': 'document_name is required.'}), 400

    try:
        context = vector_store.get_document_summary_context(doc_name)
        if not context:
            return jsonify({'error': f"Document '{doc_name}' not found."}), 404
        doc_title = os.path.splitext(doc_name)[0].replace('_', ' ')
        summary = gemini_assistant.summarize_policy(doc_title, context)
        return jsonify({
            'document_name': doc_name,
            'document_title': doc_title,
            'summary': summary
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/policies/upload', methods=['POST'])
def upload_policy():
    """Uploads a new healthcare policy PDF and updates vector index."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request.'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file.'}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are supported.'}), 400

    try:
        fname = secure_filename(file.filename)
        dest_path = os.path.join(POLICIES_DIR, fname)
        file.save(dest_path)
        
        # Re-index
        vector_store.build_index(POLICIES_DIR)
        return jsonify({
            'success': True,
            'message': f"Document '{fname}' uploaded and indexed successfully.",
            'filename': fname,
            'total_policies': len(vector_store.documents),
            'total_chunks': len(vector_store.chunks)
        }), 201
    except Exception as e:
        return jsonify({'error': f"Upload failed: {str(e)}"}), 500

@app.route('/api/recommendations/generate', methods=['POST'])
def generate_recommendations():
    """Generates tailored policy recommendations from district indicators."""
    data = request.get_json() or {}
    district_name = data.get('district_name')
    state_name = data.get('state_name')
    custom_features = data.get('features', {})

    try:
        district_info = None
        if district_name:
            profile = predictor.get_district_profile(district_name, state_name)
            if profile:
                custom_features = {k: v['value'] for k, v in profile['indicators'].items()}
                district_info = {'district': profile['district'], 'state': profile['state']}

        pred_res = predictor.predict(custom_features, selected_model='Gradient Boosting')
        rec_res = integrated_explainer.generate_explanation_and_recommendations(pred_res, district_info)
        return jsonify({
            'prediction': pred_res,
            'recommendations': rec_res['explanation_text'],
            'citations': rec_res['citations'],
            'district_info': district_info
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', os.environ.get('FLASK_PORT', 5001)))
    print(f"Starting Healthcare AI/ML Service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
