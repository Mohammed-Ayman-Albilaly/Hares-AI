/**
 * rewrite_engine.js
 * Provides semantic sanitization for prompts.
 * Instead of just masking <EMAIL>, it tries to preserve the context 
 * by replacing the sensitive value with a generic but contextually relevant term.
 */

const REWRITE_MAP = {
    "EMAIL": "a user's email address",
    "PHONE": "a contact phone number",
    "CREDIT_CARD": "a credit card number",
    "API_KEY": "an API key",
    "GENERIC_SECRET": "a sensitive secret",
    "SAUDI_ID": "a national ID number",
};

export class RewriteEngine {
    /**
     * Rewrites the prompt to be privacy-preserving while maintaining semantics.
     * @param {string} text - The original prompt.
     * @param {Array} detected - The entities detected by the masker.
     * @returns {string} The rewritten prompt.
     */
    static rewrite(text, detected) {
        if (!detected || detected.length === 0) {
            return text;
        }

        // Sort entities by start index ASCENDING to build the string from left to right
        const sortedEntities = [...detected].sort((a, b) => a.start - b.start);
        
        let result = "";
        let lastIndex = 0;

        for (const entity of sortedEntities) {
            // Add the text between the last entity and the current one
            result += text.slice(lastIndex, entity.start);
            
            const replacement = REWRITE_MAP[entity.type] || `a ${entity.type.toLowerCase()} value`;
            result += `[${replacement}]`;
            
            lastIndex = entity.end;
        }

        // Add the remaining part of the string
        result += text.slice(lastIndex);

        return result;
    }

    /**
     * Performs a "safe" rewrite that removes the entity entirely if it's too critical.
     */
    static sanitize(text, detected) {
        if (!detected || detected.length === 0) {
            return text;
        }

        const sortedEntities = [...detected].sort((a, b) => a.start - b.start);
        
        let result = "";
        let lastIndex = 0;

        for (const entity of sortedEntities) {
            result += text.slice(lastIndex, entity.start);
            result += "[REDACTED]";
            lastIndex = entity.end;
        }

        result += text.slice(lastIndex);
        return result;
    }
}
