class CustomHeader extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                nav {
                    background-color: white;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .nav-link {
                    position: relative;
                    padding-bottom: 2px;
                }
                .nav-link:after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: #0d9488;
                    transition: width 0.3s ease;
                }
                .nav-link:hover:after {
                    width: 100%;
                }
                .mobile-menu {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                }
                .mobile-menu.open {
                    max-height: 500px;
                }
            </style>
            <header>
                <nav class="sticky top-0 z-50">
                    <div class="container mx-auto px-4 py-4">
                        <div class="flex justify-between items-center">
                            <a href="/" class="flex items-center space-x-2">
                                <img src="https://huggingface.co/spaces/Destine-Studio/dr-kugler-s-vampire-medical-haven/resolve/main/images/logo%20caduce%20kugler.png" class="w-8 h-8 object-contain" alt="Logo Cabinet Dr. Kugler">
<span class="text-xl font-bold text-gray-800">Dr. Kugler</span>
</a>
                            <div class="hidden md:flex items-center space-x-6">
                                <a href="/" class="nav-link text-gray-700 hover:text-teal-600 transition-colors duration-300">Accueil</a>
                                <a href="#horaires" class="nav-link text-gray-700 hover:text-teal-600 transition-colors duration-300">Horaires</a>
                                <a href="#contact" class="nav-link text-gray-700 hover:text-teal-600 transition-colors duration-300">Localisation</a>
<div class="relative group">
                                    <button class="nav-link text-gray-700 hover:text-teal-600 flex items-center">
                                        Plus d'infos
                                        <i data-feather="chevron-down" class="w-4 h-4 ml-1 transition-transform group-hover:rotate-180"></i>
                                    </button>
                                    <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                    <a href="contact.html" class="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-300">Prise de rendez-vous</a>
                                    <a href="actus.html" class="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-300">Revue de presse</a>
                                    <a href="nous-trouver.html" class="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-300">Localisation du cabinet</a>
                                    <a href="garde-medicale.html" class="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-300">Garde médicale</a>
                                    <a href="annonces.html" class="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-300">Annonces</a>
                                    <a href="postuler.html" class="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-300">Postuler</a>
                                    <a href="admin-heures-supp.html" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-300">
                                        <i data-feather="clock" class="w-4 h-4 mr-2 text-[#305CDE]"></i>
                                        Heures supplémentaires
                                    </a>
</div>
</div>
<div class="flex items-center space-x-4">
    <a href="#contact" class="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium">Prendre RDV</a>
    <a href="admin-login.html" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors duration-300 flex items-center">
        <i data-feather="lock" class="w-4 h-4 mr-1 text-[#305CDE]"></i>
        Connexion
    </a>
</div>
</div>
                            
                            <button id="mobile-menu-button" class="md:hidden text-gray-700">
                                <i data-feather="menu" class="w-6 h-6"></i>
                            </button>
                        </div>
                        
                        <div id="mobile-menu" class="mobile-menu md:hidden">
                            <div class="pt-4 pb-2 space-y-3">
                                <a href="/" class="block px-3 py-2 text-gray-700 hover:text-teal-600">Accueil</a>
                                <a href="#horaires" class="block px-3 py-2 text-gray-700 hover:text-teal-600">Horaires</a>
                                <a href="#contact" class="block px-3 py-2 text-gray-700 hover:text-teal-600">Localisation</a>
                                
                                <div class="pl-3">
                                    <button class="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:text-teal-600">
                                        Plus d'infos
                                        <i data-feather="chevron-down" class="w-4 h-4"></i>
                                    </button>
                                    <div class="pl-4 mt-1 space-y-2">
                                        <a href="contact.html" class="block px-3 py-2 text-gray-700 hover:text-teal-600">Prise de rendez-vous</a>
                                        <a href="actus.html" class="block px-3 py-2 text-gray-700 hover:text-teal-600">Revue de presse</a>
                                        <a href="nous-trouver.html" class="block px-3 py-2 text-gray-700 hover:text-teal-600">Nous trouver</a>
                                        <a href="postuler.html" class="block px-3 py-2 text-gray-700 hover:text-teal-600">Postuler</a>
</div>
</div>
<a href="#contact" class="block mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium text-center">Prendre RDV</a>
<a href="admin-login.html" class="block mt-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg transition-colors duration-300 text-center flex items-center justify-center">
    <i data-feather="lock" class="w-4 h-4 mr-2 text-[#305CDE]"></i>
    Connexion
</a>
</div>
                        </div>
                    </div>
                </nav>
            </header>
        `;

        // Mobile menu toggle
        const menuButton = this.shadowRoot.getElementById('mobile-menu-button');
        const mobileMenu = this.shadowRoot.getElementById('mobile-menu');

        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            const icon = menuButton.querySelector('i');
            if (mobileMenu.classList.contains('open')) {
                icon.setAttribute('data-feather', 'x');
            } else {
                icon.setAttribute('data-feather', 'menu');
            }
            feather.replace();
        });
    }
}

customElements.define('custom-header', CustomHeader);