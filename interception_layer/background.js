const CP_API_BASE = "http://localhost:8000/api/v1";

// Utility to get the token from storage
async function getToken() {
    const data = await chrome.storage.local.get(["access_token"]);
    return data.access_token;
}

// Listener for messages from popup.js or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "LOGIN_SUCCESS") {
        chrome.storage.local.set({ access_token: request.token }, () => {
            console.log("Token stored successfully");
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
});

// Intercept outgoing requests to AI platforms (simplified for Task 1.4)
// Note: In Manifest V3, we use declarativeNetRequest for modification, 
// but for this initial phase, we focus on providing the token to content scripts 
// or using webRequest for observation/blocking if permissions allow.
chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        // Only inject token if we are hitting our own Control Plane or a target AI API
        // For this demo, we check if the URL contains the CP_API_BASE or common AI endpoints
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
