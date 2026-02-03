/**
 * GDrive Backup View
 * Updates the DOM elements for Google Drive integration.
 */
class GDriveBackupView {
    constructor() {
        this.loggedOutDiv = document.getElementById('gdrive-logged-out');
        this.loggedInDiv = document.getElementById('gdrive-logged-in');
        this.userNameEl = document.getElementById('gdrive-user-name');
        this.userEmailEl = document.getElementById('gdrive-user-email');
        this.userAvatarEl = document.getElementById('gdrive-user-avatar');
        this.autoSaveCheck = document.getElementById('gdrive-auto-save');
        this.statusTextEl = document.getElementById('gdrive-status-text');
        this.statusIconEl = document.querySelector('#gdrive-sync-status i');
    }

    render(state) {
        if (!this.loggedOutDiv || !this.loggedInDiv) return;

        if (state.isSignedIn) {
            this.loggedOutDiv.style.display = 'none';
            this.loggedInDiv.style.display = 'block';

            if (state.user) {
                if (this.userNameEl) this.userNameEl.textContent = state.user.name || 'Utilisateur Google';
                if (this.userEmailEl) this.userEmailEl.textContent = state.user.email;
                if (this.userAvatarEl && state.user.picture) {
                    this.userAvatarEl.innerHTML = `<img src="${state.user.picture}" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
            }

            if (this.autoSaveCheck) this.autoSaveCheck.checked = state.autoSaveEnabled;

            if (this.statusTextEl) this.statusTextEl.textContent = state.statusMessage;
            this.updateStatusIcon(state.status);
        } else {
            this.loggedOutDiv.style.display = 'block';
            this.loggedInDiv.style.display = 'none';
        }
    }

    updateStatusIcon(status) {
        if (!this.statusIconEl) return;

        let iconName = 'check-circle';
        let isSpinning = false;

        switch (status) {
            case 'syncing':
                iconName = 'refresh-cw';
                isSpinning = true;
                break;
            case 'error':
                iconName = 'alert-circle';
                break;
            case 'success':
                iconName = 'check-circle';
                break;
        }

        this.statusIconEl.setAttribute('data-lucide', iconName);
        if (isSpinning) {
            this.statusIconEl.classList.add('spinning-icon');
        } else {
            this.statusIconEl.classList.remove('spinning-icon');
        }

        if (window.lucide) lucide.createIcons();
    }
}

// Add spinning animation if not exists
if (!document.getElementById('gdrive-view-styles')) {
    const style = document.createElement('style');
    style.id = 'gdrive-view-styles';
    style.textContent = `
        @keyframes spinAround {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .spinning-icon {
            animation: spinAround 2s linear infinite;
        }
    `;
    document.head.appendChild(style);
}
