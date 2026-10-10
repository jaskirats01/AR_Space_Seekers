# Model status and evaluation

[Back to README](../README.md)

## Available evidence

The repository includes a YOLO `.pt` artifact and inference code. Original notes attribute the training imagery to Duality AI's Falcon platform. Dataset splits, training configuration, dataset license/source version and a recorded mAP report are absent. There is therefore no verified mAP number to publish from this repository.

The intended target equipment is fire extinguishers, toolboxes and oxygen tanks. Runtime class names should be read from the model through `/info`; the frontend contains hard-coded mappings that need validation against those names.

## Real inference and fallback paths

`api/detect.py` loads the YOLO model at startup and executes inference. `api/simple-detect.py` produces demonstration detections. `api/real-detect.py` attempts model loading/inference but can return simulated detections if a model is unavailable. The frontend processor also returns fixed mock detections after an API error, without a dedicated demo flag in the response.

For an honest model evaluation, use the real inference path, assert that the model loaded, disable mock fallback for the evaluation run and record failures rather than counting mock outputs as predictions.

## Recommended evaluation record

Record dataset provenance, held-out image counts, class distribution, training settings, dependency versions, model hash, per-class precision/recall, mAP@0.5 and mAP@0.5:0.95. Measure latency with the inference device and image size stated. Publish failure examples and separate synthetic-image performance from any real-world tests.

Unity/mobile AR integration is still an exploration. No operational or safety-critical capability is established by the web demonstration.
