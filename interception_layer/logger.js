/**
 * Logger utility for the Interception Layer.
 * Provides structured console logging and forwards critical errors to the Control Plane.
 */
class Logger {
    constructor(context = "IL_General") {
        this.context = context;
    }

    info(message, data = {}) {
        console.log(`[Hares AI][${this.context}][INFO] ${message}`, data);
    }

    warn(message, data = {}) {
        console.warn(`[Hares AI][${this.context}][WARN] ${message}`, data);
    }

    error(message, error = null, data = {}) {
        const errorDetail = error ? { 
            message: error.message, 
            stack: error.stack 
        } : null;

        console.error(`[Hares AI][${this.context}][ERROR] ${message}`, errorDetail, data);

        // Forward critical error to Control Plane for Sentry tracking
        this.reportToCP(message, errorDetail, data);
    }

    async reportToCP(message, errorDetail, data) {
        try {
            const token = await chrome.storage.local.get("access_token");
            if (!token.access_token) return;

            await fetch("http://localhost:8000/api/v1/logs/report", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token.access_token}`
                },
                body: JSON.stringify({
                    message,
                    error: errorDetail,
                    context: this.context,
                    metadata: data
                })
            });
        } catch (e) {
            console.error("[Hares AI] Failed to report error to CP:", e);
        }
    }
}

export const logger = new Logger();
