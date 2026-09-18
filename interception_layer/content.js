import { maskText } from './masker.js';
import { JustificationDialog } from './dialog.js';
import { RewriteEngine } from './rewrite_engine.js';

/**
 * Intercepts prompt submissions on AI platforms.
 */

const dialog = new JustificationDialog(
    async (justification) => {
        console.log(`[Hares AI] Justification provided: ${justification}`);
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
    let riskLevel = 'LOW';
    if (detected.length > 0) {
        riskLevel = 'HIGH_RISK';
        const isCritical = detected.some(d => d.severity === 'CRITICAL');
        if (isCritical) riskLevel = 'BLOCKED';
    }

    if (riskLevel === 'LOW') {
        return { action: 'allow', maskedText };
    }

    // 3. Generate a semantic rewrite for the user to consider
    const rewrittenText = RewriteEngine.rewrite(text, detected);
    
    // 4. Trigger Dialog with Rewrite Option
    console.log(`[Hares AI] Risk Level: ${riskLevel}. Triggering rewrite/justification dialog...`);
    
    const result = await dialog.show(text, riskLevel, rewrittenText);
    
    if (result.action === 'confirmed') {
        // User chose to override with justification
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
            if (response && response.status === 'error') {
                console.error('[Hares AI] Audit log failed, but allowing prompt as per Fail-Open for justification.');
            } else {
                console.log('[Hares AI] Control Plane response:', response);
            }
        });

        return { action: 'allow', maskedText };
    } else if (result.action === 'rewritten') {
        // User chose the privacy-preserving rewrite
        console.log("[Hares AI] User accepted semantic rewrite.");
        return { action: 'allow', maskedText: rewrittenText };
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

            e.preventDefault();
            
            const result = await processPrompt(originalText, activeElement);
            
            if (result.action === 'allow') {
                activeElement.value = result.maskedText;
                activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                
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
        const input = document.querySelector('textarea, input[type="text"]');
        if (input && input.value) {
            e.preventDefault();
            e.stopPropagation();
            
            const result = await processPrompt(input.value, input);
            
            if (result.action === 'allow') {
                input.value = result.maskedText;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                
                setTimeout(() => {
                    target.click();
                }, 100);
            }
        }
    }
}, true);

console.log("[Hares AI] Compliance Layer (Rewrite Engine) active.");
