// ============================================
// Module: ui/floating-editor
// Floating Editor Menu (Mobile) - Plume Writer
// ============================================

        // ============================================
        // FLOATING EDITOR MENU (MOBILE)
        // ============================================
        // GESTES TACTILES POUR L'ÉDITEUR
        // ============================================
        
        function initEditorGestures() {
            const editor = document.querySelector('.editor-textarea');
            if (!editor) return;
            
            let lastTap = 0;
            let initialPinchDistance = 0;
            let initialFontSize = 16;
            
            // Double-tap pour mode focus
            editor.addEventListener('touchend', (e) => {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                
                if (tapLength < 300 && tapLength > 0) {
                    // Double-tap détecté
                    e.preventDefault();
                    toggleFocusMode();
                }
                lastTap = currentTime;
            });
            
            // Swipe à 2 doigts pour annuler/refaire
            let touchStartY = 0;
            editor.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    touchStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                    
                    // Calculer distance initiale pour pinch
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
                    
                    const computedStyle = window.getComputedStyle(editor);
                    initialFontSize = parseFloat(computedStyle.fontSize);
                }
            });
            
            editor.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2) {
                    // Pinch to zoom font size
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    const currentDistance = Math.sqrt(dx * dx + dy * dy);
                    
                    const scale = currentDistance / initialPinchDistance;
                    const newFontSize = Math.max(12, Math.min(24, initialFontSize * scale));
                    
                    editor.style.fontSize = newFontSize + 'px';
                }
            });
            
            editor.addEventListener('touchend', (e) => {
                if (e.changedTouches.length === 2) {
                    const touchEndY = touchStartY;
                    const deltaY = touchEndY - touchStartY;
                    
                    // Swipe vers le haut = annuler
                    if (deltaY < -50) {
                        e.preventDefault();
                        undo();
                    }
                    // Swipe vers le bas = refaire
                    else if (deltaY > 50) {
                        e.preventDefault();
                        redo();
                    }
                }
            });
        }
        
        // ============================================
        // FLOATING EDITOR MENU (MOBILE)
        // ============================================
        
        let floatingMenuPosition = null;
        let isDraggingFloatingMenu = false;
        let dragOffset = { x: 0, y: 0 };

        function initFloatingEditorMenu() {
            const menu = document.getElementById('floatingEditorMenu');
            const handle = document.getElementById('floatingMenuHandle');
            const toggleBtn = document.getElementById('floatingEditorToggle');
            
            if (!menu || !handle) {
                console.error('❌ Menu flottant ou handle non trouvé');
                return;
            }

            if (!toggleBtn) {
                console.error('❌ Bouton toggle non trouvé');
                return;
            }

            // Ajouter le listener au bouton toggle
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleFloatingEditorMenu();
            });

            console.log('✅ Menu flottant initialisé');
            
            // Load saved position or set default
            const savedPos = localStorage.getItem('floatingMenuPosition');
            if (savedPos) {
                try {
                    floatingMenuPosition = JSON.parse(savedPos);
                    console.log('📍 Position chargée:', floatingMenuPosition);
                } catch (e) {
                    console.error('Erreur chargement position:', e);
                    floatingMenuPosition = null;
                }
            }
            
            if (!floatingMenuPosition) {
                // Default position: center of screen
                floatingMenuPosition = {
                    x: Math.max(10, (window.innerWidth / 2) - 150),
                    y: Math.max(10, (window.innerHeight / 2) - 200)
                };
                console.log('📍 Position par défaut:', floatingMenuPosition);
            }

            // Setup drag - TOUCH
            handle.addEventListener('touchstart', function(e) {
                console.log('👆 TOUCH START - isDragging avant:', isDraggingFloatingMenu);
                isDraggingFloatingMenu = true;
                console.log('👆 TOUCH START - isDragging après:', isDraggingFloatingMenu);
                
                const touch = e.touches[0];
                const rect = menu.getBoundingClientRect();
                
                dragOffset.x = touch.clientX - rect.left;
                dragOffset.y = touch.clientY - rect.top;
                
                handle.style.background = 'var(--accent-red)';
                console.log('🎯 Touch:', touch.clientX, touch.clientY);
                console.log('🎯 Rect:', rect.left, rect.top, rect.width, rect.height);
                console.log('🎯 Drag offset:', dragOffset);
                
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });

            // Setup drag - MOUSE (pour test desktop)
            handle.addEventListener('mousedown', function(e) {
                console.log('🖱️ MOUSE DOWN');
                isDraggingFloatingMenu = true;
                const rect = menu.getBoundingClientRect();
                
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
                
                handle.style.background = 'var(--accent-red)';
                
                e.preventDefault();
                e.stopPropagation();
            });

            console.log('✅ Drag handlers installés sur handle');
        }

        // TOUCH MOVE - au niveau global
        document.addEventListener('touchmove', function(e) {
            console.log('👆 TOUCH MOVE event - isDragging:', isDraggingFloatingMenu);
            
            if (!isDraggingFloatingMenu) return;
            
            console.log('👆 TOUCH MOVE - vraiment en train de bouger!');
            const menu = document.getElementById('floatingEditorMenu');
            const handle = document.getElementById('floatingMenuHandle');
            const touch = e.touches[0];
            
            const newX = touch.clientX - dragOffset.x;
            const newY = touch.clientY - dragOffset.y;
            
            console.log('📍 Nouvelle position calculée:', newX, newY);
            
            floatingMenuPosition.x = Math.max(10, Math.min(newX, window.innerWidth - menu.offsetWidth - 10));
            floatingMenuPosition.y = Math.max(10, Math.min(newY, window.innerHeight - menu.offsetHeight - 10));
            
            console.log('📍 Position finale:', floatingMenuPosition);
            
            menu.style.transform = 'none';
            menu.style.left = floatingMenuPosition.x + 'px';
            menu.style.top = floatingMenuPosition.y + 'px';
            
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });

        // TOUCH END - au niveau global
        document.addEventListener('touchend', function(e) {
            console.log('👆 TOUCH END - isDragging:', isDraggingFloatingMenu);
            
            if (!isDraggingFloatingMenu) return;
            
            console.log('👆 TOUCH END - Position finale:', floatingMenuPosition);
            isDraggingFloatingMenu = false;
            
            const handle = document.getElementById('floatingMenuHandle');
            if (handle) handle.style.background = 'var(--accent-gold)';
            
            localStorage.setItem('floatingMenuPosition', JSON.stringify(floatingMenuPosition));
            console.log('💾 Position sauvegardée');
        });

        // MOUSE MOVE - au niveau global
        document.addEventListener('mousemove', function(e) {
            if (!isDraggingFloatingMenu) return;
            
            console.log('🖱️ MOUSE MOVE');
            const menu = document.getElementById('floatingEditorMenu');
            
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            
            floatingMenuPosition.x = Math.max(10, Math.min(newX, window.innerWidth - menu.offsetWidth - 10));
            floatingMenuPosition.y = Math.max(10, Math.min(newY, window.innerHeight - menu.offsetHeight - 10));
            
            menu.style.transform = 'none';
            menu.style.left = floatingMenuPosition.x + 'px';
            menu.style.top = floatingMenuPosition.y + 'px';
            
            e.preventDefault();
        });

        // MOUSE UP - au niveau global
        document.addEventListener('mouseup', function(e) {
            if (!isDraggingFloatingMenu) return;
            
            console.log('🖱️ MOUSE UP - Position finale:', floatingMenuPosition);
            isDraggingFloatingMenu = false;
            
            const handle = document.getElementById('floatingMenuHandle');
            if (handle) handle.style.background = 'var(--accent-gold)';
            
            localStorage.setItem('floatingMenuPosition', JSON.stringify(floatingMenuPosition));
        });

        function updateFloatingMenuPosition() {
            const menu = document.getElementById('floatingEditorMenu');
            if (menu && floatingMenuPosition) {
                menu.style.transform = 'none'; // Annuler le centrage par défaut
                menu.style.left = floatingMenuPosition.x + 'px';
                menu.style.top = floatingMenuPosition.y + 'px';
                console.log('Position mise à jour:', floatingMenuPosition);
            }
        }

        function toggleFloatingEditorMenu() {
            console.log('toggleFloatingEditorMenu appelée');
            const menu = document.getElementById('floatingEditorMenu');
            const toggle = document.getElementById('floatingEditorToggle');
            
            console.log('Menu:', menu);
            console.log('Toggle:', toggle);
            
            if (!menu || !toggle) {
                console.error('Menu ou toggle non trouvé!');
                return;
            }
            
            if (menu.classList.contains('active')) {
                console.log('Fermeture du menu');
                menu.classList.remove('active');
                toggle.textContent = '✏️';
            } else {
                console.log('Ouverture du menu');
                menu.classList.add('active');
                updateFloatingMenuPosition();
                toggle.textContent = '✖️';
            }
        }

        function applyFloatingFormat() {
            const format = document.getElementById('floatingFormatBlock').value;
            document.execCommand('formatBlock', false, format);
            const editor = document.querySelector('.editor-textarea');
            if (editor) editor.focus();
        }

        function changeFloatingTextColor() {
            const color = document.getElementById('floatingTextColor').value;
            document.execCommand('foreColor', false, color);
            const editor = document.querySelector('.editor-textarea');
            if (editor) editor.focus();
        }

        function changeFloatingBackgroundColor() {
            const color = document.getElementById('floatingBgColor').value;
            document.execCommand('hiliteColor', false, color);
            const editor = document.querySelector('.editor-textarea');
            if (editor) editor.focus();
        }

        function insertLink() {
            const url = prompt('URL du lien :');
            if (url) {
                const selection = window.getSelection();
                if (selection.toString()) {
                    document.execCommand('createLink', false, url);
                } else {
                    const text = prompt('Texte du lien :');
                    if (text) {
                        document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${text}</a>`);
                    }
                }
                const editor = document.querySelector('.editor-textarea');
                if (editor) editor.focus();
            }
        }

        function insertImage() {
            const url = prompt('URL de l\'image :');
            if (url) {
                document.execCommand('insertImage', false, url);
                const editor = document.querySelector('.editor-textarea');
                if (editor) editor.focus();
            }
        }

        // ============================================
        // END FLOATING EDITOR MENU
        // ============================================
