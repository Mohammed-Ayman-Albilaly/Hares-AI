# Hares AI

Hares AI is a Chrome browser extension that intercepts user prompts before they reach ChatGPT, Gemini, or Claude — scanning them locally on-device for sensitive data (National IDs, IBANs, passwords, API keys, and more) and blocking or warning the user based on the risk level detected. No raw sensitive data ever leaves the device. For ambiguous cases, only masked text is sent to the Gemini API as a secondary classifier. All activity is anonymously logged to a Firebase backend and accessible via a role-based web dashboard for System Admins and Department Admins.

# -----------------------------------------------------------------------

<div align="center">
  <img src="Hares AI Front-End/assets/hares-logo.jpeg" width="90" height="90" alt="Hares AI"/>

# Hares AI

**Real-Time AI Prompt Data Loss Prevention**

_Intercept. Detect. Protect — before it's too late._

![](https://img.shields.io/badge/Status-In%20Development-blue?style=flat-square)
![](https://img.shields.io/badge/Platform-Chrome%20Extension-orange?style=flat-square&logo=googlechrome)
![](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![](https://img.shields.io/badge/AI-Gemini%20API-4285F4?style=flat-square&logo=google&logoColor=white)
![](https://img.shields.io/badge/KSU-SWE%20496-1a7f37?style=flat-square)

</div>

---

## What Is Hares AI?

Hares AI is a **Chrome browser extension** paired with a **web-based admin dashboard** that silently intercepts user prompts before they reach AI platforms like **ChatGPT**, **Gemini**, and **Claude** — scanning for sensitive data locally on the device, classifying the risk level, and acting in real time. No raw sensitive data ever leaves the device.

---

## The Problem

Every day, employees unknowingly paste **national IDs**, **IBANs**, **passwords**, **API keys**, and **confidential business data** into AI platforms. Existing security tools watch the network and respond after the fact. **Hares AI acts at the source — before the prompt is submitted.**

---

## How It Works

```
User types a prompt
        │
        ▼
┌──────────────────────────┐
│  Local Regex Detection   │  ← on-device, < 200ms
└──────────────────────────┘
        │
   ┌────┴────┐
 CLEAR   INCONCLUSIVE
   │         │
   │         ▼
   │   Mask sensitive content
   │   → Send masked text to Gemini API  ← < 500ms total
   │         │
   └────┬────┘
        ▼
  🔴 HIGH    → Block + Alert
  🟡 MEDIUM  → Warn + User decides
  🔵 LOW     → Info banner (non-blocking)
  🟢 NONE    → Allow silently
        │
        ▼
  Log anonymized metadata → Firebase
```

---

## Key Features

|     | Feature                    | Description                                              |
| --- | -------------------------- | -------------------------------------------------------- |
| 🛡️  | **Real-Time Interception** | Captures prompts before they reach any AI platform       |
| 🔍  | **Local-First Detection**  | Regex patterns run entirely on-device, no cloud needed   |
| 🤖  | **AI Fallback**            | Gemini API classifies ambiguous cases (masked text only) |
| 📊  | **Risk Classification**    | High / Medium / Low / None with automatic enforcement    |
| ✏️  | **Prompt Revision**        | AI-generated safe rewrite of any blocked prompt          |
| 📋  | **Audit Logs**             | Anonymized activity logs per user, department, and org   |
| 👥  | **Role-Based Dashboard**   | Normal User · Department Admin · System Admin            |
| ⚙️  | **Configurable Rules**     | Admins can add, edit, and disable detection patterns     |

---

## Risk Levels

| Level         | Examples                                                       | Action                     |
| ------------- | -------------------------------------------------------------- | -------------------------- |
| 🔴 **HIGH**   | National ID, IBAN, Passport, API Key, Password, Credit Card    | Blocked — no override      |
| 🟡 **MEDIUM** | Internal financial data, Employee records, Contract references | Warning — user decides     |
| 🔵 **LOW**    | Internal endpoints, Codenames, Generic internal references     | Info banner — non-blocking |
| 🟢 **NONE**   | No sensitive data detected                                     | Allowed silently           |

---

## Supported Platforms

| Platform          | Status       |
| ----------------- | ------------ |
| ChatGPT           | ✅ Supported |
| Google Gemini     | ✅ Supported |
| Claude            | ✅ Supported |
| Microsoft Copilot | 🔜 Planned   |
| Perplexity        | 🔜 Planned   |

---

## System Architecture

```
┌────────────────────────────────────────────────┐
│             PRESENTATION LAYER                  │
│    Chrome Extension UI  ·  React Dashboard      │
└───────────────────────┬────────────────────────┘
                        │
┌───────────────────────▼────────────────────────┐
│            BUSINESS LOGIC LAYER                 │
│  Content Script · Background Worker · Services  │
└───────────────────────┬────────────────────────┘
                        │
┌───────────────────────▼────────────────────────┐
│              DATA ACCESS LAYER                  │
│         Firebase SDK  ·  Chrome Storage API     │
└───────────────────────┬────────────────────────┘
                        │
┌───────────────────────▼────────────────────────┐
│                 DATA LAYER                      │
│      Firestore Database · Chrome Local Storage  │
└────────────────────────────────────────────────┘
```

---

## Privacy & Security

> **No raw sensitive data is ever stored or transmitted.**

- ✅ Primary detection runs **locally on-device**
- ✅ Only **masked text** is sent to Gemini API when needed
- ✅ Logs store **anonymized metadata only** — no prompt content
- ✅ Gemini API operates under the **Google Cloud Data Processing Addendum**
- ✅ HTTPS-only · RBAC · bcrypt password hashing

---

## Tech Stack

| Layer              | Technology                                                    |
| ------------------ | ------------------------------------------------------------- |
| Browser Extension  | Chrome Manifest V3, Content Script, Background Service Worker |
| Frontend Dashboard | React (JSX)                                                   |
| Authentication     | Firebase Auth                                                 |
| Database           | Firebase Firestore                                            |
| AI Detection       | Regex Engine + Gemini API                                     |
| Local Storage      | Chrome Storage API                                            |

---

## Performance

| Metric                | Target        |
| --------------------- | ------------- |
| Local Regex Detection | ≤ 200ms       |
| Gemini API Fallback   | ≤ 500ms total |
| Extension RAM         | ≤ 100MB       |
| Dashboard Load        | ≤ 3 seconds   |
| Detection Accuracy    | ≥ 90%         |
| False Positive Rate   | ≤ 10%         |

---

## Project Status

> GP1 (Analysis & Design) ✅ Complete · GP2 (Implementation) 🔨 In Progress

| Deliverable                         | Status |
| ----------------------------------- | ------ |
| Requirements (43 FRs + NFRs)        | ✅     |
| Use Case Diagrams                   | ✅     |
| Analysis & Design Class Diagrams    | ✅     |
| Interaction Diagrams (6 UCs)        | ✅     |
| System Architecture                 | ✅     |
| UI Mockups (23 screens)             | ✅     |
| Database Schema + ERD               | ✅     |
| Algorithm Pseudocode (8 algorithms) | ✅     |
| Test Scenarios (18 test cases)      | ✅     |
| Chrome Extension Implementation     | 🔨 GP2 |
| Admin Dashboard Implementation      | 🔨 GP2 |
| Firebase Integration                | 🔨 GP2 |

---

## Team

<div align="center">

| #   | Name              | ID        |
| --- | ----------------- | --------- |
| 1   | Moath Alonayq     | 444100678 |
| 2   | Tariq Algadheeb   | 444100905 |
| 3   | Mohammed Albilaly | 444101589 |
| 4   | Saad Alqarni      | 444102880 |

**Advisor:** Dr. Sultan Alsarra
**King Saud University · CCIS · SWE 496 · 2025–2026**

</div>
