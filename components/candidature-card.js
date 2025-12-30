
class CandidatureCard extends HTMLElement {
    connectedCallback() {
        const candidature = JSON.parse(this.getAttribute('data-candidature'));
        
        this.innerHTML = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div class="p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800">${candidature.nom}</h3>
                            <p class="text-gray-600">${candidature.poste}</p>
                        </div>
                        <span class="text-sm text-gray-500">${new Date(candidature.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    <div class="mt-4 flex justify-between items-center">
                        <a href="${candidature.cvUrl}" download="${candidature.nom}_CV.pdf" 
                           class="text-teal-600 hover:text-teal-800 flex items-center transition-colors">
                            <i data-feather="download" class="w-4 h-4 mr-1"></i>
                            Télécharger CV
                        </a>
                        <button class="text-red-500 hover:text-red-700 delete-btn flex items-center transition-colors">
                            <i data-feather="trash-2" class="w-4 h-4 mr-1"></i>
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Supprimer cette candidature ?')) {
                this.dispatchEvent(new CustomEvent('delete-candidature', {
                    bubbles: true,
                    detail: candidature.id
                }));
            }
        });
        
        feather.replace();
    }
}
customElements.define('candidature-card', CandidatureCard);