import { maskText } from './masker.js';
import { JustificationDialog } from './dialog.js';

/**
 * Intercepts prompt submissions on AI platforms.
 */

const dialog = new JustificationDialog(
    async (justification) => {
        console.log(`[Hares AI] Justification provided: ${justification}`);
        // This will be handled by the background script to send to Control Plane
    },
    () => {
        console.log("[Hares AI] User cancelled override.");
    }
);

async function processPrompt(text, inputElement) {
    console.log("[Hares AI] Intercepting prompt...");
    
    // 1. Get active rules from storage
    const storage = await chrome.storage.local.get(["active_rules"]);
    const activeRules = storage.active_rules || [];
    
    // 2. Apply local masking and risk evaluation
    const { maskedText, detected } = await maskText(text, activeRules);
    
    // Determine risk level based on detected PII or rules
    // In a full implementation, this would come from the Intelligence Layer (InL)
    // For now, if PII is detected, we treat it as HIGH_RISK. If it's a critical block, BLOCKED.
    let riskLevel = 'LOW';
    if (detected.length > 0) {
        riskLevel = 'HIGH_RISK';
        // If any detected PII is marked as 'CRITICAL' in rules, it's BLOCKED
        const isCritical = detected.some(d => d.severity === 'CRITICAL');
        if (isCritical) riskLevel = 'BLOCKED';
    }

    if (riskLevel === 'LOW') {
        return { action: 'allow', maskedText };
    }

    // 3. Trigger Justification Dialog for BLOCKED or HIGH_RISK
    console.log(`[Hares AI] Risk Level: ${riskLevel}. Triggering justification dialog...`);
    
    // Prevent the original submission by returning a special state
    const result = await dialog.show(text, riskLevel);
    
    if (result.action === 'confirmed') {
        // Send justification and payload to Control Plane via background script
        chrome.runtime.sendMessage({
            type: 'SUBMIT_JUSTIFICATION',
            payload: {
                originalText: text,
                maskedText: maskedText,
                justification: result.justification,
                riskLevel: riskLevel,
                timestamp: new Date().toISOString(),
                url: window.location.href
            }
        }, (response) => {
            console.log('[Hares AI] Control Plane response:', response);
        });

        return { action: 'allow', maskedText };
    } else {
        return { action: 'block' };
    }
}

// Intercepts 'Enter' key on textareas
document.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
            const originalText = activeElement.value;
            if (!originalText) return;

            // Prevent default to stop the prompt from being sent immediately
            e.preventDefault();
            
            const result = await processPrompt(originalText, activeElement);
            
            if (result.action === 'allow') {
                activeElement.value = result.maskedText;
                activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Re-trigger the Enter key event to actually send the prompt
                // Since we can't easily re-trigger 'Enter' on some platforms, 
                // we might need to simulate a click on the send button.
                // For this implementation, we just set the value and let the user press Enter again
                // or we can try to dispatch a new KeyEvent.
                
                // Attempt to simulate Enter press
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                });
                activeElement.dispatchEvent(enterEvent);
            }
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
            e.preventDefault();
            e.stopPropagation();
            
            const result = await processPrompt(input.value, input);
            
            if (result.action === 'allow') {
                input.value = result.maskedText;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Simulate click on the button again
                setTimeout(() => {
                    target.click();
                }, 100);
            }
        }
    }
}, true);

console.log("[Hares AI] Compliance Layer (Justification) active.");
