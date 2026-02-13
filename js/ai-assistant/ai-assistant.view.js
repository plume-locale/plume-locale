// ===================================
// AI Assistant View
// ===================================

const AiAssistantView = {
    _modal: null,
    _activeRequest: null,

    init() {
        this._createModal();
        this._bindEvents();
        return this;
    },

    _createModal() {
        if (document.getElementById('ai-assistant-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'ai-assistant-modal';
        modal.className = 'ai-modal'; // Will add CSS later
        modal.innerHTML = `
            <div class="ai-modal-content">
                <div class="ai-header">
                    <h3><i data-lucide="bot"></i> ${Localization.t('ai.title')}</h3>
                    <div style="display:flex;gap:8px;">
                        <button class="ai-config-btn" title="${Localization.t('ai.config_btn')}" style="background:none;border:none;cursor:pointer;"><i data-lucide="settings"></i></button>
                        <button class="ai-close-btn" style="background:none;border:none;cursor:pointer;"><i data-lucide="x"></i></button>
                    </div>
                </div>
                <div class="ai-body" id="ai-chat-history">
                    <div class="ai-message system">
                        ${Localization.t('ai.welcome')}
                        <ul>
                            <li>${Localization.t('ai.example_rewrite')}</li>
                            <li>${Localization.t('ai.example_ideas')}</li>
                            <li>${Localization.t('ai.example_tone')}</li>
                        </ul>
                    </div>
                    <div class="ai-message system" style="background:#e3f2fd;border-color:#b3e5fc;">
                        ${Localization.t('ai.setup_guide')}
                    </div>
                </div>
                <div class="ai-footer">
                    <div class="ai-input-wrapper">
                        <textarea id="ai-input" placeholder="${Localization.t('ai.input_placeholder')}"></textarea>
                        <button id="ai-send-btn" title="${Localization.t('ai.send_btn')}"><i data-lucide="send"></i></button>
                    </div>
                    <div class="ai-actions">
                        <button class="ai-action-btn" onclick="AiAssistantView.insertResponse()">${Localization.t('ai.insert_btn')}</button>
                        <button class="ai-action-btn" onclick="AiAssistantView.copyResponse()">${Localization.t('ai.copy_btn')}</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this._modal = modal;

        // Add styles if not present
        if (!document.getElementById('ai-styles')) {
            const style = document.createElement('style');
            style.id = 'ai-styles';
            style.textContent = `
                .ai-modal {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 2000;
                    align-items: center;
                    justify-content: center;
                }
                .ai-modal.active { display: flex; }
                .ai-modal-content {
                    width: 600px;
                    max-width: 90%;
                    height: 80vh;
                    background: var(--bg-surface, #fff);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    border: 1px solid var(--border, #ccc);
                }
                .ai-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border, #eee);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 600;
                }
                .ai-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: var(--bg-app, #f9f9f9);
                }
                .ai-message {
                    padding: 10px 14px;
                    border-radius: 8px;
                    max-width: 80%;
                    line-height: 1.5;
                    font-size: 14px;
                }
                .ai-message.user {
                    align-self: flex-end;
                    background: var(--accent, #8b7355);
                    color: white;
                }
                .ai-message.system {
                    align-self: flex-start;
                    background: var(--bg-surface-alt, #fff);
                    border: 1px solid var(--border, #eee);
                    color: var(--text-primary, #333);
                }
                .ai-footer {
                    padding: 12px;
                    border-top: 1px solid var(--border, #eee);
                    background: var(--bg-surface, #fff);
                }
                .ai-input-wrapper {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                #ai-input {
                    flex: 1;
                    height: 60px;
                    border: 1px solid var(--border-input, #ccc);
                    border-radius: 6px;
                    padding: 8px;
                    resize: none;
                    font-family: inherit;
                }
                #ai-send-btn {
                    width: 40px;
                    height: 40px;
                    background: var(--accent, #8b7355);
                    color: white;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    align-self: flex-end;
                }
                .ai-actions {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                }
                .ai-action-btn {
                    font-size: 12px;
                    padding: 4px 8px;
                    border: 1px solid var(--border, #ccc);
                    border-radius: 4px;
                    color: var(--text-secondary, #666);
                }
                .ai-action-btn:hover {
                    background: var(--bg-hover, #eee);
                }
            `;
            document.head.appendChild(style);
        }
    },

    _bindEvents() {
        const closeBtn = this._modal.querySelector('.ai-close-btn');
        closeBtn.addEventListener('click', () => this.close());

        const configBtn = this._modal.querySelector('.ai-config-btn');
        configBtn.addEventListener('click', () => this._promptForKey());

        this._modal.addEventListener('click', (e) => {
            if (e.target === this._modal) this.close();
        });

        const sendBtn = document.getElementById('ai-send-btn');
        const input = document.getElementById('ai-input');

        sendBtn.addEventListener('click', () => this._sendMessage());
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._sendMessage();
            }
        });
    },

    _promptForKey() {
        const currentKey = AiAssistantService.getApiKey() || '';
        const newKey = prompt(Localization.t('ai.prompt_key'), currentKey);
        if (newKey !== null) {
            AiAssistantService.setApiKey(newKey.trim());
            this._addMessage(Localization.t('ai.key_updated'), 'system');
        }
    },

    open(context = '') {
        this._modal.classList.add('active');
        const input = document.getElementById('ai-input');
        input.focus();

        if (context) {
            input.value = Localization.t('ai.context_prefix', [context]);
        }
    },

    close() {
        this._modal.classList.remove('active');
    },

    toggle() {
        if (this._modal.classList.contains('active')) {
            this.close();
        } else {
            // Get selected text context
            const selection = window.getSelection().toString().trim();
            this.open(selection);
        }
    },

    async _sendMessage() {
        const input = document.getElementById('ai-input');
        const text = input.value.trim();
        if (!text) return;

        this._addMessage(text, 'user');
        input.value = '';

        // Simulate API call (Placeholder)
        this._addMessage(Localization.t('ai.thinking'), 'system loading');

        try {
            const response = await AiAssistantService.send(text);
            this._addMessage(response, 'system');
        } catch (e) {
            this._addMessage(Localization.t('ai.error_prefix') + e.message, 'system error');
        }
    },

    _addMessage(text, type) {
        const history = document.getElementById('ai-chat-history');
        const msg = document.createElement('div');
        msg.className = `ai-message ${type}`;
        msg.innerHTML = text.replace(/\n/g, '<br>');
        history.appendChild(msg);
        history.scrollTop = history.scrollHeight;

        if (type === 'system') {
            this._lastResponse = text;
        }
    },

    insertResponse() {
        if (this._lastResponse) {
            document.execCommand('insertText', false, this._lastResponse);
            this.close();
        }
    },

    copyResponse() {
        if (this._lastResponse) {
            navigator.clipboard.writeText(this._lastResponse);
            alert(Localization.t('ai.copy_success'));
        }
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AiAssistantView.init());
} else {
    AiAssistantView.init();
}
