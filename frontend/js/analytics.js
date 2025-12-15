// js/analytics-dashboard.js
class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.metrics = {};
    }
    
    async initialize() {
        await this.loadMetrics();
        this.createCharts();
        this.updateDashboard();
    }
    
    async loadMetrics() {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            
            const response = await fetch(`/api/analytics/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.metrics = data.statistics;
                this.generateInsights();
            }
        } catch (error) {
            console.log('Using offline metrics');
            this.loadSampleMetrics();
        }
    }
    
    createCharts() {
        // Performance over time chart
        const ctx1 = document.getElementById('performanceChart').getContext('2d');
        this.charts.performance = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'Average Time (seconds)',
                        data: [120, 95, 80, 65],
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Average Moves',
                        data: [85, 72, 68, 62],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        // Win rate by version chart
        const ctx2 = document.getElementById('versionChart').getContext('2d');
        this.charts.versions = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Santa', 'Reindeer', 'Elf'],
                datasets: [{
                    data: [45, 30, 25],
                    backgroundColor: ['#ef4444', '#3b82f6', '#10b981'],
                    borderColor: '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#fff' }
                    }
                }
            }
        });
    }
    
    generateInsights() {
        const insights = [];
        
        if (this.metrics.winRate > 70) {
            insights.push({
                type: 'success',
                message: 'Excellent win rate! You should try more challenging puzzles.'
            });
        }
        
        if (this.metrics.avgTime < 60) {
            insights.push({
                type: 'info',
                message: 'You solve puzzles quickly. Try focusing on efficiency over speed.'
            });
        }
        
        // Pattern detection
        const timePattern = this.detectTimePattern();
        if (timePattern) {
            insights.push({
                type: 'pattern',
                message: `You perform best ${timePattern}`
            });
        }
        
        this.displayInsights(insights);
    }
    
    detectTimePattern() {
        // Analyze when user plays best
        const patterns = this.metrics.timeOfDayPattern || {};
        const entries = Object.entries(patterns);
        
        if (entries.length === 0) return null;
        
        const bestHour = entries.reduce((a, b) => a[1] > b[1] ? a : b);
        const hour = parseInt(bestHour[0]);
        
        if (hour < 12) return 'in the morning';
        else if (hour < 17) return 'in the afternoon';
        else return 'in the evening';
    }
}