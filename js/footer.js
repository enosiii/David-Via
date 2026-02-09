// Footer Template
const footerTemplate = `
<footer class="site-footer">
    <div class="footer-content">
        <div class="footer-grid">
            <div class="footer-section">
                <h3 class="footer-title">David & Aira</h3>
                <p class="footer-subtitle">July 11, 2026</p>
                <p class="rsvp-reminder">Please RSVP on or before June 11, 2026</p>
                
                <div class="footer-install">
                    <a href="install.html" class="install-link">
                        <i class="fas fa-mobile-alt"></i>
                        <span>Add to Home Screen</span>
                    </a>
                    <p class="install-note">Get easy access to wedding details</p>
                </div>
            </div>
            
            <div class="footer-section">
                <h3 class="footer-title">Quick Links</h3>
                <nav class="footer-nav">
                    <a href="index.html">Home</a>
                    <a href="story.html">Our Story</a>
                    <a href="party.html">Wedding Party</a>
                    <a href="wishes.html">Wishes</a>
                    <a href="registry.html">Registry</a>
                    <a href="rsvp.html">RSVP</a>
                    <a href="game.html">Game</a>
                </nav>
            </div>
            
            <div class="footer-section">
                <h3 class="footer-title">Contact</h3>
                <div class="contact-info">
                    <div class="contact-item">
                        <h4>Groom</h4>
                        <p>David Roy S. Tan</p>
                        <a href="mailto:david@example.com" class="contact-link">
                            <i class="fas fa-envelope"></i> Email
                        </a>
                        <a href="https://m.me/david" class="contact-link">
                            <i class="fab fa-facebook-messenger"></i> Messenger
                        </a>
                    </div>
                    <div class="contact-item">
                        <h4>Bride</h4>
                        <p>Aira Via Gil V. De Jesus</p>
                        <a href="mailto:aira@example.com" class="contact-link">
                            <i class="fas fa-envelope"></i> Email
                        </a>
                        <a href="https://m.me/aira" class="contact-link">
                            <i class="fab fa-facebook-messenger"></i> Messenger
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p class="copyright">© 2026 David Roy S. Tan & Aira Via Gil V. De Jesus - Made with ❤️</p>
            <div class="social-links">
                <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
            </div>
        </div>
    </div>
</footer>

<style>
    .site-footer {
        background-color: #492828;
        color: #EEEEEE;
        padding: 3rem 0 2rem;
        margin-top: 3rem;
    }

    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
    }

    .footer-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .footer-section {
        padding: 1rem;
    }

    .footer-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.3rem;
        color: #AEB877;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #AEB877;
    }

    .footer-subtitle {
        font-size: 1.1rem;
        color: #EEEEEE;
        margin-bottom: 0.5rem;
    }

    .rsvp-reminder {
        font-size: 0.9rem;
        color: #AEB877;
        background: rgba(174, 184, 119, 0.1);
        padding: 0.5rem;
        border-radius: 4px;
        margin: 1rem 0;
    }

    .footer-nav {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .footer-nav a {
        color: #EEEEEE;
        text-decoration: none;
        transition: color 0.3s;
        padding: 0.25rem 0;
    }

    .footer-nav a:hover {
        color: #AEB877;
        padding-left: 5px;
    }

    .contact-info {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .contact-item h4 {
        color: #AEB877;
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }

    .contact-item p {
        color: #EEEEEE;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }

    .contact-links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .contact-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: #84934A;
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.3s;
    }

    .contact-link:hover {
        color: #AEB877;
    }

    .footer-install {
        background: rgba(255, 255, 255, 0.05);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
    }

    .install-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: #EEEEEE;
        background: #84934A;
        padding: 0.75rem 1.5rem;
        border-radius: 5px;
        text-decoration: none;
        font-weight: 500;
        transition: background 0.3s;
    }

    .install-link:hover {
        background: #AEB877;
    }

    .install-note {
        font-size: 0.8rem;
        color: #AEB877;
        margin-top: 0.5rem;
    }

    .footer-bottom {
        border-top: 1px solid rgba(238, 238, 238, 0.1);
        padding-top: 1.5rem;
        text-align: center;
    }

    .copyright {
        color: #EEEEEE;
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }

    .social-links {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    .social-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: rgba(238, 238, 238, 0.1);
        border-radius: 50%;
        color: #EEEEEE;
        text-decoration: none;
        transition: all 0.3s;
    }

    .social-link:hover {
        background: #AEB877;
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
        }

        .footer-nav {
            align-items: center;
        }

        .contact-info {
            align-items: center;
        }

        .install-link {
            justify-content: center;
        }
    }
</style>
`;

// Insert footer into placeholder
document.addEventListener('DOMContentLoaded', () => {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerTemplate;
        
        // Hide install button if PWA is already installed or not supported
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true ||
            !('serviceWorker' in navigator)) {
            const installBtn = document.querySelector('.install-link');
            if (installBtn) {
                installBtn.style.display = 'none';
            }
        }
    }
});