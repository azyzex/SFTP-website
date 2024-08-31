// Get references to DOM elements
const form = document.querySelector("form");
const dropArea = document.querySelector(".drag-area");  
const fileInput = document.querySelector(".file-input");
const progressArea = document.querySelector(".progress-area");
const uploadedArea = document.querySelector(".uploaded-area");
const allowed_EXT = /\.(kdbx|pdf|log|txt)$/i;
const files_name_upload = [];
const goBackBtn = document.getElementById('go-back');
const fileTypes = { kdbx: 0, pdf: 0, log: 0, txt: 0 };
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popup-message");
const popupOkBtn = document.getElementById("popup-ok-btn");
const resetBtn = document.getElementById("reset-btn");
const sendBtn = document.getElementById("send-btn");
const uploadCard1 = document.getElementById("upload-card-1");
const uploadCard2 = document.getElementById("upload-card-2");
const uploadSection = document.getElementById("upload-section");
const fileInputMatlab = document.getElementById('file-input-matlab');
const fileInputKlippel = document.getElementById('file-input-klippel');
let selectedCard = ''; // "matlab" or "klippel"
const dragForm = document.getElementById('drag-form');

// Function to handle fade-out and fade-in transitions
function goBackToSelection() {
  const wrapper = document.querySelector('.wrapper');
  const cards = document.querySelectorAll('.upload-card');
  const titleMatlab = document.getElementById('upload-title-matlab');
  const titleKlippel = document.getElementById('upload-title-klippel');

  // Fade out the upload section and wrapper
  uploadSection.classList.add('fade-out');
  wrapper.classList.add('fade-out');

  // Add fade-out class to titles
  titleMatlab.classList.add('fade-out');
  titleKlippel.classList.add('fade-out');

  // Listen for the end of the transition to remove the fade-out class
  titleMatlab.addEventListener('transitionend', () => {
    titleMatlab.classList.remove('fade-out');
  }, { once: true });

  titleKlippel.addEventListener('transitionend', () => {
    titleKlippel.classList.remove('fade-out');
  }, { once: true });

  // Fade in the card selection after a delay
  setTimeout(() => {
    uploadSection.style.display = 'none'; // Hide the upload section
    uploadSection.classList.remove('fade-in', 'fade-out');
    wrapper.classList.remove('fade-out');
    wrapper.classList.add('fade-in');

    // Show the upload cards
    cards.forEach(card => {
      card.classList.add('fade-in');
      card.classList.remove('fade-out');
      card.style.display = 'flex'; // Ensure cards are visible and flexbox is applied
      card.style.alignItems = 'center'; // Center content vertically
      card.style.justifyContent = 'center'; // Center content horizontally
    });

    // Remove fade-out class from titles
    titleMatlab.classList.remove('fade-out');
    titleKlippel.classList.remove('fade-out');

    // Show the title
    showInitialView();
  }, 500); // Match the fade-out transition time
}
sendBtn.addEventListener("click", () => {
  const files = fileInput.files;
  if (files.length === 0) {
    showToast('Aucun fichier sélectionné', 'red');
    return;
  }

  const formData = new FormData();
  Array.from(files).forEach(file => formData.append('file', file));

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
  .then(response => response.text())
  .then(result => {
    showToast(result, 'green');
  })
  .catch(error => {
    showToast('Erreur lors de l\'envoi des fichiers', 'red');
  });
});
// Display chosen files
function displayFiles(files) {
  const fileList = Array.from(files).map(file => 
    `<li>
      <strong>${file.name}</strong> (${Math.round(file.size / 1024)} KB)
    </li>`
  ).join('');
  uploadedArea.innerHTML = `<ul>${fileList}</ul>`;
}


function showInitialView() {
  const title = document.querySelector('.upload-title');
  if (title) {
    title.style.transition = 'opacity 0.5s';
    title.style.opacity = '1'; // Ensure title is visible
  }
  
  const cards = document.querySelectorAll('.upload-card');
  cards.forEach(card => {
    card.classList.add('fade-in');
    card.classList.remove('fade-out');
    card.style.display = 'block'; // Ensure cards are visible
  });
}

function showToast(message) {
  popupMessage.textContent = message;
  popup.style.display = "block";
}

// Show toast message
function showToast(message, color) {
  const snackbar = document.getElementById("snackbar");
  snackbar.textContent = message;
  snackbar.style.backgroundColor = color;
  snackbar.className = "show";
  
  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000); // Matches CSS transition duration
}

function handleCardClick(cardType) {
  const cardIdMap = {
    matlab: 'upload-card-1',
    klippel: 'upload-card-2'
  };

  const cardId = cardIdMap[cardType];
  if (!cardId) {
    return;
  }

  selectedCard = cardType;
  fadeOutTitle();
  fadeOutTitles();
  setTimeout(() => {
    if (cardType === 'matlab') {
      fadeInTitleMatlab();
    } else if (cardType === 'klippel') {
      fadeInTitleKlippel();
    }
    fadeOutCardsAndShowUploadSection();
  }, 500); // Delay to allow title fade out
}

document.getElementById('upload-card-1').addEventListener('click', () => handleCardClick('matlab'));
document.getElementById('upload-card-2').addEventListener('click', () => handleCardClick('klippel'));

