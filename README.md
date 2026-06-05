# Hares AI

Hares AI is a Chrome browser extension that intercepts user prompts before they reach ChatGPT, Gemini, or Claude — scanning them locally on-device for sensitive data (National IDs, IBANs, passwords, API keys, and more) and blocking or warning the user based on the risk level detected. No raw sensitive data ever leaves the device. For ambiguous cases, only masked text is sent to the Gemini API as a secondary classifier. All activity is anonymously logged to a Firebase backend and accessible via a role-based web dashboard for System Admins and Department Admins.
