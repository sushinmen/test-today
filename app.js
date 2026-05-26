/**
 * Homunculus Manga Website Interactive Engine
 */

// Application State
const state = {
    isTrepanated: false,
    audioInitialized: false,
    audioPlaying: false,
    currentUnit: 'C',
    activeThemeTab: 'trepanation'
};

// Web Audio API Elements
let audioCtx = null;
let droneOsc = null;
let droneGain = null;
let heartbeatInterval = null;

// Character Details Database
const characterDetails = {
    nakoshi: {
        name: "Susumu Nakoshi (명越 進)",
        role: "The Protagonist",
        desc: "A 34-year-old former salaryman living out of his compact car. Trapped between the world of elite high-flyers and the homeless in the park, Nakoshi has lost all sense of his own identity and face. He undergoes trepanation for 700,000 yen, unlocking the ability to see people's hidden psychological projections (homunculi) when covering his right eye.",
        traitsPublic: ["Former Banker", "Homeless", "Egoist", "Faceless"],
        traitsHomunculus: ["Organic Mirror", "Identity Thief", "Void", "Distorted Memory"],
        psycheTitle: "The Faceless Mirror",
        psycheDesc: "Nakoshi's own homunculus is initially invisible because he has completely repressed his own identity and facial features through plastic surgery and lies. Ultimately, his homunculus is revealed as a mirror—reflecting only the projections of those he looks at, indicating a complete absence of a defined self."
    },
    ito: {
        name: "Manabu Ito (伊藤 学)",
        role: "The Experimenter",
        desc: "A wealthy 22-year-old medical student obsessed with trepanation, psychiatry, and the occult. He wears eccentric clothing, performs self-harm, and is driven by an intense desire to verify the sixth sense to escape the overshadowing figure of his father, a famous hospital director.",
        traitsPublic: ["Medical Student", "Wealthy Heir", "Eccentric", "Rationalist"],
        traitsHomunculus: ["Transparent Glass", "Water Creature", "Paternal Shadow", "Brittle Bond"],
        psycheTitle: "The Glass Aquarium",
        psycheDesc: "When viewed through Nakoshi's left eye, Ito appears as a transparent, fragile creature made of glass, containing swimming fish and water. This represents his extreme emotional fragility, his feeling of living in a display case under public scrutiny, and his fear of his father shattering his delicate shell."
    },
    sandgirl: {
        name: "The Sand Girl (177)",
        role: "The First Homunculus",
        desc: "A high school student Nakoshi encounters in Shibuya. To the public, she is a symbol of rebellious youth, but mentally she is crushed by extreme sexual guilt and pressure from her mother's strict, suffocating expectations.",
        traitsPublic: ["School Girl", "Rebellious", "Shibuya Youth"],
        traitsHomunculus: ["Sand & Shells", "Faceless Girls", "Maternal Guilt"],
        psycheTitle: "The Construct of Sand",
        psycheDesc: "Her homunculus appears as a body made entirely of shifting sand, containing hollow shells and faceless doll parts. This signifies how her character was artificially built from the expectations of others, crumbling away at the slightest touch of genuine intimacy."
    },
    yakuza: {
        name: "The Yakuza Boss (야쿠자 보스)",
        role: "The Guilt-Ridden Mobster",
        desc: "A ruthless yakuza commander who maintains a fierce, bulletproof exterior. Inside, he is haunted by the memory of a childhood incident where he accidentally cut off his friend's finger, leading him to overcompensate with violence.",
        traitsPublic: ["Syndicate Leader", "Ruthless", "Tattooed Warrior"],
        traitsHomunculus: ["Robot Body", "Miniature Child", "Severed Finger"],
        psycheTitle: "The Iron Shell",
        psycheDesc: "He appears as a massive, robotic metal suit containing a tiny, weeping child inside holding a box cutter. The giant steel armor represents his hyper-masculine yakuza shield, while the small child reveals the arrested emotional development and guilt he has carried since boyhood."
    }
};

