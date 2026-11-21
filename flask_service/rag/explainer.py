"""
Integrated ML + GenAI Policy Explainer & Recommendation Engine
AI-Powered Healthcare Policy Intelligence & Prediction System
"""

import os
from vector_store import vector_store
from gemini_client import gemini_assistant

class IntegratedPolicyExplainer:
    def __init__(self):
        pass

    def generate_explanation_and_recommendations(self, prediction_result, district_info=None):
        """
        Takes prediction output from ML models, queries the RAG system for relevant
        policies matching the identified indicators/bottlenecks, and generates a grounded explanation.
        """
        pred_rate = prediction_result.get('predicted_institutional_delivery_rate', 0.0)
        pred_tier = prediction_result.get('predicted_performance_tier', 'Medium')
        algorithm = prediction_result.get('selected_algorithm', 'Gradient Boosting')
        top_drivers = prediction_result.get('top_positive_drivers', [])
        bottlenecks = prediction_result.get('key_bottlenecks', [])
        interval = prediction_result.get('prediction_interval', {})

        district_label = ""
        if district_info:
            district_label = f" for {district_info.get('district', 'Selected District')} ({district_info.get('state', '')})"

        # Formulate targeted RAG queries based on the top bottlenecks
        rag_queries = []
        if bottlenecks:
            for b in bottlenecks[:2]:
                rag_queries.append(f"policy guidelines addressing {b['display_name']} institutional delivery maternal health")
        else:
            rag_queries.append("National Health Policy targets for institutional delivery and maternal healthcare")

        # Query vector store for each bottleneck
        retrieved_contexts = []
        seen_chunks = set()
        for q in rag_queries:
            hits = vector_store.search(q, top_k=2)
            for h in hits:
                if h['chunk_id'] not in seen_chunks:
                    seen_chunks.add(h['chunk_id'])
                    retrieved_contexts.append(h)

        # Build prompt for GenAI
        drivers_summary = ", ".join([f"{d['display_name']} ({d['input_value']}%)" for d in top_drivers]) or "Balanced overall profile"
        bottlenecks_summary = ", ".join([f"{b['display_name']} ({b['input_value']}% vs national mean {b['national_mean']}%)" for b in bottlenecks]) or "None identified below national average"

        context_str = "\n\n".join([
            f"[{c['document_title']}, Page {c['page_number']}]: {c['text']}"
            for c in retrieved_contexts
        ])

        system_prompt = (
            f"You are an expert Healthcare Policy Analyst bridging Machine Learning predictions with Government Healthcare Policies.\n\n"
            f"DATA OBSERVATION / ML PREDICTION RESULTS{district_label}:\n"
            f"- Predicted Institutional Delivery Rate: {pred_rate}% (Estimated 95% interval: {interval.get('lower_bound_95', 0)}% - {interval.get('upper_bound_95', 100)}%)\n"
            f"- Healthcare Performance Tier: {pred_tier}\n"
            f"- Machine Learning Algorithm: {algorithm}\n"
            f"- Key Positive Contributors: {drivers_summary}\n"
            f"- Key Bottlenecks / Indicator Gaps: {bottlenecks_summary}\n\n"
            f"RELEVANT RETRIEVED POLICY GUIDELINES:\n{context_str}\n\n"
            "TASK:\n"
            "Generate an analytical, grounded report structured into 4 distinct sections:\n"
            "1. Prediction Interpretation: Explain what the predicted institutional delivery rate and tier signify compared to national health goals.\n"
            "2. Contributing Factors Analysis: Highlight which empirical indicators supported or hindered this estimate (do NOT claim direct causation; emphasize correlation).\n"
            "3. Applicable Government Healthcare Policies: Cite specific provisions, cash assistance (e.g. JSY LPS vs HPS rates, PMMVY maternity benefits, or PM-JAY coverage), or institutional support from the retrieved documents that directly address these gaps.\n"
            "4. Evidence-Based Actionable Recommendations: Propose 3 practical, data-driven areas for health administrators or local health workers (ASHAs/ANMs) to focus on.\n"
            "Keep the language objective, professional, and citizen-accessible."
        )

        genai_explanation = None
        if gemini_assistant.is_live and gemini_assistant.client:
            try:
                if gemini_assistant.sdk_type == 'genai':
                    res = gemini_assistant.client.models.generate_content(
                        model=gemini_assistant.model_name,
                        contents=system_prompt
                    )
                    genai_explanation = res.text
                else:
                    res = gemini_assistant.client.generate_content(system_prompt)
                    genai_explanation = res.text
            except Exception as e:
                print(f"Gemini generation error in explainer: {e}")

        if not genai_explanation:
            # Deterministic, grounded fallback synthesis
            genai_explanation = (
                f"### Analytical Prediction Assessment{district_label}\n\n"
                f"**1. Prediction Interpretation:**\n"
                f"The trained {algorithm} model estimates an institutional delivery rate of **{pred_rate}%** "
                f"(expected range: {interval.get('lower_bound_95')}% to {interval.get('upper_bound_95')}%), classifying the region under the **{pred_tier} Performance Tier**.\n\n"
                f"**2. Contributing Empirical Indicators:**\n"
                f"- **Strengths:** {drivers_summary}.\n"
                f"- **Key Gaps:** {bottlenecks_summary}.\n"
                f"*(Note: The model identifies statistical association across 702 districts in the NFHS-5 survey; these reflect system-level correlations rather than singular direct causes).*\n\n"
                f"**3. Relevant Government Schemes & Provisions:**\n"
                f"Official guidelines from the National Health Mission address these maternal indicators:\n"
                f"- **Janani Suraksha Yojana (JSY):** Provides conditional cash assistance (up to ₹1400 for mothers in Low-Performing States plus ₹600 for ASHA mobilizers) specifically to remove financial barriers to institutional childbirth.\n"
                f"- **Pradhan Mantri Matru Vandana Yojana (PMMVY):** Offers Direct Benefit Transfer (₹5,000 in tranches) linked to early pregnancy registration (within 6 months) and mandatory ANC checkups.\n"
                f"- **Ayushman Bharat (PM-JAY):** Assures cashless secondary and tertiary care hospitalization up to ₹5 Lakh per family per year.\n\n"
                f"**4. Strategic Recommendations:**\n"
                f"1. *Strengthen Antenatal Care (ANC) Tracking:* Mobilize frontline ASHA workers to ensure all registered pregnant women complete at least 4 ANC visits before their third trimester.\n"
                f"2. *Overcome Transport & Infrastructure Hurdles:* Facilitate emergency transport linkages under NHM Janani Shishu Suraksha Karyakram (JSSK) for prompt access to public health centres.\n"
                f"3. *Cross-Scheme Enrollment Drives:* Integrate Ayushman Card and PMMVY portal registrations during Village Health, Sanitation and Nutrition Days (VHSND)."
            )

        citations = [
            {
                'document_title': c['document_title'],
                'document_name': c['document_name'],
                'page_number': c['page_number'],
                'relevance_score': c['score'],
                'snippet': c['text'][:180] + '...'
            }
            for c in retrieved_contexts
        ]

        return {
            'explanation_text': genai_explanation,
            'citations': citations,
            'retrieved_policies_count': len(retrieved_contexts),
            'generation_engine': 'Gemini 2.5 Flash' if (gemini_assistant.is_live and gemini_assistant.client) else 'Local Grounded Policy Engine'
        }

# Global explainer instance
integrated_explainer = IntegratedPolicyExplainer()

if __name__ == '__main__':
    # Test integrated explainer with mock prediction
    sample_pred = {
        'predicted_institutional_delivery_rate': 78.4,
        'prediction_interval': {'lower_bound_95': 70.3, 'upper_bound_95': 86.5},
        'predicted_performance_tier': 'Medium',
        'selected_algorithm': 'Gradient Boosting',
        'top_positive_drivers': [{'display_name': 'Electricity Access', 'input_value': 98.2}],
        'key_bottlenecks': [{'display_name': 'At Least 4 ANC Visits (%)', 'input_value': 42.1, 'national_mean': 58.5}]
    }
    res = integrated_explainer.generate_explanation_and_recommendations(sample_pred, {'district': 'Gaya', 'state': 'Bihar'})
    print("Explanation:\n", res['explanation_text'][:400], "...")
    print("\nCitations count:", len(res['citations']))
