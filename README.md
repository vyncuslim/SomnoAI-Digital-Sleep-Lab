
# Somno Digital Sleep Lab 🌙

**Somno** is a high-fidelity digital laboratory designed for biometric monitoring, AI-driven sleep insights, and physiological projections. By integrating with Google Fit and utilizing advanced neural synthesis models, Somno provides users with a comprehensive overview of their sleep architecture and metabolic recovery.

## 🚀 Key Features

- **Neural Sleep Synthesis**: Advanced analysis of sleep stages (Deep, REM, Light) using Google Gemini AI.
- **Biometric Dashboards**: Real-time visualization of sleep scores, heart rate variability, and energy expenditure.
- **Privacy-First Architecture**: Zero backend storage. All data is processed locally within the browser session and cleared immediately upon logout.
- **Manual Injection Terminal**: Simulate physiological scenarios via the Lab Signal Override protocol to predict metabolic outcomes.
- **Trend Atlas**: Multi-dimensional historical analysis mapping your sleep evolution over time.

## 🔍 Verification & OAuth Details

For Google API Verification purposes:
- **Project ID**: `somno-lab-neural`
- **Client ID**: `1083641396596-7vqbum157qd03asbmare5gmrmlr020go.apps.googleusercontent.com`
- **Authorized Scopes**:
  - `fitness.sleep.read`: For analyzing physiological sleep cycles.
  - `fitness.heart_rate.read`: For calculating resting heart rate and recovery.
  - `fitness.activity.read`: For correlating caloric expenditure with sleep efficiency.
- **Verification Contact**: [ongyuze1401@gmail.com](mailto:ongyuze1401@gmail.com)

## 🛠 Tech Stack

- **React 18**: Modern UI framework for high-performance reactive interfaces.
- **Google Gemini API**: Powering the Chief Research Officer persona and deep data insights.
- **Framer Motion**: Delivering smooth, high-end laboratory aesthetics and transitions.
- **Tailwind CSS**: Utility-first styling for a sleek, glass-morphism dark mode UI.
- **Recharts**: Data visualization for complex biometric streams.

## 🔒 Security & Privacy

Somno adheres to the "Data Minimization" principle. Information received from Google APIs is processed exclusively in the frontend context. 
- **Google API Limited Use Disclosure**: Use of data follows the Google API Service User Data Policy, ensuring health information is never used for advertising or profiling.
- **Session-Level Encryption**: All transient data resides in `sessionStorage` and is purged on tab closure.

## 📦 GitHub Synchronization

To synchronize this project with your GitHub repository, use the following commands:

```bash
# Configuration
git config --global user.name "vyncuslim"
git config --global user.email "ongyuze1401@gmail.com"

# Initialization
git init
git remote add origin https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab

# Synchronization
git add .
git commit -m "feat: Initial sync to GitHub with Lab Engine v3"
git push -u origin main
```

---

**Developer**: [ongyuze1401@gmail.com](mailto:ongyuze1401@gmail.com)  
**Domain**: [https://sleepsomno.com](https://sleepsomno.com)  
**GitHub**: [vyncuslim/SomnoAI-Digital-Sleep-Lab](https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab)
**License**: MIT
