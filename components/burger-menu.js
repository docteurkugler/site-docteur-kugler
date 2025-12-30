
class BurgerMenu extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .burger-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1000;
        }
        .burger-button {
          background: white;
          border: 2px solid #305CDE;
border-radius: 8px;
          width: 50px;
          height: 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          outline: none;
        }
        
        .burger-button:focus {
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.3);
        }
        .burger-line {
          width: 24px;
          height: 3px;
          background: #305CDE;
          margin: 3px 0;
          transition: all 0.3s ease;
          display: block;
        }
.burger-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
width: 250px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          z-index: 1001;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-20px);
          max-height: 0;
          overflow: hidden;
        }
        
        .burger-menu.open {
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
          max-height: 500px;
          padding: 1rem 0;
        }
        
        .burger-menu a {
          display: flex;
          align-items: center;
          padding: 0.8rem 1.5rem;
          color: #374151;
          text-decoration: none;
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        
        .burger-menu a:hover {
          color: #0d9488;
          background: rgba(13, 148, 136, 0.1);
        }
        
        .burger-menu a i {
          width: 18px;
          height: 18px;
          margin-right: 12px;
        }
        
        .burger-menu a.admin-link {
          border-top: 1px solid #e5e7eb;
          margin-top: 0.5rem;
          padding-top: 0.8rem;
        }
        
        /* Overlay when menu is open */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          display: none;
        }
        
        .overlay.open {
          display: block;
          opacity: 1;
          pointer-events: all;
        }
.overlay.open {
          opacity: 1;
          pointer-events: all;
        }
      </style>
      
      <div class="burger-container">
        <button class="burger-button" aria-label="Menu" aria-expanded="false">
          <span class="burger-line"></span>
          <span class="burger-line"></span>
          <span class="burger-line"></span>
        </button>
        
        <div class="burger-menu">
          <a href="/"><i data-feather="home"></i> Accueil</a>
          <a href="contact.html"><i data-feather="calendar"></i> Prendre RDV</a>
          <a href="actus.html"><i data-feather="book-open"></i> Revue de presse</a>
          <a href="nous-trouver.html"><i data-feather="map-pin"></i> Nous trouver</a>
          <a href="garde-medicale.html"><i data-feather="shield"></i> Garde médicale</a>
          <a href="annonces.html"><i data-feather="bell"></i> Annonces</a>
          <a href="postuler.html"><i data-feather="briefcase"></i> Postuler</a>
<a href="admin-login.html" class="admin-link">
            <i data-feather="lock" class="text-[#305CDE]"></i> Espace pro
          </a>
</div>
        
        <div class="overlay"></div>
      </div>
    `;

    const button = this.shadowRoot.querySelector('.burger-button');
    const menu = this.shadowRoot.querySelector('.burger-menu');
    const overlay = this.shadowRoot.querySelector('.overlay');
    const lines = this.shadowRoot.querySelectorAll('.burger-line');

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.toggle('open');
      overlay.classList.toggle('open');
      button.setAttribute('aria-expanded', isOpen);
      
      // Animate burger lines
      if (isOpen) {
        lines[0].style.transform = 'translateY(8px) rotate(45deg)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'translateY(-8px) rotate(-45deg)';
      } else {
        lines.forEach(line => {
          line.style.transform = '';
          line.style.opacity = '';
        });
      }
    });

    // Close menu when clicking outside
    overlay.addEventListener('click', () => {
      menu.classList.remove('open');
      overlay.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      lines.forEach(line => {
        line.style.transform = '';
        line.style.opacity = '';
      });
    });

    // Close menu when clicking a link
    const links = this.shadowRoot.querySelectorAll('.burger-menu a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        overlay.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        lines.forEach(line => {
          line.style.transform = '';
          line.style.opacity = '';
        });
      });
    });

    // Initialize feather icons
    if (window.feather) {
      window.feather.replace({ class: 'feather', width: 18, height: 18 });
    }
  }
}
customElements.define('burger-menu', BurgerMenu);