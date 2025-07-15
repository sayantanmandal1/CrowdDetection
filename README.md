# Simhastha 2028 Smart Mobility & Access Management

> **A world-class, real-time dashboard for efficient, inclusive, and responsive movement across Ujjain during Simhastha 2028.**

![Smart Mobility Dashboard Screenshot](./frontend/public/logo192.png)

## 🚀 Overview
This application enables smart layout and movement planning for pilgrims, VIPs, and the public during Simhastha 2028. It leverages real-world open data, advanced routing, and a beautiful, professional UI to deliver actionable insights and seamless navigation.

## 🌟 Features
- **Real Map & Routing:** Find optimal routes between any ghat, safe zone, or transport hub using real OpenStreetMap data.
- **Accessibility Overlay:** Instantly highlight accessible routes and facilities for Divyangjan & elderly.
- **Public Transport Layer:** Visualize bus/shuttle stops and demo routes.
- **Dynamic Alerts:** See real-time or simulated alerts (crowd, emergency, etc.) on the map.
- **VIP Route Highlight:** Toggle to show priority routes for dignitaries and emergency vehicles.
- **Floating Action Button:** Quick actions like “Find Nearest Safe Zone.”
- **Dark Mode:** Instantly switch between light and dark themes.
- **Animated UI:** Smooth route drawing, panel transitions, and micro-interactions.
- **Toast Notifications:** Beautiful, branded feedback for all actions.
- **Mobile Responsive:** Works on desktop, tablet, and mobile.

## 📸 Screenshots
> Add screenshots of the dashboard in both light and dark mode, with overlays enabled.

## 🛠️ Setup Instructions
1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd crooddet
   ```
2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Ensure osmnx, fastapi, uvicorn, etc. are installed
   uvicorn main:app --reload
   ```
3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```
4. **Open in browser:**
   - Visit [http://localhost:3000](http://localhost:3000)

## 💡 Usage
- Use the sidebar to plan routes, check alerts, and toggle overlays.
- Click the ⚡ Floating Action Button for quick actions.
- Switch between light/dark mode in the header.
- Explore the map for real-time overlays and information.

## 🏗️ Tech Stack
- **Frontend:** React, Leaflet, react-select, react-toastify, Inter font, custom CSS
- **Backend:** FastAPI, osmnx, networkx, Python
- **Data:** OpenStreetMap, simulated crowd/alert data

## 🏆 Hackathon Pitch
- **Smart Mobility & Access Management** for Simhastha 2028
- Real-time, inclusive, and actionable dashboard for city-scale event management
- Accessibility, public transport, VIP, and emergency overlays
- World-class, beautiful, and responsive UI/UX
- Ready for real-world deployment and further extension

## 👥 Contributors
- [Your Name]
- [Your Team]

---

**Good luck at the hackathon! This project is ready to win.**
