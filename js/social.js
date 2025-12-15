// Enhanced Social Features Manager
class SocialManager {
    constructor() {
        this.friends = [];
        this.challenges = [];
        this.onlineUsers = [];
        this.socket = null;
    }
    
    async init() {
        if (!window.authManager || !window.authManager.isAuthenticated) return;
        
        await this.loadFriends();
        await this.loadChallenges();
        this.initWebSocket();
        this.renderSocialDashboard();
    }
    
    async loadFriends() {
        try {
            const userId = window.authManager.user.id;
            const response = await fetch(`/api/friends/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.friends = data.friends;
            }
        } catch (error) {
            console.log('Using offline friend data');
            this.friends = [
                { id: 2, username: 'Rudolph', xp_points: 3200, status: 'accepted' },
                { id: 3, username: 'Elf_Master', xp_points: 4500, status: 'accepted' },
                { id: 4, username: 'Snow_Queen', xp_points: 2800, status: 'pending' }
            ];
        }
    }
    
    async loadChallenges() {
        // Placeholder for challenge loading logic
        this.challenges = [];
    }
    
    initWebSocket() {
        // WebSocket setup for real-time features
        if (typeof WebSocket !== 'undefined' && window.authManager.isAuthenticated) {
            // FIXED: Connect to the same host/port as the server (3000)
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname;
            const port = '3000'; // Match server.js port
            
            this.socket = new WebSocket(`${protocol}//${host}:${port}`);
            
            this.socket.onopen = () => {
                console.log('✅ Connected to social server');
                this.sendAuth();
                this.requestOnlineUsers();
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.socket.onclose = () => {
                console.log('Disconnected from social server');
            };
        }
    }
    
    sendAuth() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'auth',
                userId: window.authManager.user.id
            }));
        }
    }
    
    requestOnlineUsers() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'get_online_users' }));
        }
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'online_users':
                this.onlineUsers = data.users;
                this.updateOnlineStatus();
                break;
            case 'challenge_received':
                this.showChallengeNotification(data);
                break;
        }
    }
    
    renderSocialDashboard() {
        const friendList = document.getElementById('friendList');
        if (friendList) {
            friendList.innerHTML = this.renderFriendList();
        }
    }
    
    renderFriendList() {
        if (this.friends.length === 0) {
            return '<p style="color:white">No friends yet.</p>';
        }
        
        return `
            <div class="friends-container" style="display:flex; flex-direction:column; gap:10px;">
                ${this.friends.map(friend => `
                    <div class="friend-item" style="background:rgba(255,255,255,0.1); padding:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                        <div class="friend-info">
                            <div class="friend-name" style="font-weight:bold; color:white;">
                                ${friend.username}
                                ${friend.online ? '🟢' : '⚪'}
                            </div>
                            <div class="friend-xp" style="font-size:0.8rem; color:#ffd700;">${friend.xp_points} XP</div>
                        </div>
                        <button onclick="socialManager.challengeFriend(${friend.id})" style="background:#d42426; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Vs</button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateOnlineStatus() {
        this.friends.forEach(friend => {
            friend.online = this.onlineUsers.some(user => user.id === friend.id);
        });
        this.renderSocialDashboard();
    }
    
    challengeFriend(friendId) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'send_challenge',
                opponentId: friendId,
                challengeId: Date.now()
            }));
            alert('Challenge sent!');
        } else {
            alert('You must be online to challenge friends.');
        }
    }
    
    showChallengeNotification(data) {
        alert(`⚔️ Challenge Received from ${data.challengerName}!`);
        // In a full app, show a modal to accept/decline
    }
}

// Global instance
window.socialManager = new SocialManager();