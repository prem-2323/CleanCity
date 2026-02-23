# CleanCity - Manual Run Guide

This project has:
- Frontend: Expo (React Native / Web)
- Backend: Node + Express (`server/index.ts`)
- AI Models: Python scripts in `ai-models/scripts`

## Prerequisites

- Node.js 20+
- Python 3.10+
- npm
- A MongoDB connection string (`DATABASE_URL`)

## 1) Install Node dependencies

From project root:

```powershell
npm install
```

## 2) Setup Python AI environment

From project root:

```powershell
python -m venv .venv-models
.\.venv-models\Scripts\Activate.ps1
pip install -r ai-models/requirements.txt
```

Quick AI check:

```powershell
.\.venv-models\Scripts\python -c "from ultralytics import YOLO; YOLO('ai-models/weights/yolov8n.pt'); print('AI model ready')"
```

## 3) Run backend (Terminal 1)

From project root:

```powershell
$env:DATABASE_URL="<your-mongodb-connection-string>"
$env:PORT="5000"
$env:MODEL_PYTHON_PATH=(Resolve-Path ".venv-models\Scripts\python.exe").Path
npx tsx server/index.ts
```

Expected log:
- `Connected to MongoDB successfully`
- `express server serving on port 5000`

## 4) Run frontend web (Terminal 2)

From project root:

```powershell
$env:EXPO_PUBLIC_API_URL="http://localhost:5000"
npx expo start --web --port 8081
```

Open in browser:
- `http://localhost:8081`

## 5) (Optional) Run mobile instead of web

```powershell
$env:EXPO_PUBLIC_API_URL="http://localhost:5000"
npx expo start
```

Then press:
- `a` for Android
- `i` for iOS (macOS only)

## Notes

- AI routes are served by backend:
  - `POST /api/ai/analyze`
  - `POST /api/ai/verify-cleanup`
- The Python process is called by backend automatically using `MODEL_PYTHON_PATH`.
- If web shows stale errors, restart with cache clear:

```powershell
npx expo start --web --clear
```




Terminal 1: Frontend Web
npm run start

Terminal 2: Backend
npx tsx --env-file=.env server/index.ts