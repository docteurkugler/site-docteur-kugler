
// Gestion de l'authentification et des événements
document.addEventListener('DOMContentLoaded', async function() {
    // Vérifier l'authentification pour les pages admin
    if (window.location.pathname.includes('admin')) {
        const isAuth = await isAuthenticated();
        if (!isAuth && !window.location.pathname.includes('admin-login.html')) {
            window.location.href = 'admin-login.html?unauthorized=true';
            return;
        }
    }

    // Gestion du bouton de déconnexion
    document.addEventListener('click', function(e) {
        if (e.target.closest('#logout-btn')) {
            e.preventDefault();
            logout();
            window.location.href = 'admin-login.html';
        }
    });

    // Détecter l'inactivité (30 minutes)
    let inactivityTimer;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (window.location.pathname.includes('admin')) {
                logout();
                window.location.href = 'admin-login.html?timeout=true';
            }
        }, 30 * 60 * 1000); // 30 minutes
    }

    // Réinitialiser le timer sur les événements utilisateur
    ['mousemove', 'keypress', 'click', 'scroll'].forEach(event => {
        window.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();
    // Initialiser les employés si nécessaire
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                await addEmployee();
            } catch (error) {
                console.error('Error adding employee:', error);
                showToast('Erreur lors de l\'ajout', 'error');
            }
        });
    }
    // Gestion du formulaire d'heures supplémentaires
    const heuresForm = document.getElementById('heures-form');
    if (heuresForm) {
        heuresForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            try {
                const employeSelect = document.getElementById('employe');
                const employeId = employeSelect.value;
                if (!employeId) {
                    showToast('Veuillez sélectionner un employé', 'error');
                    return;
                }

                const employe = employeSelect.options[employeSelect.selectedIndex].text;
                const date = document.getElementById('date').value;
                const heureDebut = document.getElementById('heure-debut').value;
                const heureFin = document.getElementById('heure-fin').value;
                const motif = document.getElementById('motif').value;

                if (!date || !heureDebut || !heureFin) {
                    showToast('Veuillez remplir tous les champs obligatoires', 'error');
                    return;
                }

                // Calcul de la durée
                const debut = new Date(`2000-01-01T${heureDebut}`);
                const fin = new Date(`2000-01-01T${heureFin}`);
                
                if (fin <= debut) {
                    showToast('L\'heure de fin doit être après l\'heure de début', 'error');
                    return;
                }

                const duree = ((fin - debut) / (1000 * 60 * 60)).toFixed(2);

                const nouvelleHeure = {
                    employeId,
                    employe,
                    date,
                    heureDebut,
                    heureFin,
                    duree,
                    motif,
                    createdAt: new Date().toISOString()
                };

                await saveHeuresSupplementaires(nouvelleHeure);
                this.reset();
                showToast('Heures enregistrées avec succès');
                
                // Rafraîchir l'affichage
                const calendar = document.querySelector('#calendar')?.__fullCalendar;
                if (calendar) calendar.refetchEvents();
                
                loadHeuresSupplementaires();
            } catch (error) {
                console.error('Error saving hours:', error);
                showToast('Erreur lors de la sauvegarde', 'error');
            }
        });
    }
});
    // Initialisation du calendrier
    if (document.getElementById('calendar')) {
        initCalendar('calendar');
    }

    // Gestion des messages entre onglets
    window.addEventListener('message', (event) => {
        if (event.data.type === 'annonces-updated') {
            if (window.loadAnnonces) loadAnnonces();
        }
        if (event.data.type === 'heures-updated') {
            if (window.loadHeuresSupplementaires) loadHeuresSupplementaires();
        }
    });

    // Vérification des permissions pour les actions admin
    function checkAdminPermission() {
        return document.body.classList.contains('admin-page') && 
               localStorage.getItem('authToken');
    }
