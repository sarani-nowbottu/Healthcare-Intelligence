"""
Dataset Loader & Preprocessor for NFHS-5 District Healthcare Data
AI-Powered Healthcare Policy Intelligence & Prediction System
"""

import os
import pandas as pd
import numpy as np

# Canonical feature mapping connecting raw NFHS-5 indicator descriptions to clean system variables
FEATURE_MAPPING = {
    'anc_first_trimester': {
        'raw_indicator': 'Mothers who had an antenatal checkup in the first trimester (%)',
        'display_name': 'Antenatal Checkup in 1st Trimester (%)',
        'category': 'Maternal Healthcare',
        'benchmark_target': 80.0
    },
    'anc_4_visits': {
        'raw_indicator': 'Mothers who had at least 4 antenatal care visits (%)',
        'display_name': 'At Least 4 ANC Visits (%)',
        'category': 'Maternal Healthcare',
        'benchmark_target': 75.0
    },
    'tetanus_protected': {
        'raw_indicator': 'Mothers whose last birth was protected against neonatal tetanus (%)',
        'display_name': 'Neonatal Tetanus Protection (%)',
        'category': 'Maternal Healthcare',
        'benchmark_target': 95.0
    },
    'ifa_100_days': {
        'raw_indicator': 'Mothers who consumed iron folic acid for 100 days or more when they were pregnant (%)',
        'display_name': 'IFA Consumption for 100+ Days (%)',
        'category': 'Maternal Healthcare',
        'benchmark_target': 60.0
    },
    'mcp_card': {
        'raw_indicator': 'Registered pregnancies for which the mother received a Mother and Child Protection (MCP) card (%)',
        'display_name': 'Mother & Child Protection Card Received (%)',
        'category': 'Maternal Healthcare',
        'benchmark_target': 98.0
    },
    'women_literate': {
        'raw_indicator': 'Women who are literate (%)',
        'display_name': 'Women Literacy Rate (%)',
        'category': 'Socioeconomic Profile',
        'benchmark_target': 85.0
    },
    'women_schooling_10yrs': {
        'raw_indicator': 'Women with 10 or more years of schooling (%)',
        'display_name': 'Women with 10+ Years Schooling (%)',
        'category': 'Socioeconomic Profile',
        'benchmark_target': 60.0
    },
    'early_marriage': {
        'raw_indicator': 'Women age 2024 years married before age 18 years (%)',
        'display_name': 'Underage Marriage (Age 20-24 married <18) (%)',
        'category': 'Socioeconomic Profile',
        'benchmark_target': 10.0  # lower is better
    },
    'electricity': {
        'raw_indicator': 'Population living in households with electricity (%)',
        'display_name': 'Household Electricity Access (%)',
        'category': 'Infrastructure & Living Standard',
        'benchmark_target': 99.0
    },
    'sanitation': {
        'raw_indicator': 'Population living in households that use an improved sanitation facility (%)',
        'display_name': 'Improved Sanitation Facility Access (%)',
        'category': 'Infrastructure & Living Standard',
        'benchmark_target': 90.0
    },
    'clean_fuel': {
        'raw_indicator': 'Households using clean fuel for cooking (%)',
        'display_name': 'Clean Fuel Usage for Cooking (%)',
        'category': 'Infrastructure & Living Standard',
        'benchmark_target': 80.0
    },
    'drinking_water': {
        'raw_indicator': 'Population living in households with an improved drinkingwater source (%)',
        'display_name': 'Improved Drinking Water Source (%)',
        'category': 'Infrastructure & Living Standard',
        'benchmark_target': 95.0
    },
    'health_insurance': {
        'raw_indicator': 'Households with any usual member covered under a health insurance/financing scheme (%)',
        'display_name': 'Health Insurance / Financing Coverage (%)',
        'category': 'Financial Protection',
        'benchmark_target': 60.0
    },
    'immunization_full': {
        'raw_indicator': "Children age 12-23 months fully vaccinated based on information from either vaccination card or mother's recall (%)",
        'display_name': 'Full Child Immunization (12-23 months) (%)',
        'category': 'Child Health',
        'benchmark_target': 90.0
    },
    'birth_registration': {
        'raw_indicator': 'Children under age 5 years whose birth was registered with the civil authority (%)',
        'display_name': 'Birth Registration with Civil Authority (%)',
        'category': 'Institutional Governance',
        'benchmark_target': 95.0
    }
}

TARGET_VARIABLE = 'institutional_births'
RAW_TARGET_INDICATOR = 'Institutional births (%)'

def get_data_paths():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_path = os.path.join(base_dir, 'data_storage', 'NFHS5_India_All_Districts.csv')
    processed_path = os.path.join(base_dir, 'data_storage', 'processed_district_data.csv')
    return raw_path, processed_path

def load_and_preprocess_data(force_recompute=False):
    """
    Loads raw NFHS-5 long-form data, pivots by district, maps canonical features,
    imputes missing observations with state/national medians, and exports a clean dataset.
    """
    raw_path, processed_path = get_data_paths()
    
    if os.path.exists(processed_path) and not force_recompute:
        df = pd.read_csv(processed_path)
        return df

    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"Raw NFHS-5 dataset not found at {raw_path}")

    raw_df = pd.read_csv(raw_path, low_memory=False)
    
    # Pivot to district level
    pivot = raw_df.pivot_table(
        index=['State', 'District'],
        columns='Indicator',
        values='NFHS 5',
        aggfunc='first'
    ).reset_index()

    clean_df = pd.DataFrame()
    clean_df['state'] = pivot['State'].str.strip()
    clean_df['district'] = pivot['District'].str.strip()

    # Map features
    for key, info in FEATURE_MAPPING.items():
        raw_col = info['raw_indicator']
        if raw_col in pivot.columns:
            clean_df[key] = pd.to_numeric(pivot[raw_col], errors='coerce')
        else:
            clean_df[key] = np.nan

    # Map target
    clean_df[TARGET_VARIABLE] = pd.to_numeric(pivot[RAW_TARGET_INDICATOR], errors='coerce')

    # Drop districts with completely missing target
    clean_df = clean_df.dropna(subset=[TARGET_VARIABLE]).reset_index(drop=True)

    # Median imputation grouped by State first, then National median for remaining NaNs
    feature_keys = list(FEATURE_MAPPING.keys())
    for col in feature_keys:
        clean_df[col] = clean_df.groupby('state')[col].transform(lambda x: x.fillna(x.median()))
        national_median = clean_df[col].median()
        clean_df[col] = clean_df[col].fillna(national_median)

    # Multi-class performance tier classification label
    def assign_tier(val):
        if val >= 90.0:
            return 'High'
        elif val >= 75.0:
            return 'Medium'
        return 'Low'

    clean_df['performance_tier'] = clean_df[TARGET_VARIABLE].apply(assign_tier)

    # Save processed dataframe
    clean_df.to_csv(processed_path, index=False)
    return clean_df

if __name__ == '__main__':
    df = load_and_preprocess_data(force_recompute=True)
    print(f"Processed dataset ready with {len(df)} districts and {len(df.columns)} columns.")
    print("Sample rows:")
    print(df[['state', 'district', 'anc_4_visits', 'institutional_births', 'performance_tier']].head())
