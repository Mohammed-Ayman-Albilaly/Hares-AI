/**
 * dialog.js
 * Handles the creation and interaction of the Justification and Rewrite Modals.
 */

export class JustificationDialog {
    constructor(onConfirm, onCancel) {
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
        this.modal = null;
    }

    /**
     * Shows the dialog. If a rewritten prompt is provided, it offers the user the choice
     * between using the original (with justification) or using the rewritten version.
     */
    show(promptText, riskLevel, rewrittenText = null) {
        return new Promise((resolve) => {
            this.createModal(promptText, riskLevel, rewrittenText);
            
            const confirmBtn = this.modal.querySelector('#hares-confirm-btn');
            const rewriteBtn = this.modal.querySelector('#hares-rewrite-btn');
            const cancelBtn = this.modal.querySelector('#hares-cancel-btn');
            const textarea = this.modal.querySelector('#hares-justification-text');

            confirmBtn.onclick = () => {
                const justification = textarea.value.trim();
                if (!justification) {
                    alert("Please provide a business justification.");
                    return;
                }
                this.removeModal();
                this.onConfirm(justification);
                resolve({ action: 'confirmed', justification });
            };

            if (rewriteBtn) {
                rewriteBtn.onclick = () => {
                    this.removeModal();
                    resolve({ action: 'rewritten' });
                };
            }

            cancelBtn.onclick = () => {
                this.removeModal();
                this.onCancel();
                resolve({ action: 'cancelled' });
            };
        });
    }

    createModal(promptText, riskLevel, rewrittenText = null) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'hares-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: '999999',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Arial, sans-serif'
        });

        // Create modal container
        const container = document.createElement('div');
        Object.assign(container.style, {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '600px',
            width: '90%',
            color: '#333'
        });

        const title = document.createElement('h3');
        title.innerText = riskLevel === 'BLOCKED' ? '⚠️ Prompt Blocked' : '⚠️ High Risk Detected';
        title.style.margin = '0 0 10px 0';
        title.style.color = riskLevel === 'BLOCKED' ? '#d32f2f' : '#f57c00';

        const message = document.createElement('p');
        message.innerText = 'Your prompt contains sensitive information. You can either provide a justification to use the original prompt or use the suggested privacy-preserving rewrite.';
        message.style.fontSize = '14px';
        message.style.marginBottom = '15px';

        // Prompt Comparison Section
        const comparisonContainer = document.createElement('div');
        Object.assign(comparisonContainer.style, {
            display: 'flex',
            gap: '10px',
            marginBottom: '15px'
        });

        const originalBox = document.createElement('div');
        originalBox.style.flex = '1';
        originalBox.innerHTML = `<div style="font-size:11px; font-weight:bold; margin-bottom:5px;">Original</div>`;
        const originalPreview = document.createElement('div');
        originalPreview.innerText = promptText;
        Object.assign(originalPreview.style, {
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            border: '1px solid #ddd',
            maxHeight: '100px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap'
        });
        originalBox.appendChild(originalPreview);

        comparisonContainer.appendChild(originalBox);

        if (rewrittenText) {
            const rewriteBox = document.createElement('div');
            rewriteBox.style.flex = '1';
            rewriteBox.innerHTML = `<div style="font-size:11px; font-weight:bold; margin-bottom:5px;">Suggested Rewrite</div>`;
            const rewritePreview = document.createElement('div');
            rewritePreview.innerText = rewrittenText;
            Object.assign(rewritePreview.style, {
                backgroundColor: '#e3f2fd',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                border: '1px solid #bbdefb',
                maxHeight: '100px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                color: '#0d47a1'
            });
            rewriteBox.appendChild(rewritePreview);
            comparisonContainer.appendChild(rewriteBox);
        }

        const label = document.createElement('label');
        label.innerText = 'Business Justification (to use original):';
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.fontSize = '13px';
        label.style.fontWeight = 'bold';

        const textarea = document.createElement('textarea');
        textarea.id = 'hares-justification-text';
        textarea.placeholder = 'e.g., Required for debugging ticket #1234...';
        Object.assign(textarea.style, {
            width: '100%',
            height: '80px',
            marginBottom: '15px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            boxSizing: 'border-box'
        });

        const buttonContainer = document.createElement('div');
        Object.assign(buttonContainer.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'hares-cancel-btn';
        cancelBtn.innerText = 'Cancel';
        Object.assign(cancelBtn.style, {
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: '#eee'
        });

        const confirmBtn = document.createElement('button');
        confirmBtn.id = 'hares-confirm-btn';
        confirmBtn.innerText = 'Submit Override';
        Object.assign(confirmBtn.style, {
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            fontWeight: 'bold'
        });

        if (rewrittenText) {
            const rewriteBtn = document.createElement('button');
            rewriteBtn.id = 'hares-rewrite-btn';
            rewriteBtn.innerText = 'Use Rewrite';
            Object.assign(rewriteBtn.style, {
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#28a745',
                color: 'white',
                fontWeight: 'bold'
            });
            buttonContainer.appendChild(rewriteBtn);
        }

        buttonContainer.appendChild(confirmBtn);
        buttonContainer.appendChild(cancelBtn);

        container.appendChild(title);
        container.appendChild(message);
        container.appendChild(comparisonContainer);
        container.appendChild(label);
        container.appendChild(textarea);
        container.appendChild(buttonContainer);

        overlay.appendChild(container);
        document.body.appendChild(overlay);
        this.modal = overlay;
    }

    removeModal() {
        if (this.modal) {
            document.body.removeChild(this.modal);
            this.modal = null;
        }
    }
}
