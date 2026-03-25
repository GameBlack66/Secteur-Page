       // ⚙️ CONFIGURATION
        const CONFIG = {
            videoListUrl: 'https://gameblack66.github.io/Video-List/RRT.png ',
            demoMode: true,
            
            demoVideos: [
                {
                    id: 1,
                    url: 'https://gameblack66.github.io/Video-List/RRT.png ',
                    user: 'fashion_daily',
                    description: 'Look d\'hiver trop chaud 🔥❄️ <span class="video-hashtags">#mode #style #winter</span>',
                    likes: 2341,
                    comments: 156,
                    avatar: '👗'
                },
                {
                    id: 2,
                    url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
                    user: 'nature_lover',
                    description: 'Le printemps arrive 🌸✨ <span class="video-hashtags">#nature #peace #spring</span>',
                    likes: 8921,
                    comments: 432,
                    avatar: '🌿'
                },
                {
                    id: 3,
                    url: 'https://assets.mixkit.co/videos/preview/mixkit-spinning-around-the-sun-1489-large.mp4',
                    user: 'space_explorer',
                    description: 'Voyage interstellaire 🚀🌌 <span class="video-hashtags">#space #cosmos #galaxy</span>',
                    likes: 15672,
                    comments: 891,
                    avatar: '🪐'
                },
                {
                    id: 4,
                    url: 'https://assets.mixkit.co/videos/preview/mixkit-sea-waves-at-sunset-1162-large.mp4',
                    user: 'ocean_vibes',
                    description: 'Le coucher de soleil parfait 🌅🌊 <span class="video-hashtags">#ocean #sunset #calm</span>',
                    likes: 6543,
                    comments: 287,
                    avatar: '🌊'
                },
                {
                    id: 5,
                    url: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-1165-large.mp4',
                    user: 'urban_explorer',
                    description: 'La ville ne dort jamais 🌃✨ <span class="video-hashtags">#city #night #urban</span>',
                    likes: 4210,
                    comments: 198,
                    avatar: '🏙️'
                }
            ],
            batchSize: 3,
            
            // 🎯 Objectifs de likes pour les confettis
            likeMilestones: [10, 25, 50, 100, 250, 500, 1000]
        };

        // 🧠 État de l'application
        let allVideos = [];
        let currentIndex = 0;
        let isLoading = false;
        let observer = null;
        
        // 🎵 État du son
        let soundEnabled = localStorage.getItem('instaGalaxy_sound') === 'true';
        
        // 🎯 Tracking des likes pour les milestones
        let totalLikesGiven = parseInt(localStorage.getItem('instaGalaxy_totalLikes') || '0');
        let nextMilestoneIndex = 0;

        // 🎵 Sons (URLs libres de droits)
        const SOUNDS = {
            like: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3',
            comment: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-click-2447.mp3',
            share: 'https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-click-900.mp3',
            milestone: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
            notification: 'https://assets.mixkit.co/sfx/preview/mixkit-interface-hint-notification-914.mp3'
        };

        // 🎯 Initialisation
        document.addEventListener('DOMContentLoaded', async () => {
            updateSoundIcon();
            updateMilestoneDisplay();
            await loadVideos();
            setupInfiniteScroll();
            setupTouchGestures();
            setupHeaderInteractions();
            
            // 🎵 Première interaction pour débloquer l'audio
            document.addEventListener('click', enableAudio, { once: true });
            
            setTimeout(() => {
                updateVisibleVideo();
                startAutoPlay();
            }, 500);

            // 🔄 Rotation des notifications (psychologie !)
            startNotificationRotation();
        });

        // 🎵 Activer l'audio après première interaction
        function enableAudio() {
            // Créer un contexte audio pour débloquer le son sur mobile
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.resume();
        }

        // 🎵 Toggle son
        function toggleSound(event) {
            triggerMagic(event.target, event);
            soundEnabled = !soundEnabled;
            localStorage.setItem('instaGalaxy_sound', soundEnabled);
            updateSoundIcon();
            showToast(soundEnabled ? '🔊 Son activé !' : '🔇 Son désactivé');
        }

        function updateSoundIcon() {
            const toggle = document.getElementById('soundToggle');
            toggle.textContent = soundEnabled ? '🔊' : '🔇';
            toggle.classList.toggle('muted', !soundEnabled);
        }

        // 🎵 Jouer un son
        function playSound(soundName) {
            if (!soundEnabled) return;
            
            const audio = new Audio(SOUNDS[soundName]);
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Silencieux si échec
        }

        // 📥 Charger les vidéos
        async function loadVideos() {
            try {
                if (CONFIG.demoMode) {
                    allVideos = [...CONFIG.demoVideos];
                    renderVideos(0, CONFIG.batchSize);
                    return;
                }

                const response = await fetch(CONFIG.videoListUrl);
                if (!response.ok) throw new Error('Network error');
                
                const data = await response.json();
                allVideos = data.videos || [];
                renderVideos(0, CONFIG.batchSize);
                
            } catch (error) {
                console.warn('⚠️ Fallback mode démo:', error.message);
                allVideos = [...CONFIG.demoVideos];
                renderVideos(0, CONFIG.batchSize);
                
                const feed = document.getElementById('video-feed');
                const msg = document.createElement('div');
                msg.className = 'info-msg';
                msg.innerHTML = `
                    <h3>🎬 Mode Démo Activé</h3>
                    <p style="font-size:0.9rem;opacity:0.9">
                        Crée ton fichier JSON ici :<br>
                        <code>${CONFIG.videoListUrl}</code>
                    </p>
                    <button class="follow-btn" style="margin-top:12px" onclick="this.parentElement.remove()">
                        Compris ! ✨
                    </button>
                `;
                feed.prepend(msg);
            }
        }

        // 🎨 Renderer les vidéos
        function renderVideos(startIndex, count) {
            const feed = document.getElementById('video-feed');
            const videosToRender = allVideos.slice(startIndex, startIndex + count);

            videosToRender.forEach((video, index) => {
                const card = document.createElement('div');
                card.className = 'video-card paused';
                card.dataset.index = startIndex + index;
                card.dataset.videoId = video.id;
                
                card.innerHTML = `
                    <video class="video-player" 
                           src="${video.url}" 
                           loop 
                           playsinline 
                           preload="metadata"
                           muted>
                    </video>
                    
                    <div class="play-pause-overlay">▶️</div>
                    <div class="progress-bar"></div>
                    <div class="video-overlay"></div>
                    
                    <div class="video-info">
                        <div class="video-user">
                            <div class="avatar">${video.avatar || '👤'}</div>
                            @${video.user}
                            <button class="follow-btn" onclick="toggleFollow(this, event)">Suivre</button>
                        </div>
                        <div class="video-desc">${video.description}</div>
                        <div class="video-stats">
                            <span>❤️ <strong class="like-count">${formatNumber(video.likes)}</strong></span>
                            <span>💬 ${formatNumber(video.comments)}</span>
                            <span>👁️ ${formatNumber(video.likes * 3)}</span>
                        </div>
                    </div>
                    
                    <div class="actions-panel">
                        <div class="profile-pic-action" onclick="triggerMagic(this, event)">
                            ${video.avatar || '👤'}
                        </div>
                        <button class="action-btn heart-btn" data-action="like">
                            ❤️ <span class="action-count">${formatNumber(video.likes)}</span>
                        </button>
                        <button class="action-btn" data-action="comment">💬</button>
                        <button class="action-btn" data-action="share">🚀</button>
                        <button class="action-btn" data-action="save">🔖</button>
                    </div>
                `;
                
                feed.appendChild(card);
                setupVideoInteractions(card);
            });
        }

        // 🔄 Scroll infini
        function setupInfiniteScroll() {
            observer = new IntersectionObserver((entries) => {
                const lastEntry = entries[entries.length - 1];
                if (lastEntry.isIntersecting && !isLoading) {
                    loadMoreVideos();
                }
            }, { rootMargin: '150px' });
            updateObserver();
        }

        function updateObserver() {
            const cards = document.querySelectorAll('.video-card');
            if (cards.length > 0) {
                observer.observe(cards[cards.length - 1]);
            }
        }

        async function loadMoreVideos() {
            if (isLoading) return;
            
            isLoading = true;
            document.getElementById('loader').classList.add('active');
            
            await new Promise(resolve => setTimeout(resolve, 700));
            
            const nextIndex = currentIndex + CONFIG.batchSize;
            
            if (nextIndex >= allVideos.length) {
                currentIndex = 0; // Boucle infinie
            } else {
                renderVideos(nextIndex, CONFIG.batchSize);
                currentIndex = nextIndex;
            }
            
            isLoading = false;
            document.getElementById('loader').classList.remove('active');
            updateObserver();
        }

        // 👆 Interactions vidéo
        function setupVideoInteractions(card) {
            const video = card.querySelector('.video-player');
            const progressBar = card.querySelector('.progress-bar');
            
            card.addEventListener('click', (e) => {
                if (e.target.closest('.action-btn, .follow-btn, .profile-pic-action')) return;
                
                if (video.paused) {
                    video.play().catch(() => {});
                    card.classList.remove('paused');
                    triggerMagic(e.target, e);
                } else {
                    video.pause();
                    card.classList.add('paused');
                }
            });

            // Double-tap pour liker
            let lastTap = 0;
            card.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTap < 320) {
                    const heartBtn = card.querySelector('.heart-btn');
                    if (!heartBtn.classList.contains('liked')) {
                        heartBtn.click();
                        const rect = heartBtn.getBoundingClientRect();
                        createStars(rect.left + 25, rect.top, '#ff3040');
                    }
                }
                lastTap = now;
            });

            video.addEventListener('timeupdate', () => {
                if (video.duration) {
                    const progress = (video.currentTime / video.duration) * 100;
                    progressBar.style.width = `${progress}%`;
                }
            });

            video.addEventListener('ended', () => {
                video.currentTime = 0;
                video.play().catch(() => {});
            });

            card.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleAction(btn, card, video);
                });
            });
        }

        // ⚡ Gestion des actions
        function handleAction(btn, card, video) {
            const action = btn.dataset.action;
            
            if (navigator.vibrate) navigator.vibrate(35);
            btn.classList.add('shaking');
            setTimeout(() => btn.classList.remove('shaking'), 180);

            const rect = btn.getBoundingClientRect();
            
            switch(action) {
                case 'like':
                    btn.classList.toggle('liked');
                    const countSpan = btn.querySelector('.action-count');
                    const likeCount = card.querySelector('.like-count');
                    let count = parseInt(countSpan.textContent.replace(/[^0-9]/g, '')) || 0;
                    const newCount = btn.classList.contains('liked') ? count + 1 : Math.max(0, count - 1);
                    countSpan.textContent = formatNumber(newCount);
                    likeCount.textContent = formatNumber(newCount);
                    
                    if (btn.classList.contains('liked')) {
                        // 🎵 Son du like
                        playSound('like');
                        
                        // ✨ Étoiles
                        createStars(rect.left + 20, rect.top, '#ff3040');
                        
                        // 📳 Vibration spéciale
                        if (navigator.vibrate) navigator.vibrate([25, 40, 25]);
                        
                        // 🎯 Tracking pour milestones
                        trackLike();
                    }
                    break;
                    
                case 'comment':
                    playSound('comment');
                    createStars(rect.left, rect.top, '#00FFFF');
                    showToast('💬 Ouvrir les commentaires...');
                    break;
                    
                case 'share':
                    playSound('share');
                    createStars(rect.left, rect.top, '#FFD700');
                    if (navigator.share) {
                        navigator.share({
                            title: 'Regarde sur InstaGalaxy !',
                            text: card.querySelector('.video-desc').textContent,
                            url: window.location.href
                        }).catch(() => showToast('🔗 Lien copié !'));
                    } else {
                        showToast('🔗 Lien copié dans le presse-papier !');
                    }
                    break;
                    
                case 'save':
                    playSound('comment');
                    createStars(rect.left, rect.top, '#FFFFFF');
                    btn.innerHTML = btn.innerHTML.includes('✅') ? '🔖 <span class="action-count">Sauv.</span>' : '✅ <span class="action-count">OK</span>';
                    showToast(btn.innerHTML.includes('✅') ? '💾 Enregistré !' : '🗑️ Retiré des favoris');
                    break;
            }
        }

        // 🎯 Tracking des likes pour les milestones
        function trackLike() {
            if (!allVideos.find(v => v.id)?.liked) {
                totalLikesGiven++;
                localStorage.setItem('instaGalaxy_totalLikes', totalLikesGiven);
                checkMilestones();
                updateMilestoneDisplay();
            }
        }

        // 🎊 Vérifier les milestones
        function checkMilestones() {
            const milestones = CONFIG.likeMilestones;
            
            if (nextMilestoneIndex < milestones.length) {
                const nextGoal = milestones[nextMilestoneIndex];
                
                if (totalLikesGiven >= nextGoal) {
                    // 🎉 BOOM Confettis !
                    playSound('milestone');
                    launchConfettis();
                    
                    showToast(`🎉 Objectif ${nextGoal} likes atteint !`);
                    
                    nextMilestoneIndex++;
                    
                    // Sauvegarder la progression
                    localStorage.setItem('instaGalaxy_nextMilestone', nextMilestoneIndex);
                }
            }
        }

        // 🎊 Lancer les confettis
        function launchConfettis() {
            const colors = ['#ff3040', '#f09433', '#00FFFF', '#FFD700', '#bc1888', '#00ff00'];
            
            for (let i = 0; i < 80; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.left = Math.random() * 100 + 'vw';
                    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
                    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                    
                    document.body.appendChild(confetti);
                    setTimeout(() => confetti.remove(), 3000);
                }, i * 30);
            }
        }

        // 📊 Afficher le prochain objectif
        function updateMilestoneDisplay() {
            const counter = document.getElementById('milestoneCounter');
            const goalSpan = document.getElementById('likeGoal');
            const milestones = CONFIG.likeMilestones;
            
            if (nextMilestoneIndex < milestones.length) {
                const nextGoal = milestones[nextMilestoneIndex];
                goalSpan.textContent = nextGoal;
                counter.classList.add('show');
                
                // Cacher après 5 secondes
                setTimeout(() => counter.classList.remove('show'), 5000);
            } else {
                counter.classList.remove('show');
            }
        }

        // 👤 Follow/Unfollow
        function toggleFollow(btn, event) {
            event.stopPropagation();
            if (navigator.vibrate) navigator.vibrate(25);
            
            const isFollowing = btn.classList.contains('following');
            btn.classList.toggle('following');
            btn.textContent = isFollowing ? 'Suivre' : 'Suivi ✓';
            
            const avatar = btn.closest('.video-user').querySelector('.avatar');
            if (!isFollowing) {
                avatar.style.borderColor = '#bc1888';
                createStars(btn.getBoundingClientRect().left, btn.getBoundingClientRect().top, '#bc1888');
                playSound('like');
                showToast('🎉 Tu suis maintenant ce compte !');
            } else {
                avatar.style.borderColor = 'white';
                showToast('👋 Désabonné');
            }
        }

        // ✨ Étoiles magiques
        function createStars(x, y, color = '#FFD700') {
            const emojis = ['✨', '⭐', '🌟', '💫', '🎇', '💖'];
            for (let i = 0; i < 14; i++) {
                const star = document.createElement('div');
                star.className = 'magic-star';
                star.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                star.style.left = `${x}px`;
                star.style.top = `${y}px`;
                star.style.color = color;
                
                const tx = (Math.random() - 0.5) * 180 + 'px';
                const ty = (Math.random() - 0.5) * 180 - 100 + 'px';
                const rot = (Math.random() - 0.5) * 720 + 'deg';
                
                star.style.setProperty('--tx', tx);
                star.style.setProperty('--ty', ty);
                star.style.setProperty('--rot', rot);
                
                document.body.appendChild(star);
                setTimeout(() => star.remove(), 1000);
            }
        }

        // 🔄 Auto-play intelligent
        function startAutoPlay() {
            setInterval(updateVisibleVideo, 300);
        }

        function updateVisibleVideo() {
            const cards = document.querySelectorAll('.video-card');
            const feed = document.getElementById('video-feed');
            const feedRect = feed.getBoundingClientRect();

            let mostVisibleCard = null;
            let maxVisibility = 0;

            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const visibleHeight = Math.min(rect.bottom, feedRect.bottom) - Math.max(rect.top, feedRect.top);
                const visibility = visibleHeight / rect.height;
                
                if (visibility > maxVisibility && visibility > 0.5) {
                    maxVisibility = visibility;
                    mostVisibleCard = card;
                }
            });

            if (mostVisibleCard) {
                const video = mostVisibleCard.querySelector('.video-player');
                
                document.querySelectorAll('.video-player').forEach(v => {
                    if (v !== video && !v.paused) {
                        v.pause();
                        v.closest('.video-card').classList.add('paused');
                    }
                });
                
                if (video.paused && !mostVisibleCard.classList.contains('paused')) {
                    video.play().catch(() => {
                        mostVisibleCard.classList.add('paused');
                    });
                }
            }
        }

        // 📱 Gestes tactiles
        function setupTouchGestures() {
            const feed = document.getElementById('video-feed');
            let startY = 0, currentY = 0;

            feed.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
            feed.addEventListener('touchmove', (e) => { currentY = e.touches[0].clientY; }, { passive: true });
            feed.addEventListener('touchend', () => {
                if (Math.abs(startY - currentY) > 80) {
                    setTimeout(updateVisibleVideo, 120);
                }
                startY = 0; currentY = 0;
            });

            feed.addEventListener('scroll', () => {
                clearTimeout(window._scrollTimeout);
                window._scrollTimeout = setTimeout(updateVisibleVideo, 80);
            }, { passive: true });
        }

        // 🎨 Header interactions
        function setupHeaderInteractions() {
            document.querySelector('.logo').addEventListener('click', () => {
                document.getElementById('video-feed').scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // 🧭 Navigation
        function navigateTo(item, event) {
            triggerMagic(item, event);
            playSound('notification');
            
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            
            const page = item.dataset.page;
            
            switch(page) {
                case 'home':
                    document.getElementById('video-feed').scrollTo({ top: 0, behavior: 'smooth' });
                    showToast('🏠 Accueil');
                    break;
                case 'search':
                    showToast('🔍 Recherche... (bientôt !)');
                    break;
                case 'reels':
                    showToast('🎬 Tu es déjà dans Reels !');
                    break;
                case 'shop':
                    showToast('🛍️ Boutique en construction ✨');
                    break;
                case 'profile':
                    showToast('👤 Ton profil (bientôt !)');
                    break;
            }
            
            // Retirer la notification après clic
            item.classList.remove('has-notification');
            item.querySelector('.badge-number')?.remove();
        }

        // 🔄 Rotation des notifications (PSYCHOLOGIE !)
        function startNotificationRotation() {
            setInterval(() => {
                const navItems = document.querySelectorAll('.nav-item');
                
                // Random: ajouter/retirer des notifications pour créer de la curiosité
                if (Math.random() > 0.7) {
                    const randomItem = navItems[Math.floor(Math.random() * navItems.length)];
                    if (!randomItem.classList.contains('active')) {
                        randomItem.classList.add('has-notification');
                        
                        // Type random de notification
                        const types = ['', 'new-content', 'message'];
                        randomItem.classList.add(types[Math.floor(Math.random() * types.length)]);
                        
                        // Petit son de notification
                        if (soundEnabled && Math.random() > 0.5) {
                            playSound('notification');
                        }
                    }
                }
            }, 8000); // Toutes les 8 secondes
        }

        // 🔔 Toast notifications
        function showToast(message) {
            let toast = document.getElementById('toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'toast';
                toast.style.cssText = `
                    position: fixed;
                    bottom: 85px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(30,30,50,0.95);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 30px;
                    font-size: 0.9rem;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s, transform 0.3s;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(188,24,136,0.4);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
                `;
                document.body.appendChild(toast);
            }
            
            toast.textContent = message;
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(15px)';
            }, 2200);
        }

        // 🔢 Formatage des nombres
        function formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
            return num.toString();
        }

        // 🎨 Feedback magique
        function triggerMagic(element, event) {
            if (navigator.vibrate) navigator.vibrate(25);
            
            element.classList.add('shaking');
            setTimeout(() => element.classList.remove('shaking'), 150);
            
            if (element.classList.contains('nav-item') || element.classList.contains('logo')) {
                const rect = element.getBoundingClientRect();
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        createStars(
                            rect.left + Math.random() * rect.width,
                            rect.top + Math.random() * rect.height,
                            ['#FFD700', '#bc1888', '#00FFFF'][Math.floor(Math.random() * 3)]
                        );
                    }, i * 50);
                }
            }
        }

        // 🎵 Débloquer audio au premier clic
        document.addEventListener('click', () => {
            document.querySelectorAll('.video-player').forEach(video => {
                video.muted = false;
            });
        }, { once: true });