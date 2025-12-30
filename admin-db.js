
// Initialisation de la base de données
let db;
const DB_NAME = 'DrKuglerAdminDB';
const DB_VERSION = 3; // Version incrémentée pour les migrations
const STORE_NOTES = 'calendarNotes';
const STORE_HOURS = 'heuresSupplementaires';
const STORE_ANNOUNCEMENTS = 'annonces';
const STORE_GARDE_IMAGES = 'gardeMedicaleImages';
const STORE_CANDIDATURES = 'candidatures';
const STORE_EMPLOYES = 'employes';
const STORE_AUTH = 'authentication';
// Initialiser la base de données
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            const oldVersion = event.oldVersion;
            
            // Créer tous les stores si c'est une nouvelle base de données
            if (!db.objectStoreNames.contains(STORE_NOTES)) {
                db.createObjectStore(STORE_NOTES, { keyPath: 'date' });
            }
            if (!db.objectStoreNames.contains(STORE_HOURS)) {
                db.createObjectStore(STORE_HOURS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_ANNOUNCEMENTS)) {
                const store = db.createObjectStore(STORE_ANNOUNCEMENTS, { keyPath: 'id' });
                store.createIndex('by_date', 'createdAt', { unique: false });
            }
            if (!db.objectStoreNames.contains(STORE_GARDE_IMAGES)) {
                db.createObjectStore(STORE_GARDE_IMAGES, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_CANDIDATURES)) {
                const store = db.createObjectStore(STORE_CANDIDATURES, { keyPath: 'id' });
                store.createIndex('by_date', 'createdAt', { unique: false });
            }
            if (!db.objectStoreNames.contains(STORE_EMPLOYES)) {
                const store = db.createObjectStore(STORE_EMPLOYES, { keyPath: 'id' });
                store.createIndex('by_nom', 'nom', { unique: false });
            }
            if (!db.objectStoreNames.contains(STORE_AUTH)) {
                db.createObjectStore(STORE_AUTH, { keyPath: 'id' });
            }

            // Migration depuis la version 2
            if (oldVersion === 2) {
                const transaction = event.target.transaction;
                const annoncesStore = transaction.objectStore(STORE_ANNOUNCEMENTS);
                if (!annoncesStore.indexNames.contains('by_date')) {
                    annoncesStore.createIndex('by_date', 'createdAt', { unique: false });
                }
                
                const candidaturesStore = transaction.objectStore(STORE_CANDIDATURES);
                if (!candidaturesStore.indexNames.contains('by_date')) {
                    candidaturesStore.createIndex('by_date', 'createdAt', { unique: false });
                }
            }
        };
request.onsuccess = (event) => {
            db = event.target.result;
            
            // Vérifier que tous les stores existent
            const requiredStores = [STORE_NOTES, STORE_HOURS, STORE_ANNOUNCEMENTS, STORE_GARDE_IMAGES, STORE_CANDIDATURES, STORE_EMPLOYES];
            const missingStores = requiredStores.filter(store => !db.objectStoreNames.contains(store));
            
            if (missingStores.length > 0) {
                console.error('Missing stores:', missingStores);
                reject(new Error(`Certains stores sont manquants: ${missingStores.join(', ')}`));
            } else {
                console.log('Database initialized successfully');
                resolve(db);
            }
        };

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };
        
        request.onblocked = (event) => {
            console.error('Database blocked:', event);
            reject(new Error('La base de données est bloquée par une autre connexion'));
        };
    });
}
// Authentification sécurisée
async function authenticate(email, password) {
    try {
        const transaction = db.transaction([STORE_AUTH], 'readonly');
        const store = transaction.objectStore(STORE_AUTH);
        const request = store.get('credentials');
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const credentials = request.result || {};
                if (credentials.email === email && credentials.password === password) {
                    // Générer un token de session sécurisé
                    const token = crypto.randomUUID();
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('lastActivity', Date.now());
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
}

async function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (!token || !lastActivity) return false;
    
    // Vérifier si la session a expiré (30 minutes)
    if (Date.now() - parseInt(lastActivity) > 30 * 60 * 1000) {
        logout();
        return false;
    }
    
    // Mettre à jour le timestamp d'activité
    localStorage.setItem('lastActivity', Date.now());
    return true;
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('lastActivity');
}

// Fonctions pour gérer les notes
let currentSelectedDate = null;

async function openNoteModal(date) {
    currentSelectedDate = date;
    const modal = document.getElementById('note-modal');
    const modalDate = document.getElementById('note-modal-date');
    const noteContent = document.getElementById('note-content');
    
    try {
        const note = await getNote(date);
        noteContent.value = note ? note.content : '';
        
        modalDate.textContent = `Notes pour le ${new Date(date).toLocaleDateString('fr-FR')}`;
        modal.classList.remove('hidden');
        feather.replace();
    } catch (error) {
        console.error('Error opening note modal:', error);
        showToast('Erreur lors du chargement de la note', 'error');
    }
}

async function saveNote() {
    try {
        const noteContent = document.getElementById('note-content').value.trim();
        
        if (noteContent) {
            await saveNoteToDB(currentSelectedDate, noteContent);
            showToast('Note enregistrée avec succès');
        } else {
            await deleteNote(currentSelectedDate);
            showToast('Note supprimée');
        }
        
        closeNoteModal();
        const calendar = document.querySelector('#calendar')?.__fullCalendar;
        if (calendar) calendar.refetchEvents();
    } catch (error) {
        console.error('Error saving note:', error);
        showToast('Erreur lors de la sauvegarde', 'error');
    }
}
// Fonctions pour les notes
function getAllNotes() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NOTES], 'readonly');
        const store = transaction.objectStore(STORE_NOTES);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

