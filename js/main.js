// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.navbar')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Add to Calendar Function
function addToCalendar() {
    const event = {
        title: 'David & Aira Wedding',
        description: 'Wedding ceremony of David Roy S. Tan and Aira Via Gil V. De Jesus',
        location: 'Church Name, Reception Name',
        startTime: '2026-07-11T14:00:00',
        endTime: '2026-07-11T22:00:00'
    };

    // Google Calendar
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=20260711T140000/20260711T220000&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&sf=true&output=xml`;
    
    // iCal download
    const icalData = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
DTSTART:20260711T140000
DTEND:20260711T220000
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icalData], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a modal for calendar options
    const modal = document.createElement('div');
    modal.className = 'calendar-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add to Calendar</h3>
            <div class="calendar-options">
                <a href="${googleUrl}" target="_blank" class="calendar-option">
                    <i class="fab fa-google"></i>
                    <span>Google Calendar</span>
                </a>
                <a href="${url}" download="david-aira-wedding.ics" class="calendar-option">
                    <i class="fas fa-apple-alt"></i>
                    <span>Apple Calendar</span>
                </a>
                <a href="${url}" download="david-aira-wedding.ics" class="calendar-option">
                    <i class="fab fa-microsoft"></i>
                    <span>Outlook</span>
                </a>
            </div>
            <button class="modal-close">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles for modal
    const style = document.createElement('style');
    style.textContent = `
        .calendar-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
        }
        .calendar-options {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 1.5rem 0;
        }
        .calendar-option {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f5f5f5;
            border-radius: 8px;
            text-decoration: none;
            color: #333;
            transition: background 0.3s;
        }
        .calendar-option:hover {
            background: #e0e0e0;
        }
        .calendar-option i {
            font-size: 1.5rem;
        }
        .modal-close {
            background: #84934A;
            color: white;
            border: none;
            padding: 0.5rem 1.5rem;
            border-radius: 5px;
            cursor: pointer;
            width: 100%;
        }
    `;
    document.head.appendChild(style);
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }
    });
}

// PWA Install Prompt
let deferredPrompt;
const pwaPrompt = document.getElementById('pwa-prompt');
const installButton = document.getElementById('install-pwa');

// Only show PWA prompt if not already installed
if (window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true) {
    console.log('Running in standalone mode');
} else {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show the PWA prompt after 3 seconds
        setTimeout(() => {
            if (deferredPrompt && !localStorage.getItem('pwaDismissed')) {
                pwaPrompt.style.display = 'block';
            }
        }, 3000);
    });
}

// Install PWA
if (installButton) {
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
            pwaPrompt.style.display = 'none';
        }
    });
}

// Close PWA prompt
document.querySelector('.close-pwa')?.addEventListener('click', () => {
    pwaPrompt.style.display = 'none';
    localStorage.setItem('pwaDismissed', 'true');
});

document.querySelector('.btn-later')?.addEventListener('click', () => {
    pwaPrompt.style.display = 'none';
    localStorage.setItem('pwaDismissed', 'true');
});

// Check if PWA is already installed
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    pwaPrompt.style.display = 'none';
    deferredPrompt = null;
});