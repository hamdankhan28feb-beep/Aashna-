# ML Pipeline

Trains the A-Z hand sign CNN and exports it to TensorFlow.js for the browser.

## Setup
```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 1. Add your dataset
Put the Kaggle ASL Alphabet dataset here:
```
ml/data/raw/
├── A/  (images of letter A)
├── B/
├── ...
└── Z/
```
If your download is a single zip, unzip it directly into `ml/data/raw/` so each letter has its own subfolder.

## 2. Preprocess
```bash
python scripts/preprocess.py
```
Resizes images to 64x64, normalizes, and writes train/test splits (as `.npy` arrays) to `ml/data/processed/`.

## 3. Train
```bash
python scripts/train.py
```
Trains the CNN defined in the Architecture doc (Conv2D x3 → Dense → Softmax(26)). Saves the best checkpoint to `ml/models/asl_model.keras`.

## 4. Convert to TensorFlow.js
```bash
python scripts/convert_to_tfjs.py
```
Outputs `model.json` + weight shards to `frontend/public/models/asl_model/`, ready for the frontend to load directly.

## Notes
- Target: ≥95% test accuracy, <15MB TF.js model size, <100ms inference (per PRD/Architecture NFRs).
- If you have a GPU, TensorFlow will use it automatically — training on CPU works but is slower.