// Theme Tab Database
const themeDetails = {
    trepanation: {
        title: "Trepanation (두개골 천공술)",
        desc: "Trepanation is the surgical practice of drilling a hole into the skull. Dating back to prehistoric times, it was believed to cure migraines, mental illnesses, and release evil spirits. In the world of *Homunculus*, Manabu Ito theorizes that drilling a 3mm hole in the skull relieves intracranial pressure and increases blood flow to silent areas of the brain, thereby unlocking the latent 'sixth sense' or ESP.",
        icon: "fa-circle-dot"
    },
    homunculi: {
        title: "The Projection of Ego (호문쿨루스)",
        desc: "The term 'Homunculus' historically refers to a miniature human being, or a neurological map of the body in the brain. In the manga, the homunculi are the physical representations of a person's hidden traumas, repressions, and desires. When Nakoshi looks at people with his left eye only, he sees their physical bodies deformed into their true psychological realities.",
        icon: "fa-brain"
    },
    identity: {
        title: "Ego & Self-Delusion (자아와 망상)",
        desc: "At its core, *Homunculus* is a profound philosophical inquiry into identity. Nakoshi relies on luxury goods, cosmetic surgery, and social status to invent a fake persona, hiding his past. By drilling his skull, he is forced to look at the distortions of others—only to realize that the homunculi he sees are deeply colored by his own projecting ego and unresolved self-hatred.",
        icon: "fa-eye"
    }
};

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    initEyeTracking();
    initThemeTabs();
    initAudioToggle();
    initModal();
    
    // Check if user has already trepanated in local storage
    if (localStorage.getItem('homunculus_trepanated') === 'true') {
        unlockTrepanation(false); // Unlock without drill animation
    }
});

// Cursor Tracking Eyeball Logic
function initEyeTracking() {
    const eye = document.querySelector('.interactive-eye');
    const iris = document.querySelector('.iris');
    if (!eye || !iris) return;

    window.addEventListener('mousemove', (e) => {
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        const deltaX = e.clientX - eyeCenterX;
        const deltaY = e.clientY - eyeCenterY;
        const angle = Math.atan2(deltaY, deltaX);

        // Limit iris movement radius
        const maxDist = 12;
        const moveX = Math.cos(angle) * maxDist;
        const moveY = Math.sin(angle) * maxDist;

        iris.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
}

// Interactive Drill Event
function triggerDrill() {
    if (state.isTrepanated) return;

    const drillSpot = document.querySelector('.drill-spot');
    const drillLoader = document.querySelector('.drill-animation-overlay');
    
    if (drillSpot) drillSpot.style.display = 'none';
    if (drillLoader) drillLoader.style.display = 'flex';

    // Play drilling sound synthesizer
    playDrillSynth();

    // Vibrate device if supported
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 300]);
    }

    setTimeout(() => {
        if (drillLoader) drillLoader.style.display = 'none';
        unlockTrepanation(true);
    }, 1800);
}

// Unlock Homunculus View
function unlockTrepanation(showEffects = true) {
    state.isTrepanated = true;
    localStorage.setItem('homunculus_trepanated', 'true');

    // Add CSS state class
    document.body.classList.add('homunculus-active');

    // Change title/hero text elements dynamically
    const mainTitle = document.getElementById('main-title');
    if (mainTitle) {
        mainTitle.textContent = "H O M U N C U L U S";
        mainTitle.style.color = 'var(--neon-red)';
        mainTitle.style.textShadow = '0 0 20px rgba(255, 0, 85, 0.8)';
    }

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        heroSubtitle.textContent = "Unlocked: The Sixth Sense / 제6감 개방";
    }

    // Toggle button text in nav
    const toggleBtn = document.getElementById('global-mode-btn');
    if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Return to Normal';
    }

    // Initialize/start audio drone
    if (state.audioInitialized) {
        startAmbientDrone();
    }

    if (showEffects) {
        // Flash screen effect
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100vw';
        flash.style.height = '100vh';
        flash.style.backgroundColor = '#ff0055';
        flash.style.zIndex = '99999';
        flash.style.opacity = '1';
        flash.style.transition = 'opacity 1s ease';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 1000);
        }, 50);
    }
}

// Toggle Mode Manually from Header
function toggleGlobalMode() {
    if (state.isTrepanated) {
        // Reset to normal
        state.isTrepanated = false;
        localStorage.removeItem('homunculus_trepanated');
        document.body.classList.remove('homunculus-active');
        
        const mainTitle = document.getElementById('main-title');
        if (mainTitle) {
            mainTitle.textContent = "HOMUNCULUS";
            mainTitle.style.color = '';
            mainTitle.style.textShadow = '';
        }

        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) {
            heroSubtitle.textContent = "A Psychological Masterpiece by Hideo Yamamoto";
        }

        const toggleBtn = document.getElementById('global-mode-btn');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fa-solid fa-skull"></i> Trepanation';
        }

        const drillSpot = document.querySelector('.drill-spot');
        if (drillSpot) drillSpot.style.display = 'flex';

        stopAmbientDrone();
    } else {
        triggerDrill();
    }
}

// Web Audio API Synthesizers
function initAudio() {
    if (state.audioInitialized) return;
    
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        state.audioInitialized = true;
    } catch (e) {
        console.error("Web Audio API not supported", e);
    }
}

function initAudioToggle() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
        initAudio();

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (state.audioPlaying) {
            // Stop
            stopAmbientDrone();
            audioBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Sound OFF';
            state.audioPlaying = false;
        } else {
            // Start
            state.audioPlaying = true;
            audioBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Sound ON';
            if (state.isTrepanated) {
                startAmbientDrone();
            }
        }
    });
}

// Synthesize drilling sound
function playDrillSynth() {
    if (!state.audioPlaying) return;
    initAudio();

    const osc = audioCtx.createOscillator();
    const noise = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, audioCtx.currentTime + 1.5);

    // Modulation for a vibrating buzz
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 50; // fast vibration
    lfoGain.gain.value = 20;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 1.5);
    filter.Q.value = 5;

    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

    lfo.start();
    osc.start();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Stop sound
    setTimeout(() => {
        osc.stop();
        lfo.stop();
    }, 1800);
}

// Ambient Psychological Horror Drone
function startAmbientDrone() {
    if (!state.audioPlaying || !state.audioInitialized) return;

    // Clean up if already running
    stopAmbientDrone();

    // Create low pitch drone oscillator
    droneOsc = audioCtx.createOscillator();
    droneGain = audioCtx.createGain();
    
    // Low Frequency LFO to filter frequency
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, audioCtx.currentTime);

    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.2; // Slow sweep
    lfoGain.gain.value = 50;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    droneOsc.type = 'sawtooth';
    droneOsc.frequency.value = 55; // Low A
    
    droneGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 2.0); // Slow fade in

    droneOsc.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(audioCtx.destination);

    lfo.start();
    droneOsc.start();

    // Pulsing Heartbeat
    heartbeatInterval = setInterval(() => {
        playHeartbeatSound();
    }, 1600); // 1.6s beat interval
}

function stopAmbientDrone() {
    if (droneOsc) {
        try {
            droneOsc.stop();
        } catch(e){}
        droneOsc = null;
    }
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

function playHeartbeatSound() {
    if (!state.audioPlaying || !state.audioInitialized) return;

    // Heartbeat contains two rapid pulses (thump-thump)
    const playThump = (delay) => {
        const time = audioCtx.currentTime + delay;
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, time);
        osc.frequency.exponentialRampToValueAtTime(10, time + 0.3);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(80, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.4, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(time);
        osc.stop(time + 0.4);
    };

    playThump(0);
    playThump(0.25); // Second thump
}

// Concept Theme Tab Switcher
function initThemeTabs() {
    const tabs = document.querySelectorAll('.theme-tab-btn');
    const panelTitle = document.getElementById('panel-title');
    const panelBody = document.getElementById('panel-body');
    const panelIcon = document.getElementById('panel-icon');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const themeId = tab.dataset.theme;
            const data = themeDetails[themeId];

            if (data) {
                // Smooth fade effect
                const panel = document.querySelector('.theme-content-panel');
                panel.style.opacity = '0.3';
                panel.style.transform = 'translateY(5px)';

                setTimeout(() => {
                    if (panelTitle) panelTitle.textContent = data.title;
                    if (panelBody) panelBody.textContent = data.desc;
                    if (panelIcon) panelIcon.className = `fa-solid ${data.icon}`;
                    
                    panel.style.opacity = '1';
                    panel.style.transform = 'translateY(0)';
                }, 250);
            }
        });
    });
}

// Character Psych Profile Modals
function initModal() {
    const cards = document.querySelectorAll('.char-card');
    const modal = document.getElementById('psyche-modal');
    const modalClose = document.getElementById('modal-close');

    if (!modal || !modalClose) return;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const charId = card.dataset.character;
            const data = characterDetails[charId];

            if (data) {
                document.getElementById('modal-char-name').textContent = data.name;
                document.getElementById('modal-char-role').textContent = data.role;
                document.getElementById('modal-char-desc').textContent = data.desc;
                document.getElementById('modal-psyche-title').textContent = data.psycheTitle;
                document.getElementById('modal-psyche-desc').textContent = data.psycheDesc;

                // Populate tags
                const publicTagsContainer = document.getElementById('modal-public-tags');
                const homunculusTagsContainer = document.getElementById('modal-homunculus-tags');

                publicTagsContainer.innerHTML = '';
                homunculusTagsContainer.innerHTML = '';

                data.traitsPublic.forEach(tag => {
                    const el = document.createElement('span');
                    el.className = 'trait-tag';
                    el.textContent = tag;
                    publicTagsContainer.appendChild(el);
                });

                data.traitsHomunculus.forEach(tag => {
                    const el = document.createElement('span');
                    el.className = 'trait-tag homunculus-trait-tag';
                    el.style.display = 'inline-block';
                    el.textContent = tag;
                    homunculusTagsContainer.appendChild(el);
                });

                // Display modal
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock scroll
            }
        });
    });

    // Close buttons
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    function closeModal() {
        modal.classList.remove('active');
        if (!state.isTrepanated) {
            document.body.style.overflow = '';
        }
    }
}