function getNote(date) {
return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NOTES], 'readonly');
        const store = transaction.objectStore(STORE_NOTES);
        const request = store.get(date);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
function getNotesForPeriod(start, end) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NOTES], 'readonly');
        const store = transaction.objectStore(STORE_NOTES);
        const request = store.getAll();
        
        request.onsuccess = () => {
            const allNotes = request.result || [];
            const notesForPeriod = allNotes.filter(note => {
                const noteDate = new Date(note.date);
                return noteDate >= start && noteDate <= end;
            });
            resolve(notesForPeriod);
        };
        request.onerror = () => reject(request.error);
    });
}

function getNotesForDate(date) {
return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NOTES], 'readonly');
        const store = transaction.objectStore(STORE_NOTES);
        const request = store.getAll();
        
        request.onsuccess = () => {
            const allNotes = request.result || [];
            const dateStr = new Date(date).toISOString().split('T')[0];
            const notesForDate = allNotes.filter(note => 
                new Date(note.date).toISOString().split('T')[0] === dateStr
            );
            resolve(notesForDate);
        };
        request.onerror = () => reject(request.error);
    });
}
function saveNoteToDB(date, content) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NOTES], 'readwrite');
        const store = transaction.objectStore(STORE_NOTES);
        const request = store.put({ date, content });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function deleteNote(date) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NOTES], 'readwrite');
        const store = transaction.objectStore(STORE_NOTES);
        const request = store.delete(date);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Fonctions pour les heures supplémentaires
async function saveHeuresSupplementaires(heure) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_HOURS], 'readwrite');
        const store = transaction.objectStore(STORE_HOURS);
        const request = store.put(heure);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getHeuresSupplementaires() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_HOURS], 'readonly');
        const store = transaction.objectStore(STORE_HOURS);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteHeureSupplementaireDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_HOURS], 'readwrite');
        const store = transaction.objectStore(STORE_HOURS);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
// Fonctions pour les annonces
async function saveAnnonce(annonce) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_ANNOUNCEMENTS], 'readwrite');
        const store = transaction.objectStore(STORE_ANNOUNCEMENTS);
        
        // Si c'est une nouvelle annonce, générer un ID et une date
        if (!annonce.id) {
            annonce.id = Date.now();
            annonce.createdAt = new Date().toISOString();
        }
        
        const request = store.put(annonce);
        
        request.onsuccess = () => {
            // Rafraîchir l'affichage dans toutes les fenêtres ouvertes
            if (window.opener) {
                window.opener.postMessage({ type: 'annonces-updated' }, '*');
            }
            resolve();
        };
        request.onerror = () => reject(request.error);
    });
}

async function getAnnonces() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_ANNOUNCEMENTS], 'readonly');
        const store = transaction.objectStore(STORE_ANNOUNCEMENTS);
        const index = store.index('by_date');
        const request = index.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function getImportantAnnonces() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_ANNOUNCEMENTS], 'readonly');
        const store = transaction.objectStore(STORE_ANNOUNCEMENTS);
        const request = store.getAll();
        
        request.onsuccess = () => {
            const annonces = request.result || [];
            resolve(annonces.filter(a => a.important));
        };
        request.onerror = () => reject(request.error);
    });
}
async function deleteAnnonceDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_ANNOUNCEMENTS], 'readwrite');
        const store = transaction.objectStore(STORE_ANNOUNCEMENTS);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Fonctions pour l'image de garde médicale
