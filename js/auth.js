// Simplified Authentication Manager for Demo
class AuthManager {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.token = localStorage.getItem('token') || null;
        this.isAuthenticated = !!this.user;
    }
    
    init() {
        this.renderAuthSection();
    }
    
    renderAuthSection() {
        const authSection = document.getElementById('authSection');
        if (!authSection) return;
        
        if (this.isAuthenticated && this.user) {
            const firstLetter = this.user.username.charAt(0).toUpperCase();
            authSection.innerHTML = `
                <div class="auth-user" style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.1);border-radius:20px;">
                    <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ff6b6b);display:flex;align-items:center;justify-content:center;font-weight:bold;">
                        ${firstLetter}
                    </div>
                    <div>
                        <div style="font-weight:600;color:white;">${this.user.username}</div>
                        <div style="color:#ffd700;font-size:0.9rem;">${this.user.xp_points} XP</div>
                    </div>
                    <button onclick="authManager.logout()" style="background:none; border:none; color:#ff6b6b; cursor:pointer;"><i class="fas fa-sign-out-alt"></i></button>
                </div>
            `;
        } else {
            authSection.innerHTML = `
                <button onclick="window.showAuthModal()" style="background:linear-gradient(135deg,#d42426,#a00);color:white;border:none;padding:10px 20px;border-radius:20px;cursor:pointer;display:flex;align-items:center;gap:10px;">
                    <i class="fas fa-user"></i> Login
                </button>
            `;
        }
    }
    
    async login(username, password) {
        try {
            // Login via Backend API
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.user = data.user;
                this.isAuthenticated = true;
                
                localStorage.setItem('user', JSON.stringify(this.user));
                
                this.renderAuthSection();
                
                // Initialize social features after login
                if (window.socialManager) window.socialManager.init();
                
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.log('Login error', error);
            return { success: false, message: 'Server error' };
        }
    }
    
    logout() {
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user');
        this.renderAuthSection();
        location.reload();
    }
}

// Global instance
window.authManager = new AuthManager();

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.authManager.init());
} else {
    window.authManager.init();
}