from PIL import Image
from backend.models.classifier import classifier
from backend.services.fusion_service import compute_multimodal_synthesis

img = Image.open('scratch_lesion.png')
vision_res = classifier.predict(img)

# Melanoma Test
q_melanoma = {
    'chief_complaint': 'mole_spot',
    'location': 'trunk',
    'duration': 'chronic',
    'sensations': ['itch', 'bleeding'],
    'branch_data': {
        'abcde_asymmetry': True,
        'abcde_border': True,
        'abcde_color': True,
        'abcde_diameter': True,
        'abcde_evolution': True,
        'bleeding': True
    },
    'red_flags': []
}
res = compute_multimodal_synthesis(vision_res['predictions'], q_melanoma)
print("=== MELANOMA TEST WITH MATCHING INTAKE ===")
print("Top Condition:", res['top_condition'])
print("Risk Level:", res['overall_risk'])
print("Confidence:", res['top_confidence'])
for p in res['predictions']:
    print(f"  {p['display_name']}: {p['confidence_percentage']}")
print("Safety Override Triggered:", res['safety_override_triggered'])

# Also let's test Psoriasis
print("\n=== PSORIASIS TEST WITH MATCHING INTAKE ===")
q_psoriasis = {
    'chief_complaint': 'scaly_plaque',
    'location': 'arms_hands',
    'duration': 'chronic',
    'sensations': ['itch'],
    'branch_data': {
        'extensor_elbow_knee': True
    },
    'red_flags': []
}
res_p = compute_multimodal_synthesis(vision_res['predictions'], q_psoriasis)
print("Top Condition:", res_p['top_condition'])
for p in res_p['predictions']:
    print(f"  {p['display_name']}: {p['confidence_percentage']}")

# Also let's test Fungal / Ringworm
print("\n=== RINGWORM (TINEA) TEST WITH MATCHING INTAKE ===")
q_fungal = {
    'chief_complaint': 'red_rash',
    'location': 'trunk',
    'duration': 'subacute',
    'sensations': ['itch'],
    'branch_data': {
        'annular_ring': True
    },
    'red_flags': []
}
res_f = compute_multimodal_synthesis(vision_res['predictions'], q_fungal)
print("Top Condition:", res_f['top_condition'])
for p in res_f['predictions']:
    print(f"  {p['display_name']}: {p['confidence_percentage']}")
