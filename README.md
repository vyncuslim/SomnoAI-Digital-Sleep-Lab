
# SomnoAI Digital Sleep Lab 🌙

**SomnoAI Digital Sleep Lab** integrates physiological indicator monitoring, AI deep insights, and health advice to provide users with a comprehensive digital sleep lab experience.

**SomnoAI 将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。**

---

## 🚀 Core Architecture

- **Neural Synthesis Engine**: Advanced multi-modal analysis of sleep architecture powered by Google Gemini models.
- **Biometric Telemetry**: Real-time visualization of neurological recovery, heart rate stability, and metabolic load using Recharts.
- **Secure Edge Processing**: Zero-backend storage policy. All physiological data is processed in-browser and purged immediately upon session termination.
- **Dual-Channel Audit**: Real-time security telemetry mirrored to both Telegram and SMTP (Email) gateways for administrative oversight.
- **Native Health Bridge**: Seamless synchronization via the `window.HealthBridge` protocol for Android Health Connect.

## 🌍 Internationalization

The laboratory terminal is fully localized for global accessibility:
- 🇺🇸 **English** (Primary Research Protocol)
- 🇨🇳 **Chinese** (Simplified - UI Language Support)
- 🇪🇸 **Spanish** (Castilian - UI Language Support)

## 🔒 Security & Compliance

SomnoAI adheres to strict data minimization principles:
- **Google API Disclosure**: Complies with the Google API Services User Data Policy, specifically the "Limited Use" requirements for health data.
- **Privacy by Design**: No persistent cloud storage for biometric metrics. Transient logs reside exclusively in the client's `sessionStorage`.
- **Encrypted Handshake**: All administrative actions and exceptions are cryptographically logged via Supabase.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Intelligence**: Google Gemini AI (Neural Core)
- **Infrastructure**: Supabase (Auth, Audit Logs, Registry)
- **Gateways**: Telegram Bot API, SMTP Bridge

---

**Developer**: [contact@sleepsomno.com](mailto:contact@sleepsomno.com)  
**Domain**: [https://sleepsomno.com](https://sleepsomno.com)
