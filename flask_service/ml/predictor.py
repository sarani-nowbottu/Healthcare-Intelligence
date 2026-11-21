"""
Inference & Feature Contribution Predictor
AI-Powered Healthcare Policy Intelligence & Prediction System
"""

import os
import joblib
import json
import numpy as np
import pandas as pd
from dataset_loader import load_and_preprocess_data, FEATURE_MAPPING, TARGET_VARIABLE

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models_storage')

class HealthcareOutcomePredictor:
    def __init__(self):
        self.models = {}
        self.classifiers = {}
        self.scaler = None
        self.clf_scaler = None
        self.evaluation_meta = {}
        self.feature_importance = {}
        self.dataset = None
        self.national_benchmarks = {}
        self._load_artifacts()

    def _load_artifacts(self):
        # Load scalers
        scaler_path = os.path.join(MODELS_DIR, 'scaler.joblib')
        if os.path.exists(scaler_path):
            self.scaler = joblib.load(scaler_path)

        clf_scaler_path = os.path.join(MODELS_DIR, 'classifier_scaler.joblib')
        if os.path.exists(clf_scaler_path):
            self.clf_scaler = joblib.load(clf_scaler_path)

        # Load regression models
        reg_files = {
            'Decision Tree': 'decision_tree_regressor.joblib',
            'Random Forest': 'random_forest_regressor.joblib',
            'K-Nearest Neighbors': 'k_nearest_neighbors_regressor.joblib',
            'Gradient Boosting': 'gradient_boosting_regressor.joblib',
            'Best Model': 'best_regressor.joblib'
        }
        for name, fname in reg_files.items():
            path = os.path.join(MODELS_DIR, fname)
            if os.path.exists(path):
                self.models[name] = joblib.load(path)

        # Load classifiers
        clf_files = {
            'Decision Tree': 'decision_tree_classifier.joblib',
            'Random Forest': 'random_forest_classifier.joblib',
            'K-Nearest Neighbors': 'k_nearest_neighbors_classifier.joblib',
            'Gradient Boosting': 'gradient_boosting_classifier.joblib',
            'Best Classifier': 'best_classifier.joblib'
        }
        for name, fname in clf_files.items():
            path = os.path.join(MODELS_DIR, fname)
            if os.path.exists(path):
                self.classifiers[name] = joblib.load(path)

        # Load evaluation meta
        eval_path = os.path.join(MODELS_DIR, 'models_evaluation.json')
        if os.path.exists(eval_path):
            with open(eval_path, 'r', encoding='utf-8') as f:
                self.evaluation_meta = json.load(f)

        # Load feature importance
        feat_path = os.path.join(MODELS_DIR, 'feature_importance.json')
        if os.path.exists(feat_path):
            with open(feat_path, 'r', encoding='utf-8') as f:
                self.feature_importance = json.load(f)

        # Load processed dataset for district lookups and benchmarks
        self.dataset = load_and_preprocess_data()
        feature_cols = list(FEATURE_MAPPING.keys())
        for col in feature_cols:
            self.national_benchmarks[col] = {
                'mean': round(float(self.dataset[col].mean()), 2),
                'median': round(float(self.dataset[col].median()), 2),
                'p25': round(float(self.dataset[col].quantile(0.25)), 2),
                'p75': round(float(self.dataset[col].quantile(0.75)), 2),
                'target': FEATURE_MAPPING[col]['benchmark_target']
            }

    def get_supported_districts(self):
        """Returns list of all districts grouped by state."""
        records = self.dataset[['state', 'district']].drop_duplicates().sort_values(['state', 'district'])
        grouped = {}
        for _, row in records.iterrows():
            st = row['state']
            dist = row['district']
            if st not in grouped:
                grouped[st] = []
            grouped[st].append(dist)
        return grouped

    def get_district_profile(self, district_name, state_name=None):
        """Retrieves verified historical NFHS-5 indicator profile for a district."""
        df = self.dataset
        matches = df[df['district'].str.lower() == district_name.strip().lower()]
        if state_name:
            matches = matches[matches['state'].str.lower() == state_name.strip().lower()]
        if matches.empty:
            return None

        row = matches.iloc[0]
        profile = {
            'state': row['state'],
            'district': row['district'],
            'actual_institutional_births': round(float(row[TARGET_VARIABLE]), 2),
            'actual_tier': row['performance_tier'],
            'indicators': {}
        }
        for k in FEATURE_MAPPING.keys():
            val = round(float(row[k]), 2)
            nat_mean = self.national_benchmarks[k]['mean']
            profile['indicators'][k] = {
                'value': val,
                'display_name': FEATURE_MAPPING[k]['display_name'],
                'category': FEATURE_MAPPING[k]['category'],
                'national_mean': nat_mean,
                'gap_vs_national': round(val - nat_mean, 2)
            }
        return profile

    def predict(self, feature_dict, selected_model='Gradient Boosting'):
        """
        Runs ML prediction on input features, computes multi-model comparisons,
        performance tier classification, and factor impact breakdown.
        """
        feature_cols = list(FEATURE_MAPPING.keys())
        input_vector = []
        for col in feature_cols:
            val = feature_dict.get(col)
            if val is None:
                val = self.national_benchmarks[col]['median']
            input_vector.append(float(val))

        input_df = pd.DataFrame([input_vector], columns=feature_cols)

        # Scale for KNN
        input_scaled = self.scaler.transform(input_df) if self.scaler else input_df

        # Predict across all models for comparison
        model_predictions = {}
        for name, m in self.models.items():
            if name == 'Best Model':
                continue
            if name == 'K-Nearest Neighbors':
                pred_val = float(m.predict(input_scaled)[0])
            else:
                pred_val = float(m.predict(input_df)[0])
            model_predictions[name] = round(float(np.clip(pred_val, 0.0, 100.0)), 2)

        # Selected model prediction
        if selected_model in self.models:
            chosen_pred = model_predictions.get(selected_model, model_predictions['Gradient Boosting'])
        else:
            chosen_pred = model_predictions['Gradient Boosting']

        # Multi-class performance tier classification
        clf_model = self.classifiers.get('Best Classifier', list(self.classifiers.values())[0])
        clf_scaler = self.clf_scaler
        if clf_scaler and hasattr(clf_model, 'kneighbors'):
            pred_tier = clf_model.predict(clf_scaler.transform(input_df))[0]
            tier_probs = clf_model.predict_proba(clf_scaler.transform(input_df))[0].tolist()
        else:
            pred_tier = clf_model.predict(input_df)[0]
            tier_probs = clf_model.predict_proba(input_df)[0].tolist() if hasattr(clf_model, 'predict_proba') else []

        # Feature impact & bottleneck diagnosis
        factor_contributions = []
        for item in self.feature_importance:
            col = item['feature_key']
            val = float(input_df[col].iloc[0])
            mean_val = self.national_benchmarks[col]['mean']
            importance = item['importance_score']
            gap = val - mean_val
            # Negative impact if early marriage is higher, or if positive health indicator is lower
            if col == 'early_marriage':
                impact_score = -gap * importance
            else:
                impact_score = gap * importance

            factor_contributions.append({
                'feature_key': col,
                'display_name': item['feature_name'],
                'category': item['category'],
                'input_value': val,
                'national_mean': mean_val,
                'relative_gap': round(gap, 2),
                'importance_weight': importance,
                'impact_score': round(float(impact_score), 4),
                'status': 'Strong Positive' if impact_score > 0.5 else ('Bottleneck / Area for Concern' if impact_score < -0.5 else 'Neutral')
            })

        factor_contributions.sort(key=lambda x: x['impact_score'], reverse=True)
        top_drivers = [f for f in factor_contributions if f['impact_score'] > 0][:3]
        key_bottlenecks = [f for f in sorted(factor_contributions, key=lambda x: x['impact_score']) if f['impact_score'] < 0][:3]

        # Uncertainty bounds (Gradient Boosting RMSE is ~8.1%)
        rmse = self.evaluation_meta.get('regression_metrics', {}).get('Gradient Boosting', {}).get('RMSE', 8.14)
        lower_bound = max(0.0, round(chosen_pred - rmse, 1))
        upper_bound = min(100.0, round(chosen_pred + rmse, 1))

        return {
            'predicted_institutional_delivery_rate': chosen_pred,
            'prediction_interval': {
                'lower_bound_95': lower_bound,
                'upper_bound_95': upper_bound,
                'rmse_uncertainty': rmse
            },
            'predicted_performance_tier': pred_tier,
            'tier_probabilities': {
                label: round(prob, 4)
                for label, prob in zip(clf_model.classes_, tier_probs)
            } if tier_probs else {},
            'selected_algorithm': selected_model,
            'multi_model_comparison': model_predictions,
            'model_accuracy_context': self.evaluation_meta.get('regression_metrics', {}).get(selected_model, {}),
            'top_positive_drivers': top_drivers,
            'key_bottlenecks': key_bottlenecks,
            'all_factor_contributions': factor_contributions
        }

# Singleton instance
predictor = HealthcareOutcomePredictor()

if __name__ == '__main__':
    # Test sample district lookup and prediction
    profile = predictor.get_district_profile('Patna', 'Bihar')
    print("District Profile for Patna, Bihar:")
    print("Actual Rate:", profile['actual_institutional_births'])
    
    # Predict on Patna profile
    input_vals = {k: v['value'] for k, v in profile['indicators'].items()}
    pred_res = predictor.predict(input_vals, selected_model='Gradient Boosting')
    print(f"\nML Prediction: {pred_res['predicted_institutional_delivery_rate']}%")
    print(f"Predicted Tier: {pred_res['predicted_performance_tier']}")
    print(f"Comparison: {pred_res['multi_model_comparison']}")
    print("Top positive driver:", pred_res['top_positive_drivers'][0]['display_name'])
    print("Key bottleneck:", pred_res['key_bottlenecks'][0]['display_name'] if pred_res['key_bottlenecks'] else 'None')
