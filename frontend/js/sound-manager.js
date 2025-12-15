// frontend/js/sound-manager.js
class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.enabled = true;
        this.musicVolume = 0.3;
        this.effectsVolume = 0.5;
        this.isMusicPlaying = false;
    }
    
    async initialize() {
        console.log('🔊 Initializing Sound Manager...');
        
        // Check if audio is supported
        if (typeof Audio === 'undefined') {
            console.log('⚠️ Audio not supported in this browser');
            this.enabled = false;
            return;
        }
        
        // Load preferences
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.musicVolume = parseFloat(localStorage.getItem('musicVolume')) || 0.3;
        this.effectsVolume = parseFloat(localStorage.getItem('effectsVolume')) || 0.5;
        
        // Create audio elements
        this.createAudioElements();
        
        // Set volumes
        this.updateVolumes();
        
        // Try to start background music
        this.startBackgroundMusic();
        
        console.log('✅ Sound Manager initialized');
    }
    
    createAudioElements() {
        // Background music
        this.music = new Audio('assets/music/christmas_soft.mp3'); 
        this.music.loop = true;
        this.music.preload = 'auto';
        
        // Sound effects
        this.sounds = {
            click: new Audio('assets/sounds/click.mp3'),
            shuffle: new Audio('assets/sounds/shuffle.mp3'),
            victory: new Audio('assets/sounds/win.mp3'),
            hint: new Audio('assets/sounds/click.mp3'), // Fallback
            move: new Audio('assets/sounds/click.mp3'), // Fallback
            error: new Audio('assets/sounds/click.mp3') // Fallback
        };
        
        // Preload sounds
        Object.values(this.sounds).forEach(sound => {
            sound.preload = 'auto';
            sound.load();
        });
        
        // Set error handlers
        this.music.onerror = (e) => console.log('Music load error:', e);
        Object.entries(this.sounds).forEach(([name, sound]) => {
            sound.onerror = (e) => console.log(`Sound ${name} load error:`, e);
        });
    }
    
    updateVolumes() {
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
        
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.effectsVolume;
        });
    }
    
    async startBackgroundMusic() {
        if (!this.enabled || !this.music) return;
        
        try {
            await this.music.play();
            this.isMusicPlaying = true;
            console.log('🎵 Background music started');
        } catch (error) {
            console.log('⚠️ Could not autoplay music:', error.message);
            console.log('💡 User interaction required to play audio');
            
            // Wait for user interaction
            document.addEventListener('click', () => {
                if (!this.isMusicPlaying && this.enabled) {
                    this.music.play().then(() => {
                        this.isMusicPlaying = true;
                        console.log('🎵 Music started after user interaction');
                    });
                }
            }, { once: true });
        }
    }
    
    playSound(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            // Clone the audio to allow overlapping sounds
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.effectsVolume;
            sound.play().catch(e => {
                console.log(`Could not play sound ${soundName}:`, e);
            });
            
            // Clean up after playing
            sound.onended = () => {
                sound.src = ''; // Release memory
            };
        } catch (error) {
            console.log(`Error playing ${soundName}:`, error);
        }
    }
    
    playClick() { this.playSound('click'); }
    playShuffle() { this.playSound('shuffle'); }
    playVictory() { this.playSound('victory'); }
    playHint() { this.playSound('hint'); }
    playMove() { this.playSound('move'); }
    playError() { this.playSound('error'); }
    
    toggleMusic() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        
        if (this.enabled) {
            this.startBackgroundMusic();
        } else {
            this.music.pause();
            this.isMusicPlaying = false;
        }
        
        return this.enabled;
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('musicVolume', this.musicVolume);
        
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
    }
    
    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('effectsVolume', this.effectsVolume);
        this.updateVolumes();
    }
    
    stopAll() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
        
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        
        this.isMusicPlaying = false;
    }
}

// Global instance
window.soundManager = new SoundManager();

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.soundManager.initialize());
} else {
    window.soundManager.initialize();
}