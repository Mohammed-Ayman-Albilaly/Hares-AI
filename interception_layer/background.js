const CP_API_BASE = "http://localhost:8000/api/v1";

// Utility to get the token from storage
async function getToken() {
    const data = await chrome.storage.local.get(["access_token"]);
    return data.access_token;
}

/**
 * Syncs active inspection rules from the Control Plane.
 */
async function syncRules() {
    console.log("Attempting to sync rules from Control Plane...");
    const token = await getToken();
    
    if (!token) {
        console.warn("No access token found. Skipping rule sync.");
        return;
    }

    try {
        const response = await fetch(`${CP_API_BASE}/guardrail/rules`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch rules: ${response.status} ${response.statusText}`);
        }

        const rulesData = await response.json();
        await chrome.storage.local.set({ active_rules: rulesData });
        console.log("Rules synced successfully:", rulesData);
    } catch (error) {
        console.error("Error syncing rules:", error);
    }
}

// Set up periodic sync using alarms
function setupRuleSyncAlarm() {
    chrome.alarms.create("ruleSyncAlarm", {
        periodInMinutes: 15 // Sync every 15 minutes
    });
    console.log("Rule sync alarm scheduled (15m interval).");
}

// Listener for messages from popup.js or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "LOGIN_SUCCESS") {
        chrome.storage.local.set({ access_token: request.token }, () => {
            console.log("Token stored successfully");
            // Sync rules immediately after login
            syncRules();
            sendResponse({ status: "success" });
        });
        return true; 
    }
    
    if (request.type === "LOGOUT") {
        chrome.storage.local.remove("access_token", () => {
            console.log("Token removed");
            sendResponse({ status: "success" });
        });
        return true;
    }

    if (request.type === "GET_TOKEN") {
        getToken().then(token => sendResponse({ token }));
        return true;
    }

    if (request.type === "SUBMIT_JUSTIFICATION") {
        handleJustificationSubmit(request.payload, sendResponse);
        return true;
    }
});

/**
 * Forwards the justification and prompt payload to the Control Plane for audit logging.
 */
async function handleJustificationSubmit(payload, sendResponse) {
    console.log("[Hares AI] Forwarding justification to Control Plane...", payload);
    const token = await getToken();
    
    if (!token) {
        console.error("[Hares AI] No auth token available for justification submission.");
        sendResponse({ status: "error", message: "Authentication required" });
        return;
    }

    try {
        const response = await fetch(`${CP_API_BASE}/guardrail/audit/justification`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`CP API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log("[Hares AI] Justification logged successfully:", result);
        sendResponse({ status: "success", data: result });
    } catch (error) {
        console.error("[Hares AI] Failed to log justification:", error);
        sendResponse({ status: "error", message: error.message });
    }
}

// Intercept outgoing requests to AI platforms (simplified for Task 1.4)
chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        if (details.url.startsWith(CP_API_BASE) || details.url.includes("openai.com") || details.url.includes("anthropic.com")) {
            getToken().then(token => {
                if (token) {
                    details.requestHeaders.push({
                        name: "Authorization",
                        value: `Bearer ${token}`
                    });
                }
            });
        }
        return { requestHeaders: details.requestHeaders };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Alarm listener to trigger sync
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "ruleSyncAlarm") {
        syncRules();
    }
});

// Trigger sync on startup and installation
chrome.runtime.onStartup.addListener(() => {
    console.log("Extension started. Triggering initial rule sync...");
    setupRuleSyncAlarm();
    syncRules();
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed. Triggering initial rule sync...");
    setupRuleSyncAlarm();
    syncRules();
});
