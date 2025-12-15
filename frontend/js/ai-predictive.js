// AI Predictive Analytics for Graduate Feature
class PredictiveAnalytics {
    constructor() {
        this.predictions = {};
    }
    
    async analyzePlayer() {
        try {
            // Get real user ID or default to 1
            const userId = (window.authManager && window.authManager.user) ? window.authManager.user.id : 1;
            
            const response = await fetch(`/api/analytics/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.generatePredictions(data.statistics);
                this.updateDashboard();
            }
        } catch (error) {
            this.generateFallbackPredictions();
        }
    }
    
    generatePredictions(stats) {
        this.predictions = {
            skillLevel: this.calculateSkillLevel(stats),
            nextDifficulty: this.calculateOptimalDifficulty(stats),
            estimatedTime: stats.avg_time ? (stats.avg_time * 0.9).toFixed(0) : 60,
            recommendation: this.getRecommendation(stats)
        };
    }
    
    generateFallbackPredictions() {
        this.predictions = {
            skillLevel: 'Intermediate',
            nextDifficulty: '4×4',
            estimatedTime: '65',
            recommendation: 'Try focusing on solving corners first, then edges'
        };
        this.updateDashboard();
    }
    
    calculateSkillLevel(stats) {
        if (stats.wins > 20) return 'Expert';
        if (stats.wins > 5) return 'Advanced';
        return 'Beginner';
    }
    
    calculateOptimalDifficulty(stats) {
        if (stats.winRate > 70) return '5×5';
        return '4×4';
    }
    
    getRecommendation(stats) {
        if (stats.avg_time > 120) return "Try planning your moves to improve speed.";
        if (stats.winRate < 50) return "Use the 'Hint' power-up when stuck.";
        return "You're doing great! Try a harder difficulty.";
    }
    
    updateDashboard() {
        const aiPanel = document.getElementById('aiSuggestionPanel');
        if (aiPanel) {
            // If the full panel exists (like in main menu)
            aiPanel.innerHTML = `
                <h4><i class="fas fa-robot"></i> AI Analysis</h4>
                <div style="margin-top:10px;">
                    <div style="color:#94a3b8;font-size:0.9rem;">Skill Level</div>
                    <div style="color:#ffd700;font-weight:600;">${this.predictions.skillLevel}</div>
                </div>
                <div style="margin-top:10px;">
                    <div style="color:#94a3b8;font-size:0.9rem;">Rec. Difficulty</div>
                    <div style="color:#ffd700;font-weight:600;">${this.predictions.nextDifficulty}</div>
                </div>
                <div style="margin-top:10px;background:rgba(56,189,248,0.1);padding:10px;border-radius:8px;border-left:3px solid #38bdf8;">
                    <div style="color:#94a3b8;font-size:0.9rem;">AI Suggestion</div>
                    <div style="color:white;margin-top:5px;">${this.predictions.recommendation}</div>
                </div>
            `;
        }
        
        // Also update the simple text element in puzzle.html
        const suggestionText = document.getElementById('aiSuggestionText');
        if (suggestionText) {
            suggestionText.textContent = this.predictions.recommendation;
        }
    }
}

// Global instance
window.aiAnalytics = new PredictiveAnalytics();

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.aiAnalytics.analyzePlayer());
} else {
    window.aiAnalytics.analyzePlayer();
}