import sys
import json
import pandas as pd
import numpy as np

# Vérification arguments
if len(sys.argv) < 3:
    print("Arguments manquants")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

# Charger données
with open(input_file, 'r') as f:
    data = json.load(f)

df = pd.DataFrame(data)

# Normaliser colonnes
df.columns = [col.lower() for col in df.columns]

if 'date_revenu' not in df.columns:
    print("Colonnes reçues:", df.columns)
    sys.exit(1)

# Conversion
df['date_revenu'] = pd.to_datetime(df['date_revenu'])
df['revenu'] = df['revenu'].astype(float)

# Calcul slope
results = []

for keyword, group in df.groupby('keyword'):
    group = group.sort_values('date_revenu')

    if len(group) < 5:
        continue

    x = np.arange(len(group))
    y = group['revenu'].values

    slope = np.polyfit(x, y, 1)[0]

    trend = "stable"
    if slope > 0:
        trend = "croissance"
    elif slope < 0:
        trend = "baisse"

    results.append({
        "keyword": keyword,
        "slope": float(slope),
        "trend": trend
    })

# Top 5
top = sorted(results, key=lambda x: x['slope'], reverse=True)[:5]

# Sauvegarde
with open(output_file, 'w') as f:
    json.dump(top, f)