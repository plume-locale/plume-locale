// Storage Monitoring Service - Surveillance de l'espace de stockage
const StorageMonitoringService = (() => {
    function getStorageInfo() {
        let used = 0;
        let quota = 0;

        try {
            // Estimer l'espace utilisé par localStorage
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    used += localStorage[key].length + key.length;
                }
            }

            // Quota typique localStorage: 5-10MB
            quota = 10 * 1024 * 1024; // 10MB
        } catch (e) {
            console.warn('[StorageMonitoring] Erreur:', e);
        }

        return {
            used,
            quota,
            remaining: quota - used,
            percentUsed: (used / quota) * 100
        };
    }

    function checkQuota() {
        const info = getStorageInfo();
        
        if (info.percentUsed > 90) {
            if (window.ToastUI) {
                ToastUI.warning('Attention: Espace de stockage presque plein (' + Math.round(info.percentUsed) + '%)');
            }
        }
        
        return info;
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function showStorageInfo() {
        const info = getStorageInfo();
        const message = 'Stockage utilisé: ' + formatBytes(info.used) + ' / ' + formatBytes(info.quota) +
                       '\nEspace restant: ' + formatBytes(info.remaining) +
                       '\nUtilisation: ' + Math.round(info.percentUsed) + '%';
        
        if (window.ModalUI) {
            ModalUI.alert('Informations de stockage', message);
        } else {
            alert(message);
        }
    }

    function init() {
        // Vérifier le quota toutes les 5 minutes
        setInterval(checkQuota, 5 * 60 * 1000);
        
        // Vérification initiale
        setTimeout(checkQuota, 5000);
    }

    return { getStorageInfo, checkQuota, formatBytes, showStorageInfo, init };
})();

window.StorageMonitoringService = StorageMonitoringService;
window.showStorageInfo = () => StorageMonitoringService.showStorageInfo();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => StorageMonitoringService.init());
} else {
    StorageMonitoringService.init();
}
