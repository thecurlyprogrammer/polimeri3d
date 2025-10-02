document.addEventListener("DOMContentLoaded", () => {
    var app = document.getElementById('typewriter');

    var typewriter = new Typewriter(app, {
        loop: true
    });

    typewriter.typeString("in realtà.")
        .pauseFor(2500)
        .deleteAll()
        .typeString('in oggetti reali.')
        .pauseFor(2500)
        .deleteAll()
        .typeString('in componenti funzionanti.')
        .pauseFor(2500)
        .deleteAll()
        .typeString('in prototipi.')
        .pauseFor(2500)
        .deleteAll()
        .typeString('in oggetti concreti.')
        .pauseFor(2500)
        .deleteAll()
        .typeString('in prodotti innovativi.')
        .pauseFor(2500)
        .deleteAll()
        //.deleteChars(7)
        .typeString('con la Stampa 3D.')
        .pauseFor(2500)
        .start();
});

// form-validation.js
document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const consentInput = document.getElementById("checkbox");

    function validateForm() {
        const nameValid = nameInput.value.trim() !== "";
        const emailValid = emailInput.validity.valid;
        const checkValid = consentInput.checked;
        
        if (nameValid) {
            nameInput.style.borderColor = "#2ecc71";
        } else {
            nameInput.style.borderColor = "#e74c3c";
        }

        if (emailValid) {
            emailInput.style.borderColor = "#2ecc71";
        } else {
            emailInput.style.borderColor = "#e74c3c";
        }

        if (nameValid && emailValid && checkValid) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }

    // Ascolta i cambiamenti sui campi
    nameInput.addEventListener("input", validateForm);
    emailInput.addEventListener("input", validateForm);
    consentInput.addEventListener("input", validateForm);
});

const form = document.getElementById("guida-pdf");

form.addEventListener("submit", function(e){
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const consentInput = document.getElementById("checkbox");
    const button = document.getElementById("submitBtn");

    setTimeout(() => {
        nameInput.value = "";
        emailInput.value = "";
        consentInput.checked = false;
        button.disabled = true;
    }, 0);
});

function type() {
    const currentWord = words[wordIndex];
    let displayText;

    if (!deleting) {
        // scrittura
        charIndex++;
        displayText = sentenceStart + currentWord.slice(0, charIndex) + sentenceEnd;
        typewriter.textContent = displayText;

        if (charIndex === currentWord.length) {
            // dopo aver scritto tutta la parola, aspetta 2 secondi e inizia a cancellare
            setTimeout(() => deleting = true, 2000);
        }
    } else {
        // cancellazione
        charIndex--;
        displayText = sentenceStart + currentWord.slice(0, charIndex) + sentenceEnd;
        typewriter.textContent = displayText;

        if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length; // passa alla parola successiva
        }
    }

    setTimeout(type, 150); // velocità digitazione/cancellazione
}

// avvia l'effetto
