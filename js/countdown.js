class CountdownTimer {
    constructor(targetDate, elementId) {
        this.targetDate = new Date(targetDate).getTime();
        this.elementId = elementId;
        this.interval = null;
    }

    start() {
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    update() {
        const now = new Date().getTime();
        const distance = this.targetDate - now;

        if (distance < 0) {
            this.stop();
            document.getElementById(this.elementId).innerHTML = 
                `<div class="timer-complete">The event has started!</div>`;
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = this.formatTime(days);
        document.getElementById('hours').textContent = this.formatTime(hours);
        document.getElementById('minutes').textContent = this.formatTime(minutes);
        document.getElementById('seconds').textContent = this.formatTime(seconds);
    }

    formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }
}

class AnniversaryCountdown {
    constructor() {
        this.anniversaries = [
            { year: 1, date: '2027-07-11' },
            { year: 2, date: '2028-07-11' },
            { year: 3, date: '2029-07-11' },
            { year: 5, date: '2031-07-11' },
            { year: 10, date: '2036-07-11' }
        ];
        this.container = document.getElementById('anniversary-countdowns');
        this.interval = null;
    }

    start() {
        this.render();
        this.interval = setInterval(() => this.update(), 1000);
    }

    render() {
        this.container.innerHTML = this.anniversaries.map(anniversary => `
            <div class="anniversary-card" id="anniversary-${anniversary.year}">
                <h3 class="anniversary-title">${this.getOrdinal(anniversary.year)} Anniversary in</h3>
                <div class="anniversary-countdown">
                    <div class="anniversary-item">
                        <div class="anniversary-number days-${anniversary.year}">00</div>
                        <div class="anniversary-label">Days</div>
                    </div>
                    <div class="anniversary-item">
                        <div class="anniversary-number hours-${anniversary.year}">00</div>
                        <div class="anniversary-label">Hours</div>
                    </div>
                    <div class="anniversary-item">
                        <div class="anniversary-number minutes-${anniversary.year}">00</div>
                        <div class="anniversary-label">Minutes</div>
                    </div>
                    <div class="anniversary-item">
                        <div class="anniversary-number seconds-${anniversary.year}">00</div>
                        <div class="anniversary-label">Seconds</div>
                    </div>
                </div>
            </div>
        `).join('');
        this.update();
    }

    update() {
        const now = new Date().getTime();

        this.anniversaries.forEach(anniversary => {
            const targetDate = new Date(anniversary.date).getTime();
            const distance = targetDate - now;

            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                this.updateElement(`.days-${anniversary.year}`, this.formatTime(days));
                this.updateElement(`.hours-${anniversary.year}`, this.formatTime(hours));
                this.updateElement(`.minutes-${anniversary.year}`, this.formatTime(minutes));
                this.updateElement(`.seconds-${anniversary.year}`, this.formatTime(seconds));
            } else {
                this.updateElement(`#anniversary-${anniversary.year} .anniversary-title`, 
                    `${this.getOrdinal(anniversary.year)} Anniversary Completed! 🎉`);
                this.updateElement(`#anniversary-${anniversary.year} .anniversary-countdown`, '');
            }
        });
    }

    updateElement(selector, content) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = content;
        }
    }

    formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }

    getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }
}

// Initialize countdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Main wedding countdown
    const weddingDate = 'July 11, 2026 14:00:00';
    const countdownTimer = new CountdownTimer(weddingDate, 'countdown');
    countdownTimer.start();

    // Anniversary countdowns
    const anniversaryCountdown = new AnniversaryCountdown();
    anniversaryCountdown.start();
});