# Setup, API and troubleshooting

[Back to README](../README.md)

## Environment

Node.js 20+ and Python 3.10/3.11 are reasonable starting points for the existing dependencies, not a recorded compatibility matrix. Install with `npm ci` and `python -m pip install -r requirements.txt`. Keep the model at `public/models/best.pt` and run the backend from the repository root; the path is relative to the working directory.

Copy `.env.example` to `.env.local` to customize `PYTHON_API_URL`. It is read by the Next.js server route and defaults to `http://localhost:8000`. Restart Next.js after changing it. The existing `start.sh`/`start.bat` launchers start both applications after dependencies are installed; separate terminals make failures easier to inspect.

## API surface

| Server | Route | Purpose |
|---|---|---|
| Python | GET `/health` | Includes whether the model loaded |
| Python | GET `/info` | Model metadata and class labels |
| Python | POST `/detect` | Receives an image and returns detections |
| Next.js | GET `/api/detect` | Proxies Python health |
| Next.js | POST `/api/detect` | Proxies detection requests |

`POST /detect` expects JSON with `image` (base64 image bytes without a data-URL prefix), `filename` and `file_size`. Results include class IDs, confidence, bounding boxes and an annotated image. Use Python's `/docs` for the request schema.

The helper functions requesting `/api/detect/health` and `/api/detect/info` do not correspond to separate checked-in Next.js routes. Use the routes in the table for manual checks.

## Diagnostics

`test-setup.py` and `test-image-output.py` are manual diagnostic scripts. Inspect their assumptions and run them with the local service available. They are not a CI-backed accuracy benchmark.

| Symptom | Check |
|---|---|
| Model load fails | Working directory, model file and torch/Ultralytics compatibility |
| Proxy returns 500/503 | Python server, port and `PYTHON_API_URL` |
| Identical boxes across unrelated images | Whether a fallback/simulation path was used |
| Labels appear wrong | Compare the frontend mapping with `/info` and model class names |
| Build succeeds despite errors | `next.config.mjs` currently ignores ESLint and TypeScript build errors |

Run `npx tsc --noEmit` separately to inspect type errors. Do not treat a successful build as evidence that type checking passed while the ignore flags are enabled.