// Initialize annonces if not exists in IndexedDB
        const existingAnnonces = await getAnnonces();
        if (existingAnnonces.length === 0) {
            const defaultAnnonces = [
                {
                    id: Date.now(),
                    title: "Remplacement du Dr. Kugler",
                    content: "Le Dr. Kugler sera remplacé par le Dr. Dupont du 15 au 20 juin.",
                    important: false,
                    date: new Date().toLocaleDateString('fr-FR'),
                    createdAt: new Date().toISOString()
                },
                {
                    id: Date.now() + 1,
                    title: "Fermeture exceptionnelle",
                    content: "Le cabinet sera exceptionnellement fermé le vendredi 7 juin.",
                    important: true,
                    date: new Date().toLocaleDateString('fr-FR'),
                    createdAt: new Date().toISOString()
                }
            ];

            for (const annonce of defaultAnnonces) {
                await saveAnnonce(annonce);
            }
        }

        // Initialize garde medicale image if not exists in IndexedDB
        const existingGardeImage = await getGardeMedicaleImage();
        if (!existingGardeImage) {
            await saveGardeMedicaleImage('https://huggingface.co/spaces/Destine-Studio/dr-kugler-s-vampire-medical-haven/resolve/main/images/69015.jpg');
        }
        // Initialize heures supplementaires if not exists in IndexedDB
        const existingHeures = await getHeuresSupplementaires();
        if (existingHeures.length === 0) {
            const defaultHeures = [
                {
                    id: 1,
                    employeId: "1",
                    employe: "ODANG Nicolas - Secrétaire médical",
                    date: new Date().toISOString().split('T')[0],
                    heureDebut: "16:00",
                    heureFin: "18:00",
                    duree: "2.00",
                    motif: "Dossier patient urgent",
                    createdAt: new Date().toISOString()
                }
            ];

            for (const heure of defaultHeures) {
                await saveHeuresSupplementaires(heure);
            }
        }
// FullCalendar initialization helper
function initCalendar(containerId) {
    const calendarEl = document.getElementById(containerId);
    if (!calendarEl) return null;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'fr',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const heures = await getHeuresSupplementaires();
                successCallback(heures.map(heure => ({
                    title: `${heure.employe} - ${heure.duree}h`,
                    start: `${heure.date}T${heure.heureDebut}`,
                    end: `${heure.date}T${heure.heureFin}`,
                    backgroundColor: '#0d9488',
                    borderColor: '#0d9488',
                    extendedProps: heure
                })));
            } catch (error) {
                console.error('Error loading calendar events:', error);
                failureCallback(error);
            }
        }
    });

    calendar.render();
    return calendar;
}
// Fonction pour afficher les annonces
async function loadAnnonces() {
    try {
        const annonces = await getAnnonces();
        const container = document.getElementById('annonces-list');
        
        if (!container) return;
        
        container.innerHTML = annonces.length === 0 
            ? '<p class="text-gray-500 text-center py-4">Aucune annonce enregistrée</p>'
            : annonces.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(annonce => `
                    <div class="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 ${annonce.important ? 'border-red-500' : 'border-blue-500'}">
                        <div class="flex justify-between items-start">
                            <h3 class="text-xl font-semibold ${annonce.important ? 'text-red-600' : 'text-gray-800'}">${annonce.title}</h3>
                            <div class="flex items-center gap-2">
                                ${annonce.important ? '<span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Important</span>' : ''}
                                <button class="text-red-500 delete-annonce" data-id="${annonce.id}">
                                    <i data-feather="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                        <p class="mt-2 text-gray-600">${annonce.content}</p>
                        ${annonce.image ? `
                            <div class="mt-4">
                                <img src="${annonce.image}" alt="Image annonce" class="max-w-full h-auto rounded-lg">
                            </div>
                        ` : ''}
                        ${annonce.video ? `
                            <div class="mt-4">
                                <video controls class="max-w-full rounded-lg">
                                    <source src="${annonce.video}" type="video/mp4">
                                </video>
                            </div>
                        ` : ''}
                        <p class="mt-2 text-sm text-gray-500">Publié le ${new Date(annonce.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                `).join('');
        
        // Ajout des gestionnaires d'événements pour la suppression
        document.querySelectorAll('.delete-annonce').forEach(btn => {
            btn.addEventListener('click', async function() {
                if (confirm('Supprimer cette annonce ?')) {
                    await deleteAnnonceDB(this.getAttribute('data-id'));
                    loadAnnonces();
                    showToast('Annonce supprimée');
                }
            });
        });
        
        feather.replace();
    } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
    }
}

// Helper function to show toast notifications
function showToast(message, type = 'success') {
const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
});
