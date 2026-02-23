# AI Models Setup

Installed runtime for:
- YOLOv8 (`ultralytics`)
- MobileNetV2 (`torchvision`)
- Siamese model support (`torch` + custom model code)

## Environment
- Virtual environment: `.venv-models`
- Requirements: `ai-models/requirements.txt`
- YOLO weights: `ai-models/weights/yolov8n.pt`

## Activate
PowerShell:

```powershell
.\.venv-models\Scripts\Activate.ps1
```

## Quick verify

```powershell
.\.venv-models\Scripts\python -c "from ultralytics import YOLO; from torchvision.models import mobilenet_v2; import torch; y=YOLO('ai-models/weights/yolov8n.pt'); m=mobilenet_v2(weights='DEFAULT'); print(len(y.names), sum(p.numel() for p in m.parameters()), torch.__version__)"
```

## Notes
- `yolov8n.pt` and MobileNet pretrained weights are downloaded and ready.
- Siamese does not have a single standard pretrained checkpoint; you can plug in your trained checkpoint once available.

## Connected API routes
- `POST /api/ai/analyze`
- `POST /api/ai/verify-cleanup`

These routes are wired in the Node backend and execute:
- `ai-models/scripts/analyze_image.py`
- `ai-models/scripts/verify_cleanup.py`

## App runtime variable
Set `EXPO_PUBLIC_API_URL` for Expo app clients to call backend model APIs.

Example:

```powershell
$env:EXPO_PUBLIC_API_URL='http://localhost:5000'
```

<!-- T1: Backend server with AI routes -->

npx expo start --web --port 8081

<!-- T2      -->

Set-Location "C:\Users\premk\OneDrive\Desktop\2\CleanCity"
.\.venv-models\Scripts\Activate.ps1
$env:DATABASE_URL = ((Get-Content .env) | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1).Substring(13)
$env:PORT="5000"
$env:MODEL_PYTHON_PATH=(Resolve-Path ".\.venv-models\Scripts\python.exe").Path
npx tsx .\server\index.ts