// ========== 1. BUKA KADO DENGAN ANIMASI MELEDAK ==========
const giftScreen = document.getElementById('giftScreen');
const giftIcon = document.getElementById('giftIcon');
const mainContainer = document.getElementById('mainContainer');
const bodyEl = document.body;

let overlapStartTime = 0;
const REQUIRED_HOLD_TIME = 800; // harus nempel 0.8 detik

// ========== AUDIO BACKGROUND ==========
let bgAudio = null;
let bgAudio2 = null;
let blowSound = null;
let confettiSound = null;

function playBirthdaySong() {
    try {
        bgAudio = new Audio('hbdsong-piano.mp3');
        bgAudio.loop = true;
        bgAudio.volume = 0.25;
        bgAudio.play().catch(e => console.log('Autoplay blocked, user interaction needed'));
    } catch (e) {
        console.log('Audio error:', e);
    }
}

function playSecondMusic() {
    try {
        if (bgAudio2) {
            bgAudio2.pause();
            bgAudio2.currentTime = 0;
        }
        bgAudio2 = new Audio('msc2.mp3');
        bgAudio2.loop = true;  // looping atau tidak? terserah
        bgAudio2.volume = 0.3;
        bgAudio2.play().catch(e => console.log('Second music error:', e));
    } catch(e) {
        console.log('Audio error:', e);
    }
}

function stopBirthdaySong() {
    if (bgAudio) {
        bgAudio.pause();
        bgAudio.currentTime = 0;
        bgAudio = null;
    }
    setTimeout(() => {
        playSecondMusic();
    }, 500)
}

function playBlowSound() {
    try {
        if (blowSound) {
            blowSound.pause();
            blowSound.currentTime = 0;
        }
        blowSound = new Audio('blow-efx.mp3');
        blowSound.volume = 0.5;
        blowSound.play().catch(e => console.log('Blow sound error:', e));
    } catch (e) {
        console.log('Audio error:', e);
    }
}

function playConfettiSound(volume = 0.6) {
    try {
        if (confettiSound) {
            confettiSound.pause();
            confettiSound.currentTime = 0;
        }
        confettiSound = new Audio('confetti.mp3');
        confettiSound.volume = volume;
        confettiSound.play().catch(e => console.log('Confetti sound error:', e));
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// ========== FUNGSI ANIMASI KADO ==========
function openGift() {
    playBirthdaySong();
    giftIcon.classList.add('open');

    setTimeout(() => {
        giftIcon.classList.add('boom');
    }, 380);

    setTimeout(() => {
        giftScreen.style.display = 'none';
        bodyEl.classList.add('main-bg');
        mainContainer.style.opacity = '1';
        void mainContainer.offsetWidth; // trigger reflow
        startDynamicFlame();
    }, 980);
}

// Event click pada kado
giftScreen.addEventListener('click', openGift);

// ========== 2. LOGIC LILIN + TIUP / DRAG GAMBAR ==========
let blowCount = 0;
const MAX_BLOW = 21; // 21 kali tiup (ucapan 21 tahun)
let multiCandlesContainer = null;
let isFinalBlown = false;

const candleContainer = document.querySelector('.candle-container');
const flameEl = document.getElementById('flameEl');
const innerFlameEl = document.getElementById('innerFlameEl');
const glowEl = document.querySelector('.ambient-glow');

// Fungsi mematikan api sementara dan memunculkan lilin kecil
function blowCandleAction() {
    if (blowCount >= MAX_BLOW || isFinalBlown) return;

    // Matikan api (efek tiup)
    if (flameEl) flameEl.classList.add('off');
    if (innerFlameEl) innerFlameEl.classList.add('off');
    if (glowEl) glowEl.classList.add('off');

    // Slide out lilin utama
    if (candleContainer) candleContainer.classList.add('exit');

    setTimeout(() => {
        if (candleContainer) candleContainer.classList.remove('exit');
        if (flameEl) flameEl.classList.remove('off');
        if (innerFlameEl) innerFlameEl.classList.remove('off');
        if (glowEl) glowEl.classList.remove('off');

        // Buat wadah lilin-lilin kecil jika belum ada
        if (!multiCandlesContainer) {
            multiCandlesContainer = document.createElement('div');
            multiCandlesContainer.className = 'multi-candles show';
            document.body.appendChild(multiCandlesContainer);
        }

        // Tambah satu lilin kecil
        const smallCandle = document.createElement('div');
        smallCandle.className = 'small-candle';
        smallCandle.style.cssText = 'transform:translateX(60px);opacity:0; transition: all 0.4s ease-out;';
        multiCandlesContainer.appendChild(smallCandle);

        setTimeout(() => {
            smallCandle.style.transform = 'translateX(0)';
            smallCandle.style.opacity = '1';
        }, 30);

        blowCount++;

        // Saat mencapai 10 kali tiup -> muncul ucapan happy 21st
        if (blowCount === 10 && !isFinalBlown) {
            setTimeout(() => {
                // Lilin utama fade out
                if (candleContainer) {
                    candleContainer.style.transition = 'opacity 0.8s, transform 0.8s';
                    candleContainer.style.opacity = '0';
                    candleContainer.style.transform = 'scale(0.6)';
                }

                // Lilin kecil menghilang
                if (multiCandlesContainer) {
                    multiCandlesContainer.style.transition = 'opacity 0.8s, transform 0.6s';
                    multiCandlesContainer.style.opacity = '0';
                    multiCandlesContainer.style.transform = 'translateY(40px)';
                }

                setTimeout(() => {
                    const birthdayDiv = document.createElement('div');
                    birthdayDiv.className = 'birthday-text';
                    birthdayDiv.innerText = 'Happy 21st Bday My Love 🎂';
                    document.body.appendChild(birthdayDiv);
                    setTimeout(() => birthdayDiv.classList.add('show'), 40);

                    createPhotoSlideshow();
                    stopBirthdaySong();
                    playConfettiSound();
                    launchConfetti();
                    startBalloons();

                    const hintDiv = document.getElementById('hintBox');
                    if (hintDiv) hintDiv.classList.add('hide');
                }, 500);

                isFinalBlown = true;
            }, 300);
        }
    }, 800);
}

// ========== 3. FUNGSI DRAG GAMBAR KE API ==========
const dragImage = document.getElementById('dragImage');
const hintBox = document.getElementById('hintBox');

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let alreadyBlownForDrag = false;

// Posisi awal gambar
dragImage.style.position = 'fixed';
dragImage.style.bottom = '20px';
dragImage.style.right = '20px';
dragImage.style.left = 'auto';
dragImage.style.top = 'auto';

function onDragStart(clientX, clientY) {
    isDragging = true;
    const rect = dragImage.getBoundingClientRect();
    dragOffsetX = clientX - rect.left;
    dragOffsetY = clientY - rect.top;

    if (hintBox) hintBox.classList.add('hide');
    dragImage.style.transition = 'none';
}

function onDragMove(clientX, clientY) {
    if (!isDragging) return;

    let newLeft = clientX - dragOffsetX;
    let newTop = clientY - dragOffsetY;

    // Batasi agar tidak keluar layar
    newLeft = Math.min(window.innerWidth - dragImage.offsetWidth, Math.max(0, newLeft));
    newTop = Math.min(window.innerHeight - dragImage.offsetHeight, Math.max(0, newTop));

    dragImage.style.left = newLeft + 'px';
    dragImage.style.top = newTop + 'px';
    dragImage.style.right = 'auto';
    dragImage.style.bottom = 'auto';
}

function onDragEnd() {
    isDragging = false;
    dragImage.style.transition = '';
}

// Event mouse
dragImage.addEventListener('mousedown', (e) => {
    e.preventDefault();
    onDragStart(e.clientX, e.clientY);
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) onDragMove(e.clientX, e.clientY);
});

window.addEventListener('mouseup', onDragEnd);

// Event touch
dragImage.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    onDragStart(touch.clientX, touch.clientY);
});

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    onDragMove(touch.clientX, touch.clientY);
});

window.addEventListener('touchend', onDragEnd);

// ========== 4. CEK OVERLAP GAMBAR DENGAN API ==========
function checkOverlapAndBlow() {
    if (!dragImage || !flameEl) return false;

    const imgRect = dragImage.getBoundingClientRect();
    const flameRect = flameEl.getBoundingClientRect();

    return !(imgRect.right < flameRect.left ||
             imgRect.left > flameRect.right ||
             imgRect.bottom < flameRect.top ||
             imgRect.top > flameRect.bottom);
}

let lastBlowTime = 0;
const BLOW_COOLDOWN = 500;

function monitorDragOverlap() {
    const overlapping = checkOverlapAndBlow();
    const now = Date.now();

    if (overlapping) {
        // Mulai hitung waktu kalau baru overlap
        if (!overlapStartTime) overlapStartTime = now;

        const heldTime = now - overlapStartTime;

        if (heldTime > REQUIRED_HOLD_TIME &&
            !alreadyBlownForDrag &&
            blowCount < MAX_BLOW &&
            !isFinalBlown &&
            now - lastBlowTime > BLOW_COOLDOWN) {

            dragImage.src = "tiup.png";
            alreadyBlownForDrag = true;
            lastBlowTime = now;

            playBlowSound();
            blowCandleAction();

            setTimeout(() => {
                if (!isFinalBlown) {
                    dragImage.src = "gambar1.png";
                    alreadyBlownForDrag = false;
                }
            }, 1500);

            overlapStartTime = 0; // reset biar harus nempel lagi
        }
    } else {
        // Kalau lepas, reset timer
        overlapStartTime = 0;

        if (!isFinalBlown && !alreadyBlownForDrag) {
            dragImage.src = "gambar1.png";
        }

        if (!isFinalBlown) alreadyBlownForDrag = false;
    }
}

// Pantau setiap 250ms saat drag atau gerakan
setInterval(() => {
    if (!isFinalBlown && mainContainer.style.opacity === '1') {
        monitorDragOverlap();
    }
}, 250);

// Pantau saat mouse bergerak untuk realtime
document.addEventListener('mousemove', () => {
    if (!isFinalBlown && mainContainer.style.opacity === '1') monitorDragOverlap();
});

document.addEventListener('touchmove', () => {
    if (!isFinalBlown && mainContainer.style.opacity === '1') monitorDragOverlap();
});

// ========== 5. DINAMIKA API BERKEDIP ==========
function startDynamicFlame() {
    if (!flameEl) return;

    const interval = setInterval(() => {
        if (!document.body.contains(flameEl) || isFinalBlown) {
            if (isFinalBlown) clearInterval(interval);
            return;
        }

        if (flameEl.classList.contains('off')) return;

        const sy = 0.97 + Math.random() * 0.1;
        const sx = 0.95 + Math.random() * 0.08;
        const ox = -51 + (Math.random() * 3 - 1.5);

        flameEl.style.transform = `translateX(${ox}%) scale(${sx}, ${sy})`;

        if (innerFlameEl) {
            const s = 0.95 + Math.random() * 0.1;
            const o = -49 + (Math.random() * 3 - 1.5);
            innerFlameEl.style.transform = `translateX(${o}%) scale(${s})`;
        }

        if (glowEl) {
            const g = 85 + Math.random() * 25;
            glowEl.style.width = glowEl.style.height = g + 'px';
        }
    }, 130);
}

// ========== 6. FUNGSI CONFETTI & BALLOON ==========
function launchConfetti() {
    const colors = ['#ff4d6d', '#ffd166', '#06d6a0', '#118ab2', '#ffe66d'];

    for (let i = 0; i < 120; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }
}

function startBalloons() {
    const colors = ['#ff4d6d', '#ffd166', '#06d6a0', '#118ab2', '#f72585', '#fca311'];

    setInterval(() => {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';

        balloon.style.left = Math.random() * 100 + 'vw';
        balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.animationDuration = (4 + Math.random() * 3) + 's';

        document.body.appendChild(balloon);

        setTimeout(() => balloon.remove(), 7000);
    }, 300);
}

// ========== 7. OBSERVER UNTUK MEMULAI API DINAMIS ==========
const observer = new MutationObserver(() => {
    if (mainContainer.style.opacity === '1' && !isFinalBlown) {
        startDynamicFlame();
        observer.disconnect();
    }
});

observer.observe(mainContainer, { attributes: true, attributeFilter: ['style'] });

// Backup: jika sudah langsung terbuka
if (mainContainer.style.opacity === '1') startDynamicFlame();

// ========== 8. KLIK PADA API (OPSIONAL) ==========
if (flameEl) {
    flameEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isFinalBlown && blowCount < MAX_BLOW) {
            blowCandleAction();
            dragImage.src = "tiup.png";
            setTimeout(() => {
                if (!isFinalBlown) dragImage.src = "gambar1.png";
            }, 700);
        }
    });
}

// ========== SLIDESHOW FOTO ==========
let currentPhotoIndex = 0;
let photoList = [];
let slideshowInterval = null;

function createPhotoSlideshow() {
    // daftar foto dari folder 'foto/'
    photoList = [
        'foto/foto01.jpg',
        'foto/foto02.jpg'
    ];
    
    if (photoList.length === 0) return;
    
    // buat container slideshow
    const slideshowDiv = document.createElement('div');
    slideshowDiv.className = 'photo-slideshow';
    
    const img = document.createElement('img');
    img.id = 'slideshowImg';
    img.src = photoList[0];
    img.alt = 'Birthday Photo';
    
    slideshowDiv.appendChild(img);
    document.body.appendChild(slideshowDiv);
    
    // animasi muncul
    setTimeout(() => slideshowDiv.classList.add('show'), 100);
    
    const slideshowImg = document.getElementById('slideshowImg');
    
    function nextPhoto() {
        currentPhotoIndex = (currentPhotoIndex + 1) % photoList.length;
        slideshowImg.style.opacity = '0';
        setTimeout(() => {
            slideshowImg.src = photoList[currentPhotoIndex];
            slideshowImg.style.opacity = '1';
        }, 200);
    }
    
    // auto slide setiap 3 detik
    slideshowInterval = setInterval(() => {
        nextPhoto();
    }, 1000);
}

// ========== LOADING SYSTEM ==========
const loadingScreen = document.getElementById('loadingScreen');
const loadingBar = document.getElementById('loadingBar');
const loadingText = document.getElementById('loadingText');
const loadingDetail = document.getElementById('loadingDetail');

// DAFTAR SEMUA ASSET YANG PERLU DILOAD
const assetsToLoad = {
    images: [
        'gambar1.png',
        'tiup.png',
        'foto/foto01.jpg',
        'foto/foto02.jpg'
    ],
    audio: [
        'hbdsong-piano.mp3',
        'blow-efx.mp3',
        'confetti.mp3',
        'msc2.mp3'
    ]
};

let totalAssets = assetsToLoad.images.length + assetsToLoad.audio.length;
let loadedAssets = 0;

function updateLoadingProgress(assetName) {
    loadedAssets++;
    const percent = Math.floor((loadedAssets / totalAssets) * 100);
    
    if (loadingBar) {
        loadingBar.style.width = percent + '%';
    }
    if (loadingText) {
        loadingText.innerText = `Loading assets... ${percent}%`;
    }
    if (loadingDetail && assetName) {
        loadingDetail.innerText = `Loaded: ${assetName}`;
    }
    
    console.log(`Loaded ${loadedAssets}/${totalAssets}: ${assetName}`);
    
    // jika semua asset sudah terload
    if (loadedAssets >= totalAssets) {
        finishLoading();
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            updateLoadingProgress(src.split('/').pop());
            resolve(img);
        };
        img.onerror = () => {
            console.warn(`Gagal load gambar: ${src}`);
            updateLoadingProgress(src.split('/').pop() + ' (skip)');
            resolve(null); // tetap lanjut walau gagal
        };
        img.src = src;
    });
}

function loadAudio(src) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.addEventListener('canplaythrough', () => {
            updateLoadingProgress(src.split('/').pop());
            resolve(audio);
        });
        audio.addEventListener('error', () => {
            console.warn(`Gagal load audio: ${src}`);
            updateLoadingProgress(src.split('/').pop() + ' (skip)');
            resolve(null);
        });
        audio.src = src;
        audio.load();
    });
}

async function loadAllAssets() {
    // Load semua gambar
    const imagePromises = assetsToLoad.images.map(src => loadImage(src));
    
    // Load semua audio
    const audioPromises = assetsToLoad.audio.map(src => loadAudio(src));
    
    // Tunggu semua selesai
    await Promise.all([...imagePromises, ...audioPromises]);
}

function finishLoading() {
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('hide');
            // hapus loading screen setelah animasi selesai
            setTimeout(() => {
                if (loadingScreen) loadingScreen.style.display = 'none';
            }, 1000);
        }
    }, 500);
}

// Mulai loading saat halaman dibuka
window.addEventListener('DOMContentLoaded', () => {
    loadAllAssets();
});

// Optional: Tampilkan pesan jika loading terlalu lama (timeout)
setTimeout(() => {
    if (loadedAssets < totalAssets) {
        if (loadingDetail) {
            loadingDetail.innerText = 'Taking too long? Click to continue...';
            loadingDetail.style.cursor = 'pointer';
            loadingDetail.onclick = () => {
                finishLoading();
            };
        }
    }
}, 10000); // 10 detik timeout

// ========== CLICK CONFETTI (SATISFYING EFFECT) ==========
function createMiniConfetti(x, y) {
    const colors = ['#ff4d6d', '#ffd166', '#06d6a0', '#118ab2', '#f72585', '#ff9f1c', '#e63946', '#2a9d8f'];
    
    for (let i = 0; i < 15; i++) {
        const conf = document.createElement('div');
        conf.className = 'mini-confetti';
        
        // posisi di sekitar klik
        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity * (Math.random() * 0.5 + 0.5);
        const vy = Math.sin(angle) * velocity * (Math.random() * 0.5 + 0.5) - 80;
        
        conf.style.left = (x - 10 + Math.random() * 20) + 'px';
        conf.style.top = (y - 10 + Math.random() * 20) + 'px';
        conf.style.background = colors[Math.floor(Math.random() * colors.length)];
        conf.style.width = (4 + Math.random() * 6) + 'px';
        conf.style.height = (6 + Math.random() * 8) + 'px';
        
        // simpan velocity untuk animasi custom
        conf.dataset.vx = vx;
        conf.dataset.vy = vy;
        conf.dataset.gravity = 400;
        conf.dataset.startTime = Date.now();
        
        document.body.appendChild(conf);
        
        // animasi dengan requestAnimationFrame
        let lastTime = Date.now();
        function animateConfetti() {
            const now = Date.now();
            const dt = Math.min(0.033, (now - lastTime) / 1000);
            lastTime = now;
            
            let vx = parseFloat(conf.dataset.vx);
            let vy = parseFloat(conf.dataset.vy);
            const gravity = parseFloat(conf.dataset.gravity);
            
            vy += gravity * dt;
            
            let left = parseFloat(conf.style.left);
            let top = parseFloat(conf.style.top);
            
            left += vx * dt;
            top += vy * dt;
            
            conf.style.left = left + 'px';
            conf.style.top = top + 'px';
            
            // rotasi
            const rotation = (parseFloat(conf.dataset.rotation) || 0) + (vx * dt * 5);
            conf.dataset.rotation = rotation;
            conf.style.transform = `rotate(${rotation}deg)`;
            
            if (top < window.innerHeight + 100 && left > -100 && left < window.innerWidth + 100) {
                requestAnimationFrame(animateConfetti);
            } else {
                conf.remove();
            }
        }
        
        requestAnimationFrame(animateConfetti);
        
        // fallback: hapus setelah 3 detik
        setTimeout(() => {
            if (conf.parentNode) conf.remove();
        }, 3000);
    }
}

// CSS untuk mini confetti
const miniConfettiStyle = document.createElement('style');
miniConfettiStyle.textContent = `
    .mini-confetti {
        position: fixed;
        pointer-events: none;
        z-index: 99999;
        border-radius: 2px;
        opacity: 0.9;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(miniConfettiStyle);

// Fungsi untuk mengecek apakah element yang diklik bisa di-drag atau tombol interaktif
function isInteractiveElement(target) {
    // elemen yang tidak boleh memicu confetti (karena sudah punya fungsi sendiri)
    const interactiveSelectors = [
        '#giftScreen', '.gift', '#giftIcon',  // kado
        '#dragImage',                          // gambar drag
        '.flame', '#flameEl',                  // api lilin
        '.candle-container', '.candle-body',   // lilin
        '.nav-arrow',                          // arrow foto (jika ada)
        '.photo-slideshow', '#slideshowImg',   // foto slideshow
        '.birthday-text',                      // teks birthday
        'button', '[role="button"]',           // tombol umum
        '.multi-candles', '.small-candle'      // lilin kecil
    ];
    
    // cek apakah target atau parentnya adalah elemen interaktif
    let el = target;
    while (el && el !== document.body) {
        for (let selector of interactiveSelectors) {
            if (el.matches && el.matches(selector)) {
                return true;
            }
        }
        // cek juga apakah element sedang dalam proses drag
        if (el.id === 'dragImage' && isDragging) {
            return true;
        }
        el = el.parentElement;
    }
    
    // cek apakah klik terjadi saat proses tiup/drag berlangsung
    if (isDragging) return true;
    
    return false;
}

// Event listener untuk klik di seluruh halaman (setelah gift screen hilang)
document.addEventListener('click', function(e) {
    // cek apakah main container sudah muncul (gift sudah dibuka)
    const mainIsVisible = mainContainer && mainContainer.style.opacity === '1';
    
    if (!mainIsVisible) return;
    // if (isFinalBlown) return; // sudah selesai, biarkan confetti besar yang jalan
    
    // cek apakah klik pada elemen interaktif
    if (!isInteractiveElement(e.target)) {
        // dapatkan posisi klik
        const x = e.clientX;
        const y = e.clientY;
        
        // ledakkan confetti kecil
        createMiniConfetti(x, y);
        
        // tambahan efek suara klik (opsional, kecil)
        try {
            // const clickSound = new Audio();
            playConfettiSound(0.1)
            // optional: pakai suara kecil atau tidak usah
            // biarkan hanya visual agar tidak mengganggu
        } catch(e) {}
    }
});

// Event untuk touch (mobile)
document.addEventListener('touchstart', function(e) {
    const mainIsVisible = mainContainer && mainContainer.style.opacity === '1';
    if (!mainIsVisible) return;
    // if (!isFinalBlown) return;
    
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (!isInteractiveElement(target)) {
        const x = touch.clientX;
        const y = touch.clientY;
        createMiniConfetti(x, y);
    }
});

// Tambahan efek confetti saat drag selesai di area kosong (optional)
let lastDragEndTime = 0;
const originalOnDragEnd = onDragEnd;
window.onDragEnd = function(e) {
    if (originalOnDragEnd) originalOnDragEnd();
    
    // ledakkan confetti kecil saat drag selesai (biar makin satisfying)
    const now = Date.now();
    if (now - lastDragEndTime > 500 && !isFinalBlown) {
        lastDragEndTime = now;
        const rect = dragImage.getBoundingClientRect();
        createMiniConfetti(rect.left + rect.width/2, rect.top + rect.height/2);
    }
};