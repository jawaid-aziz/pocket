# Pocket - A Wallet Payment System with IoT SoundBox

A closed-loop digital wallet system integrated with an IoT-based SoundBox that delivers real-time audio payment notifications to merchants. Built as a Final Year Project at COMSATS University Islamabad, Abbottabad Campus.

---

## 📌 Project Overview

When a customer makes a payment through the mobile wallet app, the backend processes and verifies the transaction, then instantly pushes a notification to the merchant's IoT SoundBox via MQTT. The SoundBox announces the payment amount aloud (e.g. *"Rs. 500 received"*), giving merchants immediate, hands-free confirmation — no SMS, no manual app checking.

---

## 👥 Team

| Name | Registration | Role |
|---|---|---|
| Jawaid Aziz | CIIT/SP23-BCS-043/ATD | Authentication, Transactions, MQTT Layer, Payload Verification |
| Noman Mazari | CIIT/SP23-BCS-015/ATD | Stripe Integration, ESP32 Firmware, Network Connectivity, Testing |
| Sania Zehra | CIIT/SP23-BCS-077/ATD | UI/UX, Frontend Development, Account Management, Audio Playback, Documentation |

**Supervisor:** Bushra Mushtaq
**Degree:** BS Computer Science (2023–2027)
**Institution:** COMSATS University Islamabad, Abbottabad Campus

---

## 🛠 Tech Stack

### Mobile App
| Technology | Purpose |
|---|---|
| React Native (Expo) | Cross-platform mobile app (Android & iOS) |
| NativeWind | Tailwind CSS utility classes for React Native |
| TanStack Query | API data fetching, caching, and synchronization |
| Zustand | Lightweight global state management |
| Expo Secure Store | Secure JWT token storage on device |
| Stripe React Native SDK | Payment intent initiation |
| MQTT.js | Real-time push notifications to merchant app |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| ExpressJS | Scalable backend framework (modules, controllers, services) |
| Stripe Node.js SDK | Payment authorization and webhook verification |
| MQTT.js | Publishing payment events to the MQTT broker |
| JWT (jsonwebtoken) | Authentication token generation and verification |
| Argon2 | Password hashing |
| Helmet | HTTP security headers |
| Morgan | Request logging |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL | Primary relational database |
| Prisma ORM | Database schema, migrations, and queries |

### IoT (ESP32 SoundBox)
| Technology | Purpose |
|---|---|
| Arduino Framework | ESP32 firmware development |
| PubSubClient | MQTT client for ESP32 |
| ArduinoJson | JSON payload parsing |
| ESP32-audioI2S | Audio file playback via I2S DAC |
| SD Library | Reading audio files from MicroSD card |
| TinyGSM | SIM800L cellular connectivity |
| HTTPUpdate | OTA firmware updates |
| WiFiClientSecure | TLS-secured Wi-Fi connections |

### Infrastructure & Dev Tools
| Tool | Purpose |
|---|---|
| Mosquitto | Self-hosted MQTT broker |
| ngrok | Expose localhost to Stripe webhooks during development |
| Postman | API testing and webhook simulation |
| PlatformIO | ESP32 firmware IDE (VS Code extension) |
| GitHub | Version control and collaboration |
| Figma | UI/UX mockup and design |

---

## 🏗 System Architecture

```
┌─────────────────────┐
│   Mobile Wallet App  │  ← React Native Expo
│  (Customer / Merchant)│
└────────┬────────────┘
         │ HTTPS (REST API)
         ▼
┌─────────────────────┐
│    NestJS Backend    │  ← Node.js + NestJS
│   (Transaction Engine)│
└──┬──────────────────┘
   │              │
   │ Stripe API   │ MQTT Publish
   ▼              ▼
┌──────────┐  ┌───────────────┐
│  Stripe  │  │ MQTT Broker   │  ← Mosquitto
│ Sandbox  │  │ (Mosquitto)   │
└──────────┘  └───────┬───────┘
  Webhook ──►         │ Subscribe
  callback            ▼
             ┌─────────────────┐
             │   ESP32 Device   │  ← IoT SoundBox
             │  (SoundBox FW)   │
             └────────┬────────┘
                      │
                      ▼
             🔊 "Rs. 500 received"
```

---

## 📄 License

This project is developed for academic purposes as part of the Final Year Project program at COMSATS University Islamabad, Abbottabad Campus. Not licensed for commercial use without permission.

---

> **COMSATS University Islamabad, Abbottabad Campus — BS Computer Science 2023–2027**
