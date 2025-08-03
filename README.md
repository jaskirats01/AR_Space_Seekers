
# 🛰️ AR-Assist: Real-Time Object Detection in Space Stations

**AR-Assist** is an augmented reality (AR) application built in **Unity** to help astronauts visually detect and locate critical tools and safety equipment — specifically:
- 🧯 Fire Extinguisher  
- 🧰 Toolkit  
- 🧪 Oxygen Cylinder  

This system uses a **YOLOv8 AI model trained on synthetic space station data** from Duality AI’s Falcon platform. It overlays real-time object detections in AR for efficient and accurate visual assistance inside space environments.

---

## 🚧 Project Status

🚨 The Unity-based mobile AR application is **still under development** and currently **not deployed**. However, we have included the following resources in this repository for review:

- 📸 Screenshots of the Unity AR application
- 📽️ A demo video showing the app interface and concept
- 🛰️ A 3D AR visual of a **satellite model** (used in early visualization)
- 🧠 YOLOv8 AI detection results and working code (hosted as a web app)

---

## 🌐 Web Application (AI-Only)

Since the Unity AR build is in progress, we’ve shared a **fully working AI web application repository** as a placeholder:
- Includes the **trained YOLOv8 model**
- Object detection running on real/synthetic test images
- mAP@0.5: **[Insert Score Here]**

You can find this AI implementation and sample outputs in the `/web-ai-version/` folder.

---

## 📂 Folder Overview
(All these are inside demo folder)

| Folder/File | Description |
|-------------|-------------|
| `/Unity-Screenshots/` | Screenshots from the AR Unity app (in development) |
| `/App-Demo-Video/` | Demo video showing the app interface |
| `/Satellite-AR/` | Satellite AR model used for visualization |
| `train.py`, `predict.py` | YOLOv8 training and prediction files |
| `README.md` | You’re here! |

---

## 📌 Object Classes

The model is trained to detect:
- 🔴 Fire Extinguisher
- 🟢 Oxygen Cylinder
- 🔧 Toolkit

---

## 🧠 AI Model Details

- Architecture: YOLOv8  
- Trained on: Falcon synthetic space station data  
- Evaluation: mAP@0.5 = **[Insert Value]**  
- Deployment: Web interface (in `/web-ai-version/`)

---

## ✨ Coming Soon

- Full mobile AR deployment
- Live camera detection in Unity with Flask backend
- Cross-platform build (Android + iOS)
- Model update via Falcon API integration

---

## 🙌 Contributors

Made by **Team ARSpaceSeekers**  
Leader: *Akash Jha*  
BuildWithDelhi 2.0 Hackathon

---

> 🚀 Stay tuned for updates! This is a work-in-progress aimed at merging AI and AR for real-time astronaut assistance in space stations.
