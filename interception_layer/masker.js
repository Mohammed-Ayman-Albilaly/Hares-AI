/**
 * Masking Engine for Hares AI Interception Layer
 * Provides local PII detection and masking using regex.
 */

const PI_REGISTRY = {
    "EMAIL": {
        regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        placeholder: "<EMAIL>"
    },
    "PHONE": {
        regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        placeholder: "<PHONE>"
    },
    "CREDIT_CARD": {
        regex: /\b(?:\d[ -]*?){13,16}\b/g,
        placeholder: "<CREDIT_CARD>"
    },
    "API_KEY": {
        regex: /(?:sk-[a-zA-Z0-9]{20,})|(?:\b[a-zA-Z0-9]{32,}\b)/g,
        placeholder: "<API_KEY>"
    },
    "GENERIC_SECRET": {
        regex: /(?:password|secret|token|key)\s*[:=]\s*([^\s]+)/gi,
        placeholder: "<SECRET>"
    },
    "SAUDI_ID": {
        regex: /\b1[0-9]{9}\b/g,
        placeholder: "<SAUDI_ID>"
    }
};

/**
 * Masks PII based on the active rules fetched from the Control Plane.
 * @param {string} text - The original prompt text.
 * @param {string[]} activeRules - The list of rule keys (e.g., ["EMAIL", "PHONE"]) to apply.
 * @returns {{ maskedText: string, detected: Array }}
 */
export async function maskText(text, activeRules = []) {
    let maskedText = text;
    const detected = [];

    if (!activeRules || activeRules.length === 0) {
        return { maskedText: text, detected: [] };
    }

    for (const ruleKey of activeRules) {
        const rule = PI_REGISTRY[ruleKey];
        if (!rule) continue;

        const regex = rule.regex;
        const placeholder = rule.placeholder;

        let match;
        while ((match = regex.exec(text)) !== null) {
            detected.push({
                type: ruleKey,
                value: match[0],
                start: match.index,
                end: match.index + match[0].length
            });
        }
        
        // Apply the replacement
        maskedText = maskedText.replace(regex, placeholder);
    }

    return { maskedText, detected };
}
