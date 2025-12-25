// ============================================
// ECOZEO SPA - APP.JS v3.0
// Ultra Limpio - Solo lo esencial
// ============================================

const App = {
    currentView: 'inicio',

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    init: function() {
        console.log('🚀 Iniciando Ecozeo SPA v3.0');
        
        this.loadComponents();
        this.setupNavigation();
        this.setupHashListener();
        this.loadInitialView();
    },

    // ============================================
    // CARGAR COMPONENTES (navbar y footer)
    // ============================================
    loadComponents: async function() {
        // Cargar navbar
        const navResponse = await fetch('views/navbar.html');
        const navHtml = await navResponse.text();
        document.getElementById('navbar-container').innerHTML = navHtml;
        
        // Cargar footer
        const footerResponse = await fetch('views/footer.html');
        const footerHtml = await footerResponse.text();
        document.getElementById('footer-container').innerHTML = footerHtml;
        
        console.log('✅ Componentes cargados');
        
        // Inicializar navbar después de cargarlo
        this.initNavbar();
    },

    // ============================================
    // INICIALIZAR NAVBAR
    // ============================================
    initNavbar: function() {
        console.log('🔧 Inicializando navbar');
        
        const navMenu = document.getElementById('navMenu');
        const menuToggle = document.getElementById('menuToggle');
        
        // Links de navegación
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-nav');
                console.log(`👆 Click en: ${view}`);
                window.location.hash = view;
                
                // Cerrar menú móvil al hacer click en un link
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    console.log('📱 Menú móvil cerrado (cambio de pestaña)');
                }
            });
        });
        
        // Toggle del menú móvil
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('active');
                console.log(`📱 Menú móvil ${navMenu.classList.contains('active') ? 'abierto' : 'cerrado'}`);
            });
            
            // Cerrar menú al hacer click fuera
            document.addEventListener('click', (e) => {
                if (navMenu.classList.contains('active')) {
                    const isClickInsideMenu = navMenu.contains(e.target);
                    const isClickOnToggle = menuToggle.contains(e.target);
                    
                    if (!isClickInsideMenu && !isClickOnToggle) {
                        navMenu.classList.remove('active');
                        console.log('📱 Menú móvil cerrado (click fuera)');
                    }
                }
            });
        }
        
        // Selector de idioma
        this.setupLanguageSelector(navMenu);
    },

    // ============================================
    // SELECTOR DE IDIOMA
    // ============================================
    setupLanguageSelector: function(navMenu) {
        const selector = document.getElementById('languageSelector');
        const dropdown = document.getElementById('languageDropdown');
        
        if (!selector || !dropdown) return;
        
        // Abrir/cerrar dropdown
        selector.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        // Seleccionar idioma
        document.querySelectorAll('.language-dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const lang = item.getAttribute('data-lang');
                console.log(`🌍 Cambiando idioma a: ${lang}`);
                
                // Guardar en localStorage
                localStorage.setItem('ecozeo_language', lang);
                
                // Actualizar display
                this.updateLanguageDisplay(lang);
                
                // Traducir página
                if (typeof translatePage === 'function') {
                    translatePage(lang);
                }
                
                // Cerrar dropdown
                dropdown.classList.remove('show');
                
                // Cerrar menú móvil al cambiar idioma
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    console.log('📱 Menú móvil cerrado (cambio de idioma)');
                }
            });
        });
        
        // Cerrar al hacer click fuera
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
        
        // Inicializar idioma
        const currentLang = localStorage.getItem('ecozeo_language') || 'es';
        console.log(`🔧 Inicializando selector de idioma con: ${currentLang}`);
        this.updateLanguageDisplay(currentLang);
    },

    updateLanguageDisplay: function(lang) {
        console.log(`🎨 Actualizando display de idioma a: ${lang}`);
        
        const flags = {
            'es': 'https://flagcdn.com/w40/es.png',
            'en': 'https://flagcdn.com/w40/us.png'
        };
        
        const currentFlagImg = document.getElementById('currentFlagImg');
        const currentLangText = document.getElementById('currentLangText');
        
        console.log(`🖼️ currentFlagImg existe: ${!!currentFlagImg}`);
        console.log(`📝 currentLangText existe: ${!!currentLangText}`);
        
        if (currentFlagImg) currentFlagImg.src = flags[lang];
        if (currentLangText) currentLangText.textContent = lang.toUpperCase();
        
        // Marcar activo
        document.querySelectorAll('.language-dropdown-item').forEach(item => {
            if (item.getAttribute('data-lang') === lang) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    // ============================================
    // NAVEGACIÓN
    // ============================================
    setupNavigation: function() {
        console.log('🔗 Configurando navegación');
        // Ya no necesitamos hacer nada aquí
        // Los links ya se manejan en initNavbar
    },

    setupHashListener: function() {
        console.log('🔗 Configurando listener de hash');
        
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'inicio';
            console.log(`🔄 Hash cambió a: ${hash}`);
            this.loadView(hash);
        });
    },

    loadInitialView: function() {
        const hash = window.location.hash.slice(1) || 'inicio';
        console.log(`🏠 Cargando vista inicial: ${hash}`);
        this.loadView(hash);
    },

    // ============================================
    // CARGAR VISTA
    // ============================================
    loadView: async function(view) {
        console.log(`📄 Cargando: ${view}`);
        
        const container = document.getElementById('content-container');
        
        // Mostrar loading
        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        try {
            // Fetch de la vista
            const response = await fetch(`views/${view}.html`);
            
            if (!response.ok) {
                throw new Error('Vista no encontrada');
            }
            
            const html = await response.text();
            
            // Insertar HTML
            container.innerHTML = html;
            
            // Fade in
            const firstElement = container.firstElementChild;
            if (firstElement) {
                firstElement.classList.add('fade-in');
            }
            
            // Actualizar navbar activo
            this.updateActiveNav(view);
            
            // Scroll arriba
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Guardar vista actual
            this.currentView = view;
            
            console.log(`✅ Vista cargada: ${view}`);
            
            // Aplicar traducciones
            this.applyTranslations();
            
            // Ejecutar scripts específicos de la vista
            this.executeViewScripts(view);
            
        } catch (error) {
            console.error('❌ Error:', error);
            container.innerHTML = '<div class="error-page"><h1>Error 404</h1><p>Vista no encontrada</p></div>';
        }
    },

    updateActiveNav: function(view) {
        document.querySelectorAll('[data-nav]').forEach(link => {
            const linkView = link.getAttribute('data-nav');
            if (linkView === view) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    // ============================================
    // TRADUCCIONES
    // ============================================
    applyTranslations: function() {
        setTimeout(() => {
            if (typeof translatePage === 'function') {
                const lang = localStorage.getItem('ecozeo_language') || 'es';
                console.log(`🌐 Traduciendo a: ${lang}`);
                translatePage(lang);
                
                // Remover overlay después de que empiecen las traducciones
                setTimeout(() => {
                    const overlay = document.getElementById('page-overlay');
                    if (overlay) {
                        overlay.classList.add('fade-out');
                    }
                }, 300);
            }
        }, 200);
    },

    // ============================================
    // SCRIPTS ESPECÍFICOS POR VISTA
    // ============================================
    executeViewScripts: function(view) {
        console.log(`🔧 Ejecutando scripts para: ${view}`);
        
        if (view === 'soluciones') {
            this.initSoluciones();
        }
    },

    // ============================================
    // VISTA SOLUCIONES
    // ============================================
    initSoluciones: function() {
        console.log('🌱 [SOLUCIONES] Inicializando...');
        
        setTimeout(() => {
            // Event listeners para cards
            document.querySelectorAll('.product-card-showcase').forEach(card => {
                const productId = card.getAttribute('data-product');
                
                // Click en el card (excepto en el botón)
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.product-cta')) {
                        console.log(`👆 [SOLUCIONES] Click en card: ${productId}`);
                        this.openModal(productId);
                    }
                });
                
                // Click específico en el botón "Ver más"
                const btn = card.querySelector('.product-cta');
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation(); // Evitar doble evento
                        console.log(`🔘 [SOLUCIONES] Click en botón Ver más: ${productId}`);
                        this.openModal(productId);
                    });
                }
            });
            
            // Event listeners para botones de cerrar
            document.querySelectorAll('[data-close-modal]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const productId = btn.getAttribute('data-close-modal');
                    console.log(`❌ [SOLUCIONES] Cerrar modal: ${productId}`);
                    this.closeModal(productId);
                });
            });
            
            // Event listeners para botones de contacto
            document.querySelectorAll('[data-contact]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const productId = btn.getAttribute('data-contact');
                    console.log(`📧 [SOLUCIONES] Contactar sobre: ${productId}`);
                    // Aquí puedes redirigir a contacto o abrir un formulario
                    window.location.hash = 'contacto';
                });
            });
            
            // Event listeners para botones de ficha técnica
            document.querySelectorAll('[data-open-ficha]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const productId = btn.getAttribute('data-open-ficha');
                    console.log(`📄 [SOLUCIONES] Abrir ficha técnica: ${productId}`);
                    this.openFichaTecnica(productId);
                });
            });
            
            // Event listeners para visor PDF
            const closePdfBtn = document.getElementById('close-pdf-btn');
            if (closePdfBtn) {
                closePdfBtn.addEventListener('click', () => {
                    console.log('❌ [SOLUCIONES] Cerrar PDF');
                    this.closePdfViewer();
                });
            }
            
            // Cerrar PDF con click fuera
            const pdfViewer = document.getElementById('pdf-viewer');
            if (pdfViewer) {
                pdfViewer.addEventListener('click', (e) => {
                    if (e.target === pdfViewer) {
                        console.log('❌ [SOLUCIONES] Click fuera del PDF');
                        this.closePdfViewer();
                    }
                });
            }
            
            // Cerrar modal al hacer click fuera
            document.querySelectorAll('.product-modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        console.log('❌ [SOLUCIONES] Click fuera del modal');
                        modal.classList.remove('show');
                        document.body.style.overflow = 'auto';
                    }
                });
            });
            
            // Cerrar modal con tecla ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    // Cerrar visor PDF si está abierto (prioridad)
                    const pdfViewer = document.querySelector('#pdf-viewer.show');
                    if (pdfViewer) {
                        console.log('⌨️ [SOLUCIONES] ESC - Cerrando PDF');
                        this.closePdfViewer();
                        return;
                    }
                    
                    // Cerrar modal si está abierto
                    const openModal = document.querySelector('.product-modal.show');
                    if (openModal) {
                        console.log('⌨️ [SOLUCIONES] ESC - Cerrando modal');
                        openModal.classList.remove('show');
                        document.body.style.overflow = 'auto';
                    }
                }
            });
            
            // Inicializar sliders
            this.initSliders();
            
            console.log('✅ [SOLUCIONES] Scripts inicializados');
        }, 300);
    },

    openModal: function(productId) {
        console.log(`🔓 [MODAL] Abriendo: ${productId}`);
        
        const modal = document.getElementById(`modal-${productId}`);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Resetear scroll del modal a la parte superior
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.scrollTop = 0;
                console.log('📜 [MODAL] Scroll reseteado a top');
            }
            
            // Traducir instantáneamente solo los elementos del modal (sin animación)
            if (typeof translateInstant === 'function') {
                const lang = localStorage.getItem('ecozeo_language') || 'es';
                translateInstant(lang, modal);
            }
        } else {
            console.error(`❌ [MODAL] No encontrado: modal-${productId}`);
        }
    },

    closeModal: function(productId) {
        console.log(`🔒 [MODAL] Cerrando: ${productId}`);
        
        const modal = document.getElementById(`modal-${productId}`);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    },

    // ============================================
    // FICHA TÉCNICA
    // ============================================
    openFichaTecnica: function(productId) {
        console.log(`📄 [FICHA] Abriendo ficha: ${productId}`);
        
        const pdfViewer = document.getElementById('pdf-viewer');
        const canvasContainer = document.getElementById('pdf-canvas-container');
        
        if (!pdfViewer || !canvasContainer) {
            console.error('❌ [FICHA] Visor no encontrado');
            return;
        }
        
        // Obtener idioma actual
        const lang = localStorage.getItem('ecozeo_language') || 'es';
        
        // Rutas de los PDFs según producto e idioma
        const fichas = {
            'nanozeo': {
                'es': 'docs/Nano-Zeo_Ficha-Tecnica_ES.pdf',
                'en': 'docs/Nano-Zeo_Technical-Datasheet_EN.pdf'
            },
            'nanozeoag': {
                'es': 'docs/Nano-ZeoAg_Ficha-Tecnica_ES.pdf',
                'en': 'docs/Nano-ZeoAg_Technical-Datasheet_EN.pdf'
            }
        };
        
        // Cargar PDF con PDF.js
        if (fichas[productId] && fichas[productId][lang]) {
            const pdfUrl = fichas[productId][lang];
            
            // Mostrar el visor
            pdfViewer.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Cargar PDF con PDF.js
            this.loadPDF(pdfUrl);
            
            console.log(`✅ [FICHA] PDF cargado: ${pdfUrl}`);
        } else {
            console.error(`❌ [FICHA] No se encontró PDF para: ${productId} (${lang})`);
            alert('Ficha técnica no disponible');
        }
    },

    loadPDF: function(url) {
        const container = document.getElementById('pdf-canvas-container');
        container.innerHTML = '<div class="pdf-loading">Cargando PDF...</div>';
        
        // Cargar PDF.js desde CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const loadingTask = pdfjsLib.getDocument(url);
            loadingTask.promise.then(pdf => {
                console.log('PDF cargado:', pdf.numPages, 'páginas');
                
                // Actualizar contador de páginas
                const pageCount = document.getElementById('pdf-page-count');
                const mobilePageCount = document.getElementById('mobile-page-count');
                
                if (pageCount) pageCount.textContent = pdf.numPages;
                if (mobilePageCount) mobilePageCount.textContent = pdf.numPages;
                
                let currentPage = 1;
                let currentScale = 1.5;
                let canvas, wrapper;
                let isRendering = false; // Flag para prevenir renders simultáneos
                
                // Variables para swipe
                let touchStartX = 0;
                let touchEndX = 0;
                
                const updateZoomDisplay = () => {
                    const zoomValue = document.getElementById('pdf-zoom-value');
                    if (zoomValue) {
                        zoomValue.textContent = Math.round(currentScale * 100);
                    }
                };
                
                const renderPage = (pageNum) => {
                    // Prevenir renders simultáneos
                    if (isRendering) {
                        console.log('⏳ Render en progreso, esperando...');
                        return;
                    }
                    
                    console.log('🔄 Iniciando render de página:', pageNum);
                    isRendering = true;
                    
                    pdf.getPage(pageNum).then(page => {
                        console.log('📄 Página obtenida:', pageNum);
                        
                        // Escala adaptativa para móvil
                        const isMobile = window.innerWidth <= 768;
                        const baseScale = isMobile ? 1.2 : 1.5;
                        const viewport = page.getViewport({ scale: baseScale * currentScale });
                        
                        if (!canvas) {
                            canvas = document.createElement('canvas');
                            wrapper = document.createElement('div');
                            wrapper.id = 'pdf-canvas-wrapper';
                            wrapper.appendChild(canvas);
                        }
                        
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        
                        container.innerHTML = '';
                        container.appendChild(wrapper);
                        
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        
                        // Renderizar y luego liberar el flag
                        const renderTask = page.render(renderContext);
                        
                        renderTask.promise.then(() => {
                            console.log('✅ Página renderizada exitosamente:', pageNum);
                            isRendering = false;
                            
                            // Actualizar número de página
                            const pageNumEl = document.getElementById('pdf-page-num');
                            const mobilePageNumEl = document.getElementById('mobile-page-num');
                            
                            if (pageNumEl) pageNumEl.textContent = pageNum;
                            if (mobilePageNumEl) mobilePageNumEl.textContent = pageNum;
                            
                            // Actualizar botones
                            const prevBtn = document.getElementById('pdf-prev');
                            const nextBtn = document.getElementById('pdf-next');
                            
                            if (prevBtn) prevBtn.disabled = pageNum <= 1;
                            if (nextBtn) nextBtn.disabled = pageNum >= pdf.numPages;
                            
                        }).catch(error => {
                            console.error('❌ Error en render task:', error);
                            isRendering = false;
                        });
                        
                        // Touch events para swipe (solo móvil) - solo agregar una vez
                        if (isMobile && !canvas.dataset.swipeAdded) {
                            canvas.dataset.swipeAdded = 'true';
                            
                            canvas.addEventListener('touchstart', (e) => {
                                touchStartX = e.changedTouches[0].screenX;
                            }, { passive: true });
                            
                            canvas.addEventListener('touchend', (e) => {
                                touchEndX = e.changedTouches[0].screenX;
                                handleSwipe();
                            }, { passive: true });
                        }
                        
                    }).catch(error => {
                        console.error('❌ Error obteniendo página:', error);
                        isRendering = false;
                    });
                };
                
                const handleSwipe = () => {
                    // No hacer nada si ya está renderizando
                    if (isRendering) {
                        console.log('⏳ Swipe ignorado - renderizando...');
                        return;
                    }
                    
                    const swipeThreshold = 50;
                    const diff = touchStartX - touchEndX;
                    
                    if (Math.abs(diff) > swipeThreshold) {
                        if (diff > 0 && currentPage < pdf.numPages) {
                            // Swipe izquierda - página siguiente
                            currentPage++;
                            renderPage(currentPage);
                        } else if (diff < 0 && currentPage > 1) {
                            // Swipe derecha - página anterior
                            currentPage--;
                            renderPage(currentPage);
                        }
                    }
                };
                
                // Renderizar primera página
                renderPage(currentPage);
                updateZoomDisplay();
                
                // Navegación con botones
                const prevBtn = document.getElementById('pdf-prev');
                const nextBtn = document.getElementById('pdf-next');
                
                if (prevBtn) {
                    prevBtn.onclick = () => {
                        if (currentPage > 1) {
                            currentPage--;
                            renderPage(currentPage);
                        }
                    };
                }
                
                if (nextBtn) {
                    nextBtn.onclick = () => {
                        if (currentPage < pdf.numPages) {
                            currentPage++;
                            renderPage(currentPage);
                        }
                    };
                }
                
                // Controles de zoom
                const zoomInBtn = document.getElementById('pdf-zoom-in');
                const zoomOutBtn = document.getElementById('pdf-zoom-out');
                
                if (zoomInBtn) {
                    zoomInBtn.onclick = () => {
                        if (currentScale < 3) {
                            currentScale += 0.25;
                            renderPage(currentPage);
                            updateZoomDisplay();
                        }
                    };
                }
                
                if (zoomOutBtn) {
                    zoomOutBtn.onclick = () => {
                        if (currentScale > 0.5) {
                            currentScale -= 0.25;
                            renderPage(currentPage);
                            updateZoomDisplay();
                        }
                    };
                }
                
                // Pinch to zoom para móvil
                if ('ontouchstart' in window) {
                    let initialDistance = 0;
                    let initialScale = currentScale;
                    
                    container.addEventListener('touchstart', (e) => {
                        if (e.touches.length === 2) {
                            e.preventDefault();
                            const touch1 = e.touches[0];
                            const touch2 = e.touches[1];
                            initialDistance = Math.hypot(
                                touch2.pageX - touch1.pageX,
                                touch2.pageY - touch1.pageY
                            );
                            initialScale = currentScale;
                        }
                    });
                    
                    container.addEventListener('touchmove', (e) => {
                        if (e.touches.length === 2) {
                            e.preventDefault();
                            const touch1 = e.touches[0];
                            const touch2 = e.touches[1];
                            const distance = Math.hypot(
                                touch2.pageX - touch1.pageX,
                                touch2.pageY - touch1.pageY
                            );
                            
                            const scale = (distance / initialDistance) * initialScale;
                            if (scale >= 0.5 && scale <= 3) {
                                currentScale = scale;
                                renderPage(currentPage);
                                updateZoomDisplay();
                            }
                        }
                    });
                }
                
                // Mostrar hint de swipe en móvil
                if (window.innerWidth <= 768) {
                    const hint = document.querySelector('.pdf-swipe-hint');
                    if (hint) {
                        setTimeout(() => {
                            hint.style.animation = 'fadeInOut 3s ease-in-out';
                        }, 500);
                    }
                }
            }).catch(error => {
                console.error('Error cargando PDF:', error);
                container.innerHTML = '<div class="pdf-loading">Error al cargar el PDF</div>';
            });
        };
        
        if (!document.querySelector('script[src*="pdf.js"]')) {
            document.head.appendChild(script);
        } else {
            script.onload();
        }
    },

    closePdfViewer: function() {
        console.log('🔒 [FICHA] Cerrando visor PDF');
        
        const pdfViewer = document.getElementById('pdf-viewer');
        
        if (pdfViewer) {
            pdfViewer.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Limpiar contenedor
            const container = document.getElementById('pdf-canvas-container');
            if (container) {
                container.innerHTML = '<div class="pdf-loading">Cargando PDF...</div>';
            }
            
            console.log('✅ [FICHA] Visor cerrado');
        }
    },


    // ============================================
    // SLIDER DE GALERÍA
    // ============================================
    initSliders: function() {
        console.log('🎠 [SLIDER] Inicializando sliders...');
        
        const sliders = {};
        
        // Inicializar cada slider
        document.querySelectorAll('[data-slider]').forEach(track => {
            const sliderId = track.getAttribute('data-slider');
            sliders[sliderId] = {
                track: track,
                currentIndex: 0,
                totalSlides: track.querySelectorAll('.slider-slide').length
            };
            
            console.log(`🎠 [SLIDER] Slider ${sliderId}: ${sliders[sliderId].totalSlides} slides`);
        });
        
        // Botones prev
        document.querySelectorAll('[data-slider-prev]').forEach(btn => {
            btn.addEventListener('click', () => {
                const sliderId = btn.getAttribute('data-slider-prev');
                this.sliderGo(sliders[sliderId], -1);
            });
        });
        
        // Botones next
        document.querySelectorAll('[data-slider-next]').forEach(btn => {
            btn.addEventListener('click', () => {
                const sliderId = btn.getAttribute('data-slider-next');
                this.sliderGo(sliders[sliderId], 1);
            });
        });
        
        // Dots
        document.querySelectorAll('[data-slider-dot]').forEach(dot => {
            dot.addEventListener('click', () => {
                const sliderId = dot.getAttribute('data-slider-dot');
                const index = parseInt(dot.getAttribute('data-index'));
                this.sliderGoTo(sliders[sliderId], index);
            });
        });
        
        // Touch events para swipe en móviles
        document.querySelectorAll('.slider-container').forEach(container => {
            const track = container.querySelector('[data-slider]');
            const sliderId = track.getAttribute('data-slider');
            const slider = sliders[sliderId];
            
            let touchStartX = 0;
            let touchEndX = 0;
            
            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(slider, touchStartX, touchEndX);
            }, { passive: true });
        });
        
        // Guardar referencia para acceso global
        this.sliders = sliders;
        
        console.log('✅ [SLIDER] Sliders inicializados (con soporte swipe 📱)');
    },

    handleSwipe: function(slider, startX, endX) {
        const swipeThreshold = 50; // Mínimo de píxeles para considerar un swipe
        const diff = startX - endX;
        
        if (Math.abs(diff) < swipeThreshold) {
            return; // No es un swipe válido
        }
        
        if (diff > 0) {
            // Swipe izquierda → siguiente
            console.log('👈 [SWIPE] Izquierda → Siguiente');
            this.sliderGo(slider, 1);
        } else {
            // Swipe derecha → anterior
            console.log('👉 [SWIPE] Derecha → Anterior');
            this.sliderGo(slider, -1);
        }
    },

    sliderGo: function(slider, direction) {
        if (!slider) return;
        
        slider.currentIndex += direction;
        
        // Loop circular
        if (slider.currentIndex < 0) {
            slider.currentIndex = slider.totalSlides - 1;
        } else if (slider.currentIndex >= slider.totalSlides) {
            slider.currentIndex = 0;
        }
        
        this.sliderUpdate(slider);
    },

    sliderGoTo: function(slider, index) {
        if (!slider) return;
        slider.currentIndex = index;
        this.sliderUpdate(slider);
    },

    sliderUpdate: function(slider) {
        if (!slider) return;
        
        // Mover el track
        const offset = -slider.currentIndex * 100;
        slider.track.style.transform = `translateX(${offset}%)`;
        
        // Actualizar dots
        const sliderId = slider.track.getAttribute('data-slider');
        document.querySelectorAll(`[data-slider-dot="${sliderId}"]`).forEach((dot, index) => {
            if (index === slider.currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        console.log(`🎠 [SLIDER] ${sliderId} → Slide ${slider.currentIndex + 1}/${slider.totalSlides}`);
    }
};

// Exponer App globalmente
window.App = App;

// ============================================
// INICIAR CUANDO DOM ESTÉ LISTO
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}
