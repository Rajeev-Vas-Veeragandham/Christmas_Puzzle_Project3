// js/story.js
class StoryEngine {
    constructor() {
        this.chapters = [
            {
                id: 1,
                title: "The Frozen Workshop",
                content: "Santa's workshop has frozen solid! The magical gears that power the gift-making machines are stuck. You must solve puzzles to generate heat and thaw the mechanisms...",
                choices: [
                    { text: "Start with small 3x3 puzzles", action: "setDifficulty(1)" },
                    { text: "Jump right into 4x4 challenges", action: "setDifficulty(2)" }
                ],
                unlockRequirement: { puzzlesSolved: 0 }
            },
            {
                id: 2,
                title: "Reindeer Rebellion",
                content: "The gears are turning, but now the reindeer are refusing to fly! They demand proof of your puzzle-solving skills before they'll pull the sleigh...",
                choices: [
                    { text: "Challenge Rudolph to a puzzle duel", action: "startChallenge('rudolph')" },
                    { text: "Solve the reindeer's collective puzzle", action: "startMultiPuzzle()" }
                ],
                unlockRequirement: { puzzlesSolved: 3, bestTime: 120 }
            },
            // More chapters...
        ];
        
        this.currentChapter = 1;
        this.choicesMade = [];
    }
    
    unlockChapter() {
        const userStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
        const nextChapter = this.chapters.find(ch => 
            ch.unlockRequirement.puzzlesSolved <= (userStats.wins || 0) &&
            (!ch.unlockRequirement.bestTime || userStats.bestTime <= ch.unlockRequirement.bestTime)
        );
        
        if (nextChapter && nextChapter.id > this.currentChapter) {
            this.currentChapter = nextChapter.id;
            this.showChapter(nextChapter);
            this.saveProgress();
        }
    }
    
    showChapter(chapter) {
        const modal = document.createElement('div');
        modal.className = 'story-modal';
        modal.innerHTML = `
            <div class="story-content">
                <h2>${chapter.title}</h2>
                <div class="story-text">${chapter.content}</div>
                <div class="story-choices">
                    ${chapter.choices.map((choice, index) => `
                        <button class="story-choice" onclick="${choice.action}; this.closest('.story-modal').remove();">
                            ${choice.text}
                        </button>
                    `).join('')}
                </div>
                <button class="story-skip" onclick="this.closest('.story-modal').remove()">
                    Skip (Play Normally)
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
}