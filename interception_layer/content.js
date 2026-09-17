import { maskText } from './masker.js';

/**
 * Intercepts prompt submissions on AI platforms.
 * This is a simplified implementation that targets common textarea/input elements
 * and intercepts the 'Enter' key or 'Submit' buttons.
 */

async function processPrompt(text) {
    console.log("[Hares AI] Intercepting prompt...");
    
    // 1. Get active rules from storage (synced by background.js)
    const storage = await chrome.storage.local.get(["active_rules"]);
    const activeRules = storage.active_rules || [];
    
    // 2. Apply local masking
    const { maskedText, detected } = await maskText(text, activeRules);
    
    if (detected.length > 0) {
        console.log(`[Hares AI] PII Detected: ${detected.map(d => d.type).join(', ')}`);
        console.log(`[Hares AI] Masked Content: ${maskedText}`);
    } else {
        console.log("[Hares AI] No PII detected.");
    }

    return { maskedText, detected };
}

// Intercepts 'Enter' key on textareas (common in AI chats)
document.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
            const originalText = activeElement.value;
            if (!originalText) return;

            const { maskedText } = await processPrompt(originalText);
            
            // Replace the text in the element before it is sent
            // Note: This is a basic replacement. For complex React/Vue apps, 
            // we might need to trigger input events.
            activeElement.value = maskedText;
            
            // Trigger a change event so the app knows the value changed
            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
});

// Generic interceptor for buttons that look like 'Submit' or 'Send'
document.addEventListener('click', async (e) => {
    const target = e.target;
    if (target && (target.innerText?.toLowerCase().includes('send') || target.innerText?.toLowerCase().includes('submit'))) {
        // Find the nearest textarea/input
        const input = document.querySelector('textarea, input[type="text"]');
        if (input && input.value) {
            const { maskedText } = await processPrompt(input.value);
            input.value = maskedText;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
}, true);

console.log("[Hares AI] Local Masking Engine active.");
