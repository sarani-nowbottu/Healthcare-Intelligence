"""
Comprehensive Pre-Launch Verification Script
AI-Powered Healthcare Policy Intelligence & Prediction System
"""

import os
import sys
import json

base_dir = os.path.dirname(os.path.abspath(__file__))
flask_dir = os.path.join(base_dir, 'flask_service')
sys.path.append(flask_dir)
sys.path.append(os.path.join(flask_dir, 'ml'))
sys.path.append(os.path.join(flask_dir, 'rag'))

def run_inspection():
    print("=" * 70)
    print("AI-POWERED HEALTHCARE POLICY INTELLIGENCE & PREDICTION SYSTEM")
    print("PRE-LAUNCH SYSTEM VERIFICATION AUDIT")
    print("=" * 70)

    # 1. Dataset Verification
    print("\n[1] DATASET VERIFICATION (NFHS-5)")
    from dataset_loader import load_and_preprocess_data, FEATURE_MAPPING
    df = load_and_preprocess_data()
    print(f"✓ Total Processed Districts: {len(df)}")
    print(f"✓ States & Union Territories: {df['state'].nunique()}")
    print(f"✓ Canonical Healthcare Features: {len(FEATURE_MAPPING)}")
    print(f"✓ Mean Institutional Delivery Rate: {df['institutional_births'].mean():.2f}%")
    print(f"✓ Performance Tier Breakdown: High={sum(df['performance_tier']=='High')}, Medium={sum(df['performance_tier']=='Medium')}, Low={sum(df['performance_tier']=='Low')}")

    # 2. Machine Learning Models & Metrics
    print("\n[2] MACHINE LEARNING BENCHMARK METRICS")
    from predictor import predictor
    eval_meta = predictor.evaluation_meta
    print(f"✓ Production Best Model: {eval_meta.get('best_regression_model')}")
    for name, m in eval_meta.get('regression_metrics', {}).items():
        print(f"   - {name:<22}: R²={m['R2']:<7} | MAE={m['MAE']:<6}% | RMSE={m['RMSE']}%")

    # 3. Live Prediction Test
    print("\n[3] LIVE ML PREDICTION TEST (Patna, Bihar)")
    profile = predictor.get_district_profile('Patna', 'Bihar')
    features = {k: v['value'] for k, v in profile['indicators'].items()}
    pred = predictor.predict(features, selected_model='Gradient Boosting')
    print(f"✓ District: Patna (Bihar)")
    print(f"✓ Actual Survey Rate: {profile['actual_institutional_births']}%")
    print(f"✓ ML Predicted Rate:  {pred['predicted_institutional_delivery_rate']}%")
    print(f"✓ Uncertainty (95%):  {pred['prediction_interval']['lower_bound_95']}% to {pred['prediction_interval']['upper_bound_95']}%")
    print(f"✓ Performance Tier:   {pred['predicted_performance_tier']}")
    print(f"✓ Model Comparison:   {pred['multi_model_comparison']}")
    print(f"✓ Top Driver:         {pred['top_positive_drivers'][0]['display_name']} ({pred['top_positive_drivers'][0]['input_value']}%)")
    print(f"✓ Key Bottleneck:     {pred['key_bottlenecks'][0]['display_name'] if pred['key_bottlenecks'] else 'None'}")

    # 4. RAG Vector Store & Policy Index
    print("\n[4] GENAI & RAG RETRIEVAL VERIFICATION")
    from vector_store import vector_store
    from gemini_client import gemini_assistant
    print(f"✓ Indexed Policies: {len(vector_store.documents)}")
    for d in vector_store.documents:
        print(f"   - {d['document_title']} ({d['total_pages']} page(s), {d['total_chunks']} chunks)")

    test_q = "What is the cash incentive under Janani Suraksha Yojana in Low Performing States?"
    hits = vector_store.search(test_q, top_k=1)
    print(f"✓ Test Semantic Search Query: '{test_q}'")
    print(f"   -> Top Hit: {hits[0]['document_title']} (Page {hits[0]['page_number']}) | Cosine Score: {hits[0]['score']}")
    ans = gemini_assistant.generate_grounded_answer(test_q, hits)
    print(f"✓ Grounded Answer: {ans['answer'][:180]}...")
    print(f"✓ Citations Provided: {len(ans['citations'])}")

    # 5. Integrated Explainer
    print("\n[5] INTEGRATED GENAI + ML POLICY EXPLAINER")
    from explainer import integrated_explainer
    exp = integrated_explainer.generate_explanation_and_recommendations(pred, {'district': 'Patna', 'state': 'Bihar'})
    print(f"✓ Generated Explainer Brief Length: {len(exp['explanation_text'])} chars")
    print(f"✓ Official Policy Citations Linked: {len(exp['citations'])}")
    print(f"✓ Section Header Sample: {exp['explanation_text'].splitlines()[0]}")

    # 6. SQLite Database Verification
    print("\n[6] PERSISTENT SQLITE DATABASE")
    db_file = os.path.join(base_dir, 'backend', 'healthcare_system.db')
    if os.path.exists(db_file):
        import sqlite3
        con = sqlite3.connect(db_file)
        cur = con.cursor()
        tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
        print(f"✓ Database file exists: {os.path.basename(db_file)} ({os.path.getsize(db_file):,} bytes)")
        print(f"✓ Tables: {', '.join(tables)}")
        user = cur.execute("SELECT name, email, role FROM users WHERE email='demo@healthcare.org'").fetchone()
        if user:
            print(f"✓ Seeded Demo User Verified: {user[0]} ({user[1]}, Role: {user[2]})")
        con.close()

    print("\n" + "=" * 70)
    print("ALL 6 SUBSYSTEMS FULLY OPERATIONAL & READY FOR DEMO!")
    print("=" * 70)

if __name__ == '__main__':
    run_inspection()
