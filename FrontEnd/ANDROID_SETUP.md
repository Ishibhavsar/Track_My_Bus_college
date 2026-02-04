# Track My Bus - Android App Setup Guide

## Overview
The Android app is built using Capacitor from the existing React frontend.

---

## Project Structure
```
FrontEnd/
├── src/                    # React source code
├── dist/                   # Built web assets (for Capacitor)
├── android/                # Native Android project
│   └── app/
│       └── src/main/
│           ├── AndroidManifest.xml
│           └── res/xml/network_security_config.xml
├── capacitor.config.json   # Capacitor configuration
└── package.json
```

---

## 🔧 Development Setup

### Prerequisites
1. **Node.js** (v18+)
2. **Android Studio** (with SDK 33+)
3. **Java JDK 17** (bundled with Android Studio)

---

## 🏠 Connecting to Backend - LOCAL Development

### Option 1: Android Emulator
The Android emulator uses `10.0.2.2` to access the host machine's localhost.

**Step 1:** Create/update `.env` file in FrontEnd:
```env
VITE_API_URL=http://10.0.2.2:5000/api
```

**Step 2:** Start your backend:
```bash
cd BackEnd
npm run dev
```

**Step 3:** Build and run Android app:
```bash
cd FrontEnd
npm run build
npx cap sync
npx cap open android
```

**Step 4:** In Android Studio, run the app on an emulator.

---

### Option 2: Physical Android Device (Same WiFi)
Use your computer's local IP address.

**Step 1:** Find your computer's IP address:
```bash
# Windows
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

**Step 2:** Update `.env` file in FrontEnd:
```env
VITE_API_URL=http://192.168.1.100:5000/api
```

**Step 3:** Make sure backend is accessible on all interfaces:
```javascript
// In BackEnd/src/index.js
app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
```

**Step 4:** Build and run:
```bash
cd FrontEnd
npm run build
npx cap sync
npx cap open android
```

**Step 5:** In Android Studio, connect your phone via USB and run.

---

## 🌐 Connecting to Backend - PRODUCTION (Deployed)

### Step 1: Deploy Backend
Deploy your backend to a cloud service like:
- **Render.com** (Free tier available)
- **Railway.app**
- **Heroku**

Example deployed URL: `https://track-my-bus-api.onrender.com`

### Step 2: Update Frontend Environment
Create `.env.production` in FrontEnd:
```env
VITE_API_URL=https://track-my-bus-api.onrender.com/api
```

### Step 3: Build for Production
```bash
cd FrontEnd
npm run build
npx cap sync
```

### Step 4: Generate APK
In Android Studio:
1. Go to **Build > Generate Signed Bundle / APK**
2. Choose **APK**
3. Create or use existing keystore
4. Select **release** build variant
5. Click **Create**

---

## 📱 Quick Commands Reference

```bash
# Build web app
npm run build

# Sync web assets to Android
npx cap sync

# Open Android Studio
npx cap open android
```

---

## 🔐 Environment Variables Summary

| Environment | VITE_API_URL Value |
|-------------|-------------------|
| Web Dev (localhost) | `http://localhost:5000/api` |
| Android Emulator | `http://10.0.2.2:5000/api` |
| Physical Device (WiFi) | `http://YOUR_IP:5000/api` |
| Production | `https://your-api-domain.com/api` |

---

## 🐛 Troubleshooting

### "Network Error" or "Connection Refused"
1. Ensure backend is running
2. For emulator: Use `10.0.2.2` instead of `localhost`
3. For physical device: Use your computer's IP address
4. Check Windows Firewall allows port 5000

### Changes not appearing
Always run after code changes:
```bash
npm run build
npx cap sync
```
