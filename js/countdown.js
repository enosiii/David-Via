class CountdownTimer {
    constructor(targetDate, elementId) {
        this.weddingDate = new Date('July 11, 2026 14:00:00');
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

    getNextAnniversary() {
        const now = new Date();
        const weddingYear = this.weddingDate.getFullYear();
        const weddingMonth = this.weddingDate.getMonth();
        const weddingDay = this.weddingDate.getDate();

        // Find which anniversary year we're currently counting toward
        let nextYear = now.getFullYear();
        let nextAnniversary = new Date(nextYear, weddingMonth, weddingDay, 14, 0, 0);

        // If this year's anniversary has already passed, move to next year
        if (now >= nextAnniversary) {
            nextYear += 1;
            nextAnniversary = new Date(nextYear, weddingMonth, weddingDay, 14, 0, 0);
        }

        const anniversaryNumber = nextYear - weddingYear;
        return { date: nextAnniversary, number: anniversaryNumber };
    }

    getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    update() {
        const now = new Date().getTime();
        const distance = this.targetDate - now;

        // Wedding hasn't happened yet — normal wedding countdown
        if (distance > 0) {
            document.getElementById('days').textContent = this.formatTime(Math.floor(distance / (1000 * 60 * 60 * 24)));
            document.getElementById('hours').textContent = this.formatTime(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            document.getElementById('minutes').textContent = this.formatTime(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
            document.getElementById('seconds').textContent = this.formatTime(Math.floor((distance % (1000 * 60)) / 1000));
            return;
        }

        // Wedding has passed — switch to anniversary countdown
        this.stop();

        const { date: nextAnniversary, number: anniversaryNumber } = this.getNextAnniversary();
        const anniversaryDistance = nextAnniversary.getTime() - now;

        // Update the title to show anniversary label
        const titleEl = document.querySelector('.countdown-title');
        if (titleEl) {
            titleEl.textContent = `${this.getOrdinal(anniversaryNumber)} Anniversary in`;
        }

        // Update numbers immediately
        const updateAnniversary = () => {
            const n = new Date().getTime();
            const d = nextAnniversary.getTime() - n;

            if (d <= 0) {
                // Anniversary just hit — restart to pick up the next one
                clearInterval(this.anniversaryInterval);
                this.start();
                return;
            }

            document.getElementById('days').textContent = this.formatTime(Math.floor(d / (1000 * 60 * 60 * 24)));
            document.getElementById('hours').textContent = this.formatTime(Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            document.getElementById('minutes').textContent = this.formatTime(Math.floor((d % (1000 * 60 * 60)) / (1000 * 60)));
            document.getElementById('seconds').textContent = this.formatTime(Math.floor((d % (1000 * 60)) / 1000));
        };

        updateAnniversary();
        this.anniversaryInterval = setInterval(updateAnniversary, 1000);
    }

    formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }
}

// Initialize countdown when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const weddingDate = 'July 11, 2026 14:00:00';
    const countdownTimer = new CountdownTimer(weddingDate, 'countdown');
    countdownTimer.start();
});