

        // ============================================
        // STORAGE QUOTA MONITORING FUNCTIONS
        // ============================================

        let storageWarningShown = false;
        let storageCriticalShown = false;

        function initStorageMonitoring() {
            console.log('🔍 Initialisation de la surveillance du stockage IndexedDB...');
            
            // Vérifier que les éléments existent
            const badge = document.getElementById('storage-badge');
            const percentage = document.getElementById('storage-percentage');
            
            if (!badge) {
                console.error('❌ Badge de stockage introuvable dans le DOM');
                return;
            }
            
            if (!percentage) {
                console.error('❌ Élément storage-percentage introuvable');
                return;
            }
            
            console.log('✅ Éléments trouvés, mise à jour du badge...');
            updateStorageBadge();
            checkStorageQuota();
            console.log('✅ Surveillance du stockage initialisée');
        }

        async function getStorageSize() {
            try {
                // Utiliser l'API Storage Estimate pour obtenir la taille réelle
                if ('storage' in navigator && 'estimate' in navigator.storage) {
                    const estimate = await navigator.storage.estimate();
                    return {
                        used: estimate.usage || 0,
                        quota: estimate.quota || (50 * 1024 * 1024) // Default 50 MB si non disponible
                    };
                } else {
                    // Fallback : calculer la taille approximative d'IndexedDB
                    const size = await getIndexedDBSize();
                    return {
                        used: size,
                        quota: 50 * 1024 * 1024 // 50 MB par défaut
                    };
                }
            } catch (error) {
                console.error('❌ Erreur calcul taille stockage:', error);
                return {
                    used: 0,
                    quota: 50 * 1024 * 1024
                };
            }
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 MB';
            const mb = bytes / (1024 * 1024);
            return mb.toFixed(2) + ' MB';
        }

        async function updateStorageBadge() {
            try {
                const { used, quota } = await getStorageSize();
                const percentage = Math.min(100, Math.round((used / quota) * 100));
                
                const badge = document.getElementById('storage-badge');
                const percentageText = document.getElementById('storage-percentage');
                
                if (!badge || !percentageText) return;
                
                percentageText.textContent = percentage + '%';
                
                // Update badge status
                badge.className = 'storage-badge';
                if (percentage >= 95) {
                    badge.classList.add('status-danger');
                } else if (percentage >= 80) {
                    badge.classList.add('status-warning');
                } else {
                    badge.classList.add('status-ok');
                }
                
                // Check and show warnings
                await checkStorageQuota();
            } catch (error) {
                console.error('❌ Erreur mise à jour badge:', error);
            }
        }

        async function checkStorageQuota() {
            try {
                const { used, quota } = await getStorageSize();
                const percentage = (used / quota) * 100;
                
                if (percentage >= 95 && !storageCriticalShown) {
                    storageCriticalShown = true;
                    showStorageAlert(
                        '🚨 Espace critique !',
                        `Vous avez utilisé ${Math.round(percentage)}% de l'espace disponible (${formatBytes(used)} / ${formatBytes(quota)}).\n\n` +
                        `⚠️ ATTENTION : Vous risquez de perdre vos données !\n\n` +
                        `Actions urgentes :\n` +
                        `• Exportez immédiatement votre projet en JSON\n` +
                        `• Supprimez des versions anciennes\n` +
                        `• Réduisez le nombre de notes\n\n` +
                        `Voulez-vous exporter maintenant ?`,
                        'danger'
                    );
                } else if (percentage >= 80 && !storageWarningShown) {
                    storageWarningShown = true;
                    showStorageAlert(
                        '⚠️ Espace limité',
                        `Vous avez utilisé ${Math.round(percentage)}% de l'espace disponible.\n\n` +
                        `Recommandations :\n` +
                        `• Exportez régulièrement votre projet\n` +
                        `• Surveillez votre utilisation\n` +
                        `• Pensez à nettoyer les anciennes versions`,
                        'warning'
                    );
                }
                
                // Reset warnings if space freed
                if (percentage < 80) {
                    storageWarningShown = false;
                    storageCriticalShown = false;
                }
            } catch (error) {
                console.error('❌ Erreur vérification quota:', error);
            }
        }

        function showStorageAlert(title, message, level) {
            if (confirm(`${title}\n\n${message}`)) {
                if (level === 'danger') {
                    showExportModal();
                } else {
                    showStorageDetails();
                }
            }
        }

        async function showStorageDetails() {
            try {
                const { used, quota } = await getStorageSize();
                const percentage = Math.min(100, Math.round((used / quota) * 100));
                const available = quota - used;
                
                // Update storage bar
                const barFill = document.getElementById('storage-bar-fill');
                const barText = document.getElementById('storage-bar-text');
                
                if (barFill && barText) {
                    barFill.style.width = percentage + '%';
                    barText.textContent = percentage + '%';
                    
                    // Update bar color
                    barFill.className = 'storage-bar-fill';
                    if (percentage >= 95) {
                        barFill.classList.add('danger');
                    } else if (percentage >= 80) {
                        barFill.classList.add('warning');
                    } else {
                        barFill.classList.add('ok');
                    }
                }
                
                // Update stats
                const usedEl = document.getElementById('storage-used');
                const availableEl = document.getElementById('storage-available');
                
                if (usedEl) usedEl.textContent = formatBytes(used);
                if (availableEl) availableEl.textContent = formatBytes(available);
                
                // Update recommendations
                const recommendationsContainer = document.getElementById('storage-recommendations-container');
                const recommendationsDetails = document.getElementById('storage-recommendations-details');
                const recommendationsSummary = recommendationsDetails ? recommendationsDetails.querySelector('summary') : null;
                
                if (recommendationsContainer && recommendationsSummary) {
                    let recommendations = '';
                    let summaryText = '';
                    let summaryColor = 'var(--accent-green)';
                    
                    if (percentage >= 95) {
                        summaryText = '🚨 Actions urgentes';
                        summaryColor = 'var(--accent-red)';
                        recommendations = `
                            <ul style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; padding-left: 1.25rem; margin: 0;">
                                <li>Exportez immédiatement votre projet en JSON</li>
                                <li>Supprimez des versions anciennes</li>
                                <li>Réduisez le nombre de notes archivées</li>
                            </ul>
                        `;
                        // Ouvrir automatiquement si urgent
                        recommendationsDetails.open = true;
                    } else if (percentage >= 80) {
                        summaryText = '⚠️ Attention requise';
                        summaryColor = 'var(--accent-gold)';
                        recommendations = `
                            <ul style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; padding-left: 1.25rem; margin: 0;">
                                <li>Exportez régulièrement votre projet</li>
                                <li>Surveillez l'évolution de votre utilisation</li>
                                <li>Nettoyez les versions inutilisées</li>
                            </ul>
                        `;
                    } else {
                        summaryText = '✅ Espace suffisant';
                        summaryColor = 'var(--accent-green)';
                        recommendations = `
                            <ul style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; padding-left: 1.25rem; margin: 0;">
                                <li>Continuez à exporter régulièrement</li>
                                <li>Votre projet est dans la limite normale</li>
                                <li>IndexedDB : ${formatBytes(quota)} disponibles</li>
                            </ul>
                        `;
                    }
                    
                    recommendationsSummary.textContent = summaryText;
                    recommendationsSummary.style.color = summaryColor;
                    recommendationsContainer.innerHTML = recommendations;
                }
                
                // Show modal using Plume's modal system
                const modal = document.getElementById('storage-modal');
                if (modal) {
                    modal.classList.add('active');
                } else {
                    console.error('Modal storage-modal not found!');
                }
            } catch (error) {
                console.error('❌ Erreur affichage détails stockage:', error);
            }
        }

        function handleStorageError() {
            alert(
                '🚨 ERREUR DE SAUVEGARDE\n\n' +
                'Impossible de sauvegarder : espace de stockage insuffisant.\n\n' +
                'Actions à faire MAINTENANT :\n' +
                '1. Exportez votre projet en JSON\n' +
                '2. Supprimez des versions anciennes\n' +
                '3. Libérez de l\'espace\n\n' +
                'Sans cela, vos modifications récentes seront perdues !'
            );
            showStorageDetails();
        }

        // Avertir avant de quitter si l'espace est critique
        window.addEventListener('beforeunload', async function(e) {
            try {
                const { used, quota } = await getStorageSize();
                const percentage = (used / quota) * 100;
                
                if (percentage >= 95) {
                    e.preventDefault();
                    e.returnValue = 'ATTENTION : Votre espace de stockage est presque plein. Pensez à exporter votre projet !';
                    return e.returnValue;
                }
            } catch (error) {
                console.error('❌ Erreur vérification avant fermeture:', error);
            }
        });

        // ============================================
        // END STORAGE QUOTA MONITORING FUNCTIONS
        // ============================================