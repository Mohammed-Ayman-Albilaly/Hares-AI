<div align="center">

<img src="assets/hares-logo.jpeg" alt="Hares AI Logo" width="100" height="100" style="border-radius: 20px;" />

# Hares AI

### Real-Time AI Prompt Data Loss Prevention

_Intercept. Detect. Protect — before it's too late._

<br/>

![Status](https://img.shields.io/badge/Status-In%20Development-blue?style=for-the-badge&logo=github)
![Platform](https://img.shields.io/badge/Platform-Chrome%20Extension-orange?style=for-the-badge&logo=googlechrome)
![Backend](https://img.shields.io/badge/Backend-Firebase-yellow?style=for-the-badge&logo=firebase)
![AI](https://img.shields.io/badge/AI-Gemini%20API-4285F4?style=for-the-badge&logo=google)
![University](https://img.shields.io/badge/KSU-SWE%20496-darkgreen?style=for-the-badge)

<br/>

</div>

---

## The Problem

Every day, employees paste **passwords**, **national IDs**, **IBANs**, **API keys**, and **confidential business data** directly into ChatGPT, Gemini, and Claude — without realising the risk.

Existing security tools watch the network. They respond after the fact.

**Hares AI acts at the source — before the prompt is submitted.**

---

## What Is Hares AI?

Hares AI is a **Chrome browser extension** combined with a **web-based admin dashboard** that silently sits between the user and any AI platform. The moment a user types a prompt, Hares AI scans it locally on-device, classifies the risk level, and acts accordingly — all in under 200ms.

No raw sensitive data ever leaves the device during this process.

---

## How It Works

```
User types prompt
       │
       ▼
┌─────────────────────────────┐
│   Local Regex Detection     │  ← runs on-device, < 200ms
│   (200+ sensitive patterns) │
└─────────────────────────────┘
       │
   ┌───┴───┐
   │       │
CLEAR  INCONCLUSIVE
   │       │
   │       ▼
   │  ┌─────────────────────────┐
   │  │  Mask detected content  │
   │  │  Send masked text only  │
   │  │  → Gemini API           │  ← < 500ms total
   │  └─────────────────────────┘
   │       │
   └───┬───┘
       │
       ▼
┌─────────────────────────────────────────────┐
│              Risk Decision                  │
│                                             │
│  🔴 HIGH    → Block submission + Alert      │
│  🟡 MEDIUM  → Warn + User choice           │
│  🔵 LOW     → Info banner (non-blocking)   │
│  🟢 NONE    → Allow silently               │
└─────────────────────────────────────────────┘
       │
       ▼
  Log anonymized metadata to Firebase
```

---

## Key Features

| Feature                       | Description                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------- |
| 🛡️ **Real-Time Interception** | Captures prompt text before it reaches ChatGPT, Gemini, or Claude                 |
| 🔍 **Local-First Detection**  | 200+ regex patterns run entirely on-device — no cloud dependency for primary scan |
| 🤖 **AI Fallback**            | Gemini API as secondary classifier for ambiguous cases (masked text only)         |
| 📊 **Risk Classification**    | High / Medium / Low / None with automatic enforcement per level                   |
| ✏️ **Prompt Revision**        | AI-generated safe rewrite of any blocked prompt — ready to resubmit               |
| 📋 **Audit Logs**             | Anonymized activity logs per user, per department, org-wide                       |
| 👥 **Role-Based Dashboard**   | Three roles: Normal User, Department Admin, System Admin                          |
| ⚙️ **Configurable Rules**     | System admins can add, edit, and disable detection patterns                       |

---

## Supported AI Platforms

<div align="center">

| Platform                          | Supported  |
| --------------------------------- | ---------- |
| ChatGPT (chat.openai.com)         | ✅         |
| Google Gemini (gemini.google.com) | ✅         |
| Claude (claude.ai)                | ✅         |
| Microsoft Copilot                 | 🔜 Planned |
| Perplexity                        | 🔜 Planned |

</div>

---

## Risk Level System

```
┌─────────────────────────────────────────────────────────────┐
│  RISK LEVEL     │  EXAMPLE ENTITIES          │  ACTION       │
├─────────────────┼────────────────────────────┼───────────────┤
│  🔴 HIGH        │  Saudi National ID, IBAN,  │  BLOCKED      │
│                 │  Passport, API Key,         │  No override  │
│                 │  Password, Credit Card      │               │
├─────────────────┼────────────────────────────┼───────────────┤
│  🟡 MEDIUM      │  Internal financial data,  │  WARNING      │
│                 │  Employee records,          │  User decides │
│                 │  Contract references        │               │
├─────────────────┼────────────────────────────┼───────────────┤
│  🔵 LOW         │  Internal endpoints,        │  INFO BANNER  │
│                 │  Codenames, Generic         │  Non-blocking │
│                 │  internal references        │               │
├─────────────────┼────────────────────────────┼───────────────┤
│  🟢 NONE        │  No sensitive data found   │  ALLOWED      │
│                 │                            │  Silent pass  │
└─────────────────┴────────────────────────────┴───────────────┘
```

---

## Tech Stack

<div align="center">

| Layer              | Technology                                                    |
| ------------------ | ------------------------------------------------------------- |
| Browser Extension  | Chrome Manifest V3, Content Script, Background Service Worker |
| Frontend Dashboard | React (JSX)                                                   |
| Authentication     | Firebase Auth                                                 |
| Database           | Firebase Firestore                                            |
| AI Detection       | Regex Engine + Gemini API (fallback)                          |
| Local Storage      | Chrome Storage API                                            |

</div>

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│         Chrome Extension UI  │  React Web Dashboard      │
└──────────────────────────────┬──────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────┐
│                  BUSINESS LOGIC LAYER                    │
│   Content Script │ Background Worker │ Controllers       │
└──────────────────────────────┬──────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────┐
│                  DATA ACCESS LAYER                       │
│         Firebase SDK  │  Chrome Storage API              │
└──────────────────────────────┬──────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────┐
│                     DATA LAYER                           │
│        Firestore Database  │  Chrome Local Storage       │
└─────────────────────────────────────────────────────────┘
```

---

## Privacy & Security Guarantees

> **No raw sensitive data is ever stored or transmitted.**

- ✅ All primary detection runs **locally on the user's device**
- ✅ Only **masked text** (with placeholder tags) is sent to Gemini API when needed
- ✅ Logs store **anonymized metadata only** — no prompt content
- ✅ Gemini API operates under the **Google Cloud Data Processing Addendum** — inputs are never used to train Google's models
- ✅ HTTPS-only communication
- ✅ Role-based access control (RBAC)
- ✅ bcrypt password hashing

---

## User Roles

```
System Admin
│   ├── Org-wide dashboard & statistics
│   ├── Full activity log review & export
│   ├── User management (all users)
│   ├── Role assignment
│   ├── Department management
│   └── System configuration (detection rules, thresholds, platforms)
│
Department Admin
│   ├── Department-scoped dashboard
│   ├── Department log review & export
│   └── Department user management (activate/deactivate)
│
Normal User
    ├── Personal dashboard & activity log
    ├── Blocked messages view
    ├── Prompt revision (AI-generated safe rewrite)
    └── Profile & settings
```

---

## Performance Constraints

| Metric                          | Constraint  |
| ------------------------------- | ----------- |
| Local Regex Detection           | ≤ 200ms     |
| Gemini API Fallback (total)     | ≤ 500ms     |
| Extension Memory                | ≤ 100MB RAM |
| Admin Dashboard Load            | ≤ 3 seconds |
| Detection Accuracy (structured) | ≥ 90%       |
| False Positive Rate             | ≤ 10%       |

---

## Project Status

> **GP1 (Analysis & Design) — Complete ✅**
> GP2 (Implementation) — In Progress 🔨

| Deliverable                         | Status  |
| ----------------------------------- | ------- |
| Requirements (43 FRs + NFRs)        | ✅ Done |
| Use Case Diagrams (4 diagrams)      | ✅ Done |
| Analysis Class Diagram              | ✅ Done |
| Interaction Diagrams (6 UCs)        | ✅ Done |
| Design Class Diagram                | ✅ Done |
| System Architecture                 | ✅ Done |
| UI Mockups (23 screens)             | ✅ Done |
| Database Schema + ERD               | ✅ Done |
| Algorithm Pseudocode (8 algorithms) | ✅ Done |
| Test Scenarios (18 test cases)      | ✅ Done |
| Chrome Extension Implementation     | 🔨 GP2  |
| Admin Dashboard Implementation      | 🔨 GP2  |
| Firebase Integration                | 🔨 GP2  |

---

## Team

<div align="center">

| #   | Name              | Student ID |
| --- | ----------------- | ---------- |
| 1   | Moath Alonayq     | 444100678  |
| 2   | Tariq Algadheeb   | 444100905  |
| 3   | Mohammed Albilaly | 444101589  |
| 4   | Saad Alqarni      | 444102880  |

**Advisor:** Dr. Sultan Alsarra
**University:** King Saud University — College of Computer and Information Sciences
**Course:** SWE 496 — Graduation Project, Part I

</div>

---

## References

Detection patterns and threat categories are based on:

- NIST SP 800-122 — Guide to Protecting PII
- Google Chrome Manifest V3 — Extension security standards
- Google Cloud Data Processing Addendum — API data privacy guarantees
- Saudi SAMA regulatory data classification guidelines

---

<div align="center">

_Hares AI — Protecting organizations from AI-related data leakage, one prompt at a time._

![KSU](https://img.shields.io/badge/King%20Saud%20University-CCIS-darkgreen?style=flat-square)
![Year](https://img.shields.io/badge/Academic%20Year-2025--2026-blue?style=flat-square)

</div>
