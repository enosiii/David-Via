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
        title: 'Wedding of David & Via 💍',
        description: `We are so excited to celebrate our special day with you! 😍
Wedding Ceremony and Reception (2:00 PM at The Royal Branch Events Place)`,
        location: 'The Royal Branch Events Place',
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
                <a href="${url}" download="david-via-wedding.ics" class="calendar-option">
                    <i class="fas fa-apple-alt"></i>
                    <span>Apple Calendar</span>
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
const notificationButtons = Array.from(document.querySelectorAll('[data-enable-notifications]'));
const notificationStatusEls = Array.from(document.querySelectorAll('[data-notification-status]'));

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

function updateNotificationUI(status, message) {
    notificationButtons.forEach(button => {
        if (status === 'enabled') {
            button.textContent = 'Reminders Enabled';
            button.disabled = true;
        } else if (status === 'loading') {
            button.textContent = 'Enabling...';
            button.disabled = true;
        } else {
            button.textContent = 'Enable Wedding Reminders';
            button.disabled = false;
        }
    });

    notificationStatusEls.forEach(el => {
        el.textContent = message;
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

async function subscribeToWeddingNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        updateNotificationUI('idle', 'Push notifications are not supported on this device.');
        return;
    }

    updateNotificationUI('loading', 'Requesting notification access...');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        const message = permission === 'denied'
            ? 'Notifications are blocked in your browser settings.'
            : 'Notification permission was not granted.';
        updateNotificationUI('idle', message);
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();

        let subscription = existingSubscription;
        if (!subscription) {
            const keyResponse = await fetch('/api/push/public-key');
            if (!keyResponse.ok) {
                throw new Error('Unable to load the notification public key.');
            }

            const { publicKey } = await keyResponse.json();
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
        }

        const saveResponse = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscription,
                userAgent: navigator.userAgent,
            }),
        });

        if (!saveResponse.ok) {
            throw new Error('Failed to save your notification subscription.');
        }

        updateNotificationUI('enabled', 'Wedding reminders are enabled on this device.');
    } catch (error) {
        console.error('Notification setup failed:', error);
        updateNotificationUI('idle', 'Unable to enable wedding reminders right now.');
    }
}

async function initializeNotificationUI() {
    if (notificationButtons.length === 0 && notificationStatusEls.length === 0) {
        return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        updateNotificationUI('idle', 'Push notifications are not supported on this device.');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            updateNotificationUI('enabled', 'Wedding reminders are enabled on this device.');
            return;
        }

        if (Notification.permission === 'denied') {
            updateNotificationUI('idle', 'Notifications are blocked in your browser settings.');
            return;
        }

        updateNotificationUI('idle', 'Turn on reminders for wedding countdown notifications.');
    } catch (error) {
        console.error('Notification status check failed:', error);
        updateNotificationUI('idle', 'Turn on reminders for wedding countdown notifications.');
    }
}

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
            if (deferredPrompt && pwaPrompt && !localStorage.getItem('pwaDismissed')) {
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
            if (pwaPrompt) {
                pwaPrompt.style.display = 'none';
            }
        }
    });
}

// Close PWA prompt
document.querySelector('.close-pwa')?.addEventListener('click', () => {
    if (pwaPrompt) {
        pwaPrompt.style.display = 'none';
    }
    localStorage.setItem('pwaDismissed', 'true');
});

document.querySelector('.btn-later')?.addEventListener('click', () => {
    if (pwaPrompt) {
        pwaPrompt.style.display = 'none';
    }
    localStorage.setItem('pwaDismissed', 'true');
});

// Check if PWA is already installed
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    if (pwaPrompt) {
        pwaPrompt.style.display = 'none';
    }
    deferredPrompt = null;
});

notificationButtons.forEach(button => {
    button.addEventListener('click', subscribeToWeddingNotifications);
});

window.addEventListener('load', () => {
    initializeNotificationUI();
});
