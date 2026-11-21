"""
Model Training & Evaluation Pipeline
AI-Powered Healthcare Policy Intelligence & Prediction System

Trains, benchmarks, and saves:
1. Decision Tree Regressor
2. Random Forest Regressor
3. K-Nearest Neighbors Regressor
4. Gradient Boosting Regressor
Plus Classification Extension: Regional Healthcare Performance Tier
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestRegressor, GradientBoostingRegressor,
    RandomForestClassifier, GradientBoostingClassifier
)
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)

from dataset_loader import load_and_preprocess_data, FEATURE_MAPPING, TARGET_VARIABLE

def train_and_evaluate_all():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    storage_dir = os.path.join(base_dir, 'models_storage')
    os.makedirs(storage_dir, exist_ok=True)

    df = load_and_preprocess_data()
    feature_cols = list(FEATURE_MAPPING.keys())

    X = df[feature_cols]
    y = df[TARGET_VARIABLE]

    # Reproducible 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Feature scaling (needed for KNN, beneficial for gradient methods)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. Define Regression Models
    reg_models = {
        'Decision Tree': DecisionTreeRegressor(max_depth=6, min_samples_leaf=3, random_state=42),
        'Random Forest': RandomForestRegressor(n_estimators=120, max_depth=8, min_samples_leaf=2, random_state=42),
        'K-Nearest Neighbors': KNeighborsRegressor(n_neighbors=5, weights='distance'),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=120, learning_rate=0.08, max_depth=4, subsample=0.9, random_state=42)
    }

    reg_metrics = {}
    fitted_reg_models = {}
    actual_vs_predicted = {}
    residuals_data = {}
    test_indices = y_test.index.tolist()
    district_names = df.loc[test_indices, 'district'].tolist()
    state_names = df.loc[test_indices, 'state'].tolist()

    best_reg_name = None
    best_reg_r2 = -float('inf')

    for name, model in reg_models.items():
        if name == 'K-Nearest Neighbors':
            model.fit(X_train_scaled, y_train)
            preds = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_train)
            preds = model.predict(X_test)

        mae = mean_absolute_error(y_test, preds)
        mse = mean_squared_error(y_test, preds)
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, preds))

        reg_metrics[name] = {
            'MAE': round(float(mae), 3),
            'MSE': round(float(mse), 3),
            'RMSE': round(rmse, 3),
            'R2': round(r2, 4)
        }

        # Save actual vs predicted for frontend visualization
        actual_vs_predicted[name] = [
            {
                'district': district_names[i],
                'state': state_names[i],
                'actual': round(float(y_test.iloc[i]), 2),
                'predicted': round(float(preds[i]), 2),
                'residual': round(float(y_test.iloc[i] - preds[i]), 2)
            }
            for i in range(len(preds))
        ]

        residuals_data[name] = [round(float(y_test.iloc[i] - preds[i]), 2) for i in range(len(preds))]
        fitted_reg_models[name] = model

        if r2 > best_reg_r2:
            best_reg_r2 = r2
            best_reg_name = name

    # Feature Importance analysis from Best Model (Gradient Boosting) & Random Forest
    gb_model = fitted_reg_models['Gradient Boosting']
    rf_model = fitted_reg_models['Random Forest']

    feature_importance_list = []
    for col, imp_gb, imp_rf in zip(feature_cols, gb_model.feature_importances_, rf_model.feature_importances_):
        feature_importance_list.append({
            'feature_key': col,
            'feature_name': FEATURE_MAPPING[col]['display_name'],
            'category': FEATURE_MAPPING[col]['category'],
            'gradient_boosting_importance': round(float(imp_gb), 4),
            'random_forest_importance': round(float(imp_rf), 4),
            'importance_score': round(float((imp_gb + imp_rf) / 2.0), 4)
        })

    feature_importance_list.sort(key=lambda x: x['importance_score'], reverse=True)

    # 2. Classification Extension (Performance Tiers: High, Medium, Low)
    y_clf = df['performance_tier']
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
        X, y_clf, test_size=0.2, random_state=42, stratify=y_clf
    )
    clf_scaler = StandardScaler()
    X_train_c_scaled = clf_scaler.fit_transform(X_train_c)
    X_test_c_scaled = clf_scaler.transform(X_test_c)

    clf_models = {
        'Decision Tree': DecisionTreeClassifier(max_depth=5, min_samples_leaf=3, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
        'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=5, weights='distance'),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=3, random_state=42)
    }

    tier_labels = ['Low', 'Medium', 'High']
    clf_metrics = {}
    best_clf_name = None
    best_clf_f1 = -1
    fitted_clf_models = {}

    for name, model in clf_models.items():
        if name == 'K-Nearest Neighbors':
            model.fit(X_train_c_scaled, y_train_c)
            preds_c = model.predict(X_test_c_scaled)
        else:
            model.fit(X_train_c, y_train_c)
            preds_c = model.predict(X_test_c)

        acc = accuracy_score(y_test_c, preds_c)
        prec = precision_score(y_test_c, preds_c, average='weighted', zero_division=0)
        rec = recall_score(y_test_c, preds_c, average='weighted', zero_division=0)
        f1 = f1_score(y_test_c, preds_c, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test_c, preds_c, labels=tier_labels)

        clf_metrics[name] = {
            'Accuracy': round(float(acc), 4),
            'Precision': round(float(prec), 4),
            'Recall': round(float(rec), 4),
            'F1_Score': round(float(f1), 4),
            'ConfusionMatrix': cm.tolist(),
            'Labels': tier_labels
        }
        fitted_clf_models[name] = model

        if f1 > best_clf_f1:
            best_clf_f1 = f1
            best_clf_name = name

    # 3. Persist Models and Scalers via Joblib
    joblib.dump(scaler, os.path.join(storage_dir, 'scaler.joblib'))
    joblib.dump(clf_scaler, os.path.join(storage_dir, 'classifier_scaler.joblib'))

    for name, model in fitted_reg_models.items():
        fname = name.lower().replace(' ', '_').replace('-', '_') + '_regressor.joblib'
        joblib.dump(model, os.path.join(storage_dir, fname))

    for name, model in fitted_clf_models.items():
        fname = name.lower().replace(' ', '_').replace('-', '_') + '_classifier.joblib'
        joblib.dump(model, os.path.join(storage_dir, fname))

    # Save Best Regressor and Classifier references
    joblib.dump(fitted_reg_models[best_reg_name], os.path.join(storage_dir, 'best_regressor.joblib'))
    joblib.dump(fitted_clf_models[best_clf_name], os.path.join(storage_dir, 'best_classifier.joblib'))

    # 4. Save Comprehensive Benchmark Report
    report = {
        'best_regression_model': best_reg_name,
        'best_classification_model': best_clf_name,
        'dataset_summary': {
            'total_districts': len(df),
            'features_count': len(feature_cols),
            'target_variable': TARGET_VARIABLE,
            'train_samples': len(X_train),
            'test_samples': len(X_test),
            'target_mean': round(float(y.mean()), 2),
            'target_std': round(float(y.std()), 2),
            'target_median': round(float(y.median()), 2)
        },
        'regression_metrics': reg_metrics,
        'classification_metrics': clf_metrics,
        'feature_importance': feature_importance_list,
        'sample_actual_vs_predicted': actual_vs_predicted[best_reg_name][:30],
        'all_actual_vs_predicted': {m: actual_vs_predicted[m][:50] for m in reg_models.keys()}
    }

    report_path = os.path.join(storage_dir, 'models_evaluation.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    feat_path = os.path.join(storage_dir, 'feature_importance.json')
    with open(feat_path, 'w', encoding='utf-8') as f:
        json.dump(feature_importance_list, f, indent=2)

    print(f"Model training complete!")
    print(f"Best Regressor: {best_reg_name} (R2={reg_metrics[best_reg_name]['R2']}, MAE={reg_metrics[best_reg_name]['MAE']}%)")
    print(f"Best Classifier: {best_clf_name} (F1={clf_metrics[best_clf_name]['F1_Score']}, Acc={clf_metrics[best_clf_name]['Accuracy']})")
    print(f"Artifacts saved to {storage_dir}")
    return report

if __name__ == '__main__':
    train_and_evaluate_all()
