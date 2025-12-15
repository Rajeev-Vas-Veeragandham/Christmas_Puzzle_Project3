// js/themes-enhanced.js
class DynamicThemeSystem {
    constructor() {
        this.themes = {
            santa: {
                colors: ['#c41e3a', '#165b33', '#146b3a', '#ea4630', '#bb2528'],
                background: 'linear-gradient(135deg, #0a1929, #001220)',
                music: 'santa-workshop.mp3',
                effects: ['snow', 'sparkles', 'gear-animation']
            },
            reindeer: {
                colors: ['#1e40af', '#1e3a8a', '#60a5fa', '#93c5fd', '#dbeafe'],
                background: 'linear-gradient(135deg, #0c4a6e, #082f49)',
                music: 'reindeer-flight.mp3',
                effects: ['aurora', 'snowflakes', 'star-twinkle']
            },
            elf: {
                colors: ['#10b981', '#047857', '#34d399', '#a7f3d0', '#d1fae5'],
                background: 'linear-gradient(135deg, #064e3b, #022c22)',
                music: 'elf-workshop.mp3',
                effects: ['magic-sparkles', 'glow', 'pulse']
            },
            // More themes...
        };
        
        this.currentTheme = 'santa';
    }
    
    applyTheme(themeName) {
        this.currentTheme = themeName;
        const theme = this.themes[themeName];
        
        // Apply CSS variables
        document.documentElement.style.setProperty('--primary-color', theme.colors[0]);
        document.documentElement.style.setProperty('--secondary-color', theme.colors[1]);
        document.documentElement.style.setProperty('--accent-color', theme.colors[2]);
        
        // Apply background
        document.body.style.background = theme.background;
        
        // Play theme music
        this.playThemeMusic(theme.music);
        
        // Apply visual effects
        this.applyEffects(theme.effects);
        
        // Save preference
        localStorage.setItem('theme', themeName);
    }
    
    applyEffects(effectNames) {
        // Remove previous effects
        document.querySelectorAll('.theme-effect').forEach(el => el.remove());
        
        // Add new effects
        effectNames.forEach(effect => {
            this.createEffect(effect);
        });
    }
    
    createEffect(effectName) {
        const effectDiv = document.createElement('div');
        effectDiv.className = `theme-effect ${effectName}`;
        document.body.appendChild(effectDiv);
        
        switch(effectName) {
            case 'snow':
                this.createSnowfall();
                break;
            case 'aurora':
                this.createAurora();
                break;
            case 'sparkles':
                this.createSparkles();
                break;
        }
    }
}