// Handle file input change
fileInput.addEventListener('change', ({ target }) => {
  const files = target.files;
  const maxFiles = selectedCard === 'matlab' ? 3 : 4;

  if (files.length > maxFiles) {
    showToast(`Vous ne pouvez télécharger que ${maxFiles} fichiers.`);
    return;
  }

  const validFiles = validateFiles(files);

  if (validFiles.length > maxFiles) {
    showToast(`Vous ne pouvez télécharger que ${maxFiles} fichiers.`,'red');
    return;
  }

  displayFiles(validFiles);
  validFiles.forEach(file => files_name_upload.push(file.name));
});

// Add this event listener to the drag-form element

dragForm.addEventListener('click', () => {
  fileInput.click();
});

// Function to validate files based on the selected card type
function validateFiles(files) {
  const validFiles = [];
  const invalidFiles = [];
  
  Array.from(files).forEach(file => {
    if (selectedCard === 'matlab' && allowed_EXT.test(file.name) && (file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.log'))) {
      validFiles.push(file);
    } else if (selectedCard === 'klippel' && allowed_EXT.test(file.name) && (file.name.endsWith('.kdbx') || file.name.endsWith('.pdf') || file.name.endsWith('.log'))) {
      validFiles.push(file);
    } else {
      invalidFiles.push(file);
    }
  });

  if (invalidFiles.length > 0) {
    showToast(`Invalid file types: ${invalidFiles.map(file => file.name).join(', ')}`, 'red');
  }

  return validFiles;
}

// Drag and drop events
dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add('dragging');
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove('dragging');
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  dropArea.classList.remove('dragging');
  const files = event.dataTransfer.files;
  const maxFiles = selectedCard === 'matlab' ? 3 : 4;

  if (files.length > maxFiles) {
    showToast(`Vous ne pouvez télécharger que ${maxFiles} fichiers.`,'red');
    return;
  }

  const validFiles = validateFiles(files);

  if (validFiles.length > maxFiles) {
    showToast(`Vous ne pouvez télécharger que ${maxFiles} fichiers.`,'red');
    return;
  }

  // Set the files to the file input element
  fileInput.files = files;

  displayFiles(validFiles);
  validFiles.forEach(file => files_name_upload.push(file.name));
});
// Append files to FormData
function appendFilesToFormData(files) {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('file', file);
  });
  return formData;
}
// Handle form submission
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = appendFilesToFormData(fileInput.files);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.text())
  .then(data => {
    alert(data); // Display the server response
  })
  .catch(error => {
    console.error('Error:', error);
  });
});
// Reset button
resetBtn.addEventListener("click", () => {
  fileInput.value = "";
  uploadedArea.innerHTML = "";
  files_name_upload.length = 0;
  fileTypes.kdbx = 0;
  fileTypes.pdf = 0;
  fileTypes.log = 0;
  fileTypes.txt = 0;
  showToast('Tous les fichiers ont été supprimés.', 'blue'); // Adjust color as needed
});

// Function to fade out title
function fadeOutTitle() {
  const title = document.querySelector('.upload-title');
  if (title) {
    title.style.opacity = '0';
  }
}

// Function to fade in Matlab title
function fadeInTitleMatlab() {
  const titleMatlab = document.getElementById('upload-title-matlab');
  if (titleMatlab) {
    titleMatlab.style.display = 'block';
    setTimeout(() => {
      titleMatlab.style.opacity = '1';
    }, 10); // Small delay to ensure display change is applied
  }
}

// Function to fade in Klippel title
function fadeInTitleKlippel() {
  const titleKlippel = document.getElementById('upload-title-klippel');
  if (titleKlippel) {
    titleKlippel.style.display = 'block';
    setTimeout(() => {
      titleKlippel.style.opacity = '1';
    }, 10); // Small delay to ensure display change is applied
  }
}

// Function to fade out titles
function fadeOutTitles() {
  const titleMatlab = document.getElementById('upload-title-matlab');
  const titleKlippel = document.getElementById('upload-title-klippel');
  if (titleMatlab) {
    titleMatlab.style.opacity = '0';
    setTimeout(() => {
      titleMatlab.style.display = 'none';
    }, 500); // Match the fade-out transition time
  }
  if (titleKlippel) {
    titleKlippel.style.opacity = '0';
    setTimeout(() => {
      titleKlippel.style.display = 'none';
    }, 500); // Match the fade-out transition time
  }
}

// Function to fade out cards and show upload section
function fadeOutCardsAndShowUploadSection() {
  const cards = document.querySelectorAll('.upload-card');

  cards.forEach(card => {
    card.classList.remove('fade-in');
    card.classList.add('fade-out');
  });

  // After all cards have faded out
  setTimeout(() => {
    cards.forEach(card => {
      card.style.display = 'none'; // Hide the cards
    });

    uploadSection.style.display = 'block'; // Show the upload section
    uploadSection.classList.add('fade-in');
    uploadSection.classList.remove('fade-out');
  }, 500); // Match the fade-out transition time
}

// Add event listener to the arrow for going back
goBackBtn.addEventListener('click', goBackToSelection);

// Popup OK button
popupOkBtn.addEventListener("click", () => {
  popup.style.display = 'none';
});

// Ensure the upload section fades in with smooth transition
uploadSection.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
uploadSection.addEventListener('transitionend', () => {
  if (uploadSection.classList.contains('fade-in')) {
    uploadSection.style.opacity = 1;
    uploadSection.style.transform = 'scale(1)';
  }
});