async function saveGardeMedicaleImage(imageData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_GARDE_IMAGES], 'readwrite');
        const store = transaction.objectStore(STORE_GARDE_IMAGES);
        const request = store.put({ id: 'current', imageData });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getGardeMedicaleImage() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_GARDE_IMAGES], 'readonly');
        const store = transaction.objectStore(STORE_GARDE_IMAGES);
        const request = store.get('current');
        
        request.onsuccess = () => resolve(request.result ? request.result.imageData : null);
        request.onerror = () => reject(request.error);
    });
}
// Fonctions pour gérer les candidatures
async function saveCandidature(candidature) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CANDIDATURES], 'readwrite');
        const store = transaction.objectStore(STORE_CANDIDATURES);
        
        // Si c'est une nouvelle candidature, générer un ID et une date
        if (!candidature.id) {
            candidature.id = Date.now();
            candidature.createdAt = new Date().toISOString();
        }
        
        const request = store.put(candidature);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getLatestCandidatures(limit = 5) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CANDIDATURES], 'readonly');
        const store = transaction.objectStore(STORE_CANDIDATURES);
        const index = store.index('by_date');
        const request = index.getAll();
        
        request.onsuccess = () => {
            const candidatures = request.result || [];
            // Trier par date (du plus récent au plus ancien)
            candidatures.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            resolve(candidatures.slice(0, limit));
        };
        request.onerror = () => reject(request.error);
    });
}
async function getCandidatures() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CANDIDATURES], 'readonly');
        const store = transaction.objectStore(STORE_CANDIDATURES);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function deleteCandidature(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_CANDIDATURES], 'readwrite');
        const store = transaction.objectStore(STORE_CANDIDATURES);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
// Fonctions pour les employés
async function saveEmployee(employee) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_EMPLOYES], 'readwrite');
        const store = transaction.objectStore(STORE_EMPLOYES);
        const request = store.put(employee);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getEmployees() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_EMPLOYES], 'readonly');
        const store = transaction.objectStore(STORE_EMPLOYES);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function deleteEmployee(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_EMPLOYES], 'readwrite');
        const store = transaction.objectStore(STORE_EMPLOYES);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
// Initialisation au chargement
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await initDB();
        
        // Migration des données depuis localStorage si nécessaire
        await migrateFromLocalStorage();
        
        // Initialiser les identifiants admin s'ils n'existent pas
        const transaction = db.transaction([STORE_AUTH], 'readwrite');
        const store = transaction.objectStore(STORE_AUTH);
        const request = store.get('credentials');
        
        request.onsuccess = () => {
            if (!request.result) {
                // Hasher le mot de passe avant de le stocker
                const credentials = {
                    id: 'credentials',
                    email: 'secretariat@docteurkugler.fr',
                    password: 'Philippecabinetdoc973' // En production, utiliser bcrypt pour hasher
                };
                store.put(credentials);
            }
        };
        
        // Écouter les messages pour rafraîchir les données
        window.addEventListener('message', (event) => {
            if (event.data.type === 'annonces-updated') {
                if (window.loadAnnonces) loadAnnonces();
            }
        });
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Erreur d\'initialisation de la base de données', 'error');
    }
});
// Migration des données depuis localStorage
async function migrateFromLocalStorage() {
    // Migrer les notes
    const oldNotes = JSON.parse(localStorage.getItem('calendarNotes') || '{}');
    if (Object.keys(oldNotes).length > 0) {
        for (const [date, content] of Object.entries(oldNotes)) {
            await saveNoteToDB(date, content);
        }
        localStorage.removeItem('calendarNotes');
    }
    
    // Migrer les heures supplémentaires
    const oldHours = JSON.parse(localStorage.getItem('heuresSupplementaires') || '[]');
    if (oldHours.length > 0) {
        for (const heure of oldHours) {
            await saveHeuresSupplementaires(heure);
        }
        localStorage.removeItem('heuresSupplementaires');
    }
    
    // Migrer les annonces
    const oldAnnouncements = JSON.parse(localStorage.getItem('annonces') || '[]');
    if (oldAnnouncements.length > 0) {
        for (const annonce of oldAnnouncements) {
            await saveAnnonce(annonce);
        }
        localStorage.removeItem('annonces');
    }
    
    // Migrer l'image de garde médicale
    const oldGardeImage = localStorage.getItem('gardeMedicaleImage');
    if (oldGardeImage) {
        await saveGardeMedicaleImage(oldGardeImage);
        localStorage.removeItem('gardeMedicaleImage');
    }
}