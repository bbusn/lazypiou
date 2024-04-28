/*____________CONSTANTES, VARIABLES ____________*/
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];

const logo = document.getElementById('logo');
const logoPing = document.getElementById('logo-ping');
const reminderForm = document.getElementById('reminder-form');
const reminderFormBackground = document.getElementById('reminder-form-bg');
const reminderList = document.getElementById('reminder-list');
const reminderTitleInput = document.getElementById('reminder-title');
const reminderDescriptionInput = document.getElementById('reminder-description');
const reminderDateInput = document.getElementById('reminder-date');
const reminderAddButton = document.getElementById('reminder-add');

reminderAddButton.addEventListener('click', () => {
    toggleReminderForm();
});

/*____________TOGGLE POP UP POUR CRÉER UN RAPPEL ____________*/
function toggleReminderForm() {
    reminderAddButton.classList.toggle('rotate-45');
    reminderAddButton.classList.toggle('top-3/4');
    reminderAddButton.classList.toggle('top-8');
    reminderFormBackground.classList.toggle('appear50');
    reminderForm.classList.toggle('appear');
}

/*____________AJOUTER UN RAPPEL ____________*/
function addReminder(title, description, date) {
    reminders.push({ title, description, date });
    reminders.sort((a, b) => a.date - b.date);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    // Envoi d'un message avec la date et le titre au service worker pour planifier la notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'scheduleNotification', date, title });
    }
    toggleReminderForm();
    renderReminders();
}

/*____________AFFICHER LES RAPPELS ____________*/
function renderReminders() {
    reminderList.innerHTML = '';
    if (reminders.length === 0) {
        reminderList.innerHTML = '<p class="text-center border-black border-2 w-full sm:w-2/5 bg-white rounded-xl p-3 shadow-md">Vous n\'avez aucun rappel, appuyer sur le plus pour en créer un.</p>';
        return;
    } else {
        reminders.forEach((reminder, index) => {
            const currentDate = new Date().getTime();   
            let date = reminder.date;
            const reminderItem = document.createElement('div');
            reminderItem.classList.add('border-black', 'border-2', 'bg-white', 'rounded-xl', 'p-3', 'shadow-md', 'w-full', 'sm:w-2/5', 'gap-2', 'flex', 'justify-between', 'items-center');
            if (date < currentDate) {
                reminderItem.classList.add('bg-red');
            }
            const formattedDate = new Date(date).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric' });
            reminderItem.innerHTML = `
                <div class="flex justify-evenly items-start flex-col">
                    <div class="flex justify-center items-start flex-col">
                        <h3 class="font-bold text-gray-700 text-lg">${reminder.title}</h3>
                        <p class="font-semibold text-primary text-md">${formattedDate}</p>
                    </div>
                    <p class="font-normal text-xs">${reminder.description}</p>
                </div>
                <button onclick="deleteReminder(${index})" class="border-gray-600 border-2 w-9 h-8 rounded-full bg-yellow-200 flex justify-center items-center relative duration-200 hover:brightness-90 hover:duration-200 active:duration-200 active:scale-75">
                    <span class="h-4 w-0.5 bg-gray-700 absolute rotate-45"></span>
                    <span class="h-4 w-0.5 bg-gray-700 absolute -rotate-45"></span>
                </button>
            `;
            reminderList.appendChild(reminderItem);
        });
    }
    checkReminders();
}

/*____________SUPPRIMER UN RAPPEL ____________*/
function deleteReminder(index) {
    reminders.splice(index, 1);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    renderReminders();
}

/*____________CHECK LORSQUE LE FORMULAIRE DE RAPPEL EST SOUMIS____________*/
reminderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = reminderTitleInput.value.trim();
    const description = reminderDescriptionInput.value.trim();
    const date = new Date(reminderDateInput.value);
    if (title !== '' && description !== '') {
        const currentDate = new Date();
        if (date < currentDate) {
            alert('La date ne peut pas être dans le passé');
            return;
        } else {
            if ('Notification' in window) {
                Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                        alert('Le rappel a bien été ajouté à la date spécifiée');
                    } else {
                        alert('Veuillez autoriser les notifications pour recevoir ce rappel');
                    }
                });
            } else {
                alert('Les notifications ne sont pas prises en charge sur votre appareil');
            }
            addReminder(title, description, date);
            reminderForm.reset();
        }
    } else {
        alert('Veuillez remplir tous les champs');
    }
});

setInterval(() => {
    checkReminders();
}, 5000);

function checkReminders() {
    let late = false;
    const currentDate = new Date().getTime();
    reminders.forEach((reminder, index) => {
        if (reminder.date <= currentDate) {
            late = true;
        }
    });
    if (late) {
        logoPing.classList.remove('invisible');
        logo.src = 'public/images/late.png';
    } else {
        logoPing.classList.add('invisible');
        logo.src = 'public/images/logo.png';
    }
}

// Rendu initial des rappels
renderReminders();