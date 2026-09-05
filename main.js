document.addEventListener("DOMContentLoaded", () => {

  /* -------------------- Navbar on scroll -------------------- */
  const navbar = document.getElementById("navbar");
  const onScroll = () => {
    if (window.scrollY > 12) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* -------------------- Mobile nav toggle -------------------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navLinks.style.display = open ? "flex" : "";
    });
    navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navLinks.style.display = "";
    }));
  }

  /* -------------------- Reveal on scroll -------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-visible"));
  }

  /* -------------------- Hero interactive network -------------------- */
  (function initHeroNetwork() {
    const canvas = document.getElementById("heroNetwork");
    const hero = document.getElementById("hero");
    if (!canvas || !hero) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const LINE_DIST = 145;
    const MOUSE_DIST = 180;
    const MOUSE_LINE_DIST = 220;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0, height = 0;
    let particles = [];
    let mouse = { x: -9999, y: -9999, active: false };
    let rafId = null;
    let running = false;

    function particleCount() {
      const area = width * height;
      return Math.max(80, Math.min(260, Math.round(area / 4800)));
    }

    function makeParticles() {
      const n = particleCount();
      particles = new Array(n).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
    }

    function resize() {
      const w = hero.clientWidth;
      const h = hero.clientHeight;
      if (w < 200 || h < 200) return;
      width = w;
      height = h;
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      makeParticles();
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (mouse.active) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_DIST && dist > 0.01) {
            const force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.6;
            p.vx += (dx / dist) * force * 0.06;
            p.vy += (dy / dist) * force * 0.06;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINE_DIST) {
            const alpha = (1 - dist / LINE_DIST) * 0.28;
            ctx.strokeStyle = `rgba(210, 226, 236, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (mouse.active) {
        for (const p of particles) {
          const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dist < MOUSE_LINE_DIST) {
            const alpha = (1 - dist / MOUSE_LINE_DIST) * 0.7;
            ctx.strokeStyle = `rgba(143, 195, 224, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(143, 195, 224, 0.9)";
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of particles) {
        ctx.fillStyle = "rgba(230, 240, 246, 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (running) rafId = requestAnimationFrame(step);
    }

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(step);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    resize();
    if (reduceMotion) {
      step();
    } else {
      start();

      const io = ("IntersectionObserver" in window)
        ? new IntersectionObserver((entries) => {
            entries.forEach(entry => entry.isIntersecting ? start() : stop());
          }, { threshold: 0.01 })
        : null;
      if (io) io.observe(hero);

      hero.addEventListener("mousemove", (e) => {
        const rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
      });
      hero.addEventListener("mouseleave", () => { mouse.active = false; });
      hero.addEventListener("touchmove", (e) => {
        if (!e.touches.length) return;
        const rect = hero.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.active = true;
      }, { passive: true });
      hero.addEventListener("touchend", () => { mouse.active = false; });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (reduceMotion) step();
      }, 200);
    });
  })();

  /* -------------------- Hero typewriter -------------------- */
  const twEl = document.getElementById("typewriter");
  if (twEl && window.Typewriter) {
    new window.Typewriter(twEl, { loop: true })
      .typeString("in realtà.").pauseFor(2200).deleteAll()
      .typeString("in prototipi.").pauseFor(2200).deleteAll()
      .typeString("in prodotti innovativi.").pauseFor(2200).deleteAll()
      .start();
  }

  /* -------------------- Gallery lightbox -------------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  document.querySelectorAll(".gallery-grid figure").forEach(fig => {
    fig.addEventListener("click", () => {
      const src = fig.getAttribute("data-full") || fig.querySelector("img").src;
      lightboxImg.src = src;
      lightbox.classList.add("is-open");
    });
  });
  const closeLightbox = () => lightbox.classList.remove("is-open");
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  /* -------------------- Lead magnet form (guida-pdf) -------------------- */
  const leadForm = document.getElementById("guida-pdf");
  if (leadForm) {
    const submitBtn = document.getElementById("submitBtn");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const consentInput = document.getElementById("checkbox");
    submitBtn.disabled = true;

    const validateLead = () => {
      const ok = nameInput.value.trim() !== "" && emailInput.validity.valid && consentInput.checked;
      submitBtn.disabled = !ok;
    };
    [nameInput, emailInput, consentInput].forEach(el => el.addEventListener("input", validateLead));

    leadForm.addEventListener("submit", () => {
      // Il submit è nativo (nessun preventDefault): il browser naviga verso
      // l'endpoint del cliente. Disabilitiamo subito il bottone per evitare
      // doppi invii accidentali durante la navigazione verso la pagina di destinazione.
      submitBtn.disabled = true;
      submitBtn.textContent = "Invio in corso...";
      setTimeout(() => {
        nameInput.value = "";
        emailInput.value = "";
        consentInput.checked = false;
      }, 0);
    });
  }

  /* -------------------- Contact form: dropzone + file chips -------------------- */
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const fileError = document.getElementById("fileError");
  const contactForm = document.getElementById("contactForm");
  const contactSuccess = document.getElementById("contactSuccess");
  const contactError = document.getElementById("contactError");
  const contactErrorReason = document.getElementById("contactErrorReason");
  const contactSubmitBtn = document.getElementById("contactSubmitBtn");

  // FormSubmit accetta allegati fino a un limite TOTALE di 10MB per invio
  // (non 10MB a singolo file: "the sum of each file size must not exceed
  // the 10MB size limit", vedi https://formsubmit.co/documentation).
  // Questo è un controllo lato client, pensato solo per dare un feedback
  // immediato all'utente: non sostituisce una validazione server-side reale,
  // che qui non esiste (vedi report).
  const MAX_TOTAL_SIZE_BYTES = 10 * 1024 * 1024; // 10MB totali

  if (dropzone && fileInput) {
    let currentFiles = [];

    const showFileError = (msg) => {
      if (!fileError) return;
      if (!msg) {
        fileError.textContent = "";
        fileError.classList.remove("is-visible");
      } else {
        fileError.textContent = msg;
        fileError.classList.add("is-visible");
      }
    };

    const renderFiles = () => {
      fileList.innerHTML = "";
      currentFiles.forEach((file, idx) => {
        const chip = document.createElement("span");
        chip.className = "file-chip";
        const sizeLabel = file.size >= 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
          : `${Math.max(1, Math.round(file.size / 1024))}KB`;
        chip.innerHTML = `<span>${file.name} (${sizeLabel})</span>`;
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.setAttribute("aria-label", "Rimuovi file");
        removeBtn.textContent = "✕";
        removeBtn.addEventListener("click", () => {
          currentFiles.splice(idx, 1);
          syncInputFiles();
          renderFiles();
        });
        chip.appendChild(removeBtn);
        fileList.appendChild(chip);
      });
    };

    const syncInputFiles = () => {
      const dt = new DataTransfer();
      currentFiles.forEach(f => dt.items.add(f));
      fileInput.files = dt.files;
    };

    const totalSize = (files) => files.reduce((sum, f) => sum + f.size, 0);

    const addFiles = (fileArr) => {
      const incoming = Array.from(fileArr);
      const accepted = [];
      const rejected = [];
      let runningTotal = totalSize(currentFiles);

      incoming.forEach((f) => {
        if (runningTotal + f.size > MAX_TOTAL_SIZE_BYTES) {
          rejected.push(f);
        } else {
          accepted.push(f);
          runningTotal += f.size;
        }
      });

      accepted.forEach(f => currentFiles.push(f));
      syncInputFiles();
      renderFiles();

      if (rejected.length) {
        const names = rejected.map(f => `"${f.name}"`).join(", ");
        showFileError(
          `Il totale degli allegati supererebbe il limite di 10MB per invio: ${names} ${rejected.length > 1 ? "non sono stati aggiunti" : "non è stato aggiunto"}. Rimuovi qualche file o inviali separatamente via email/WhatsApp.`
        );
      } else {
        showFileError(null);
      }
    };

    dropzone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => addFiles(fileInput.files));

    ["dragenter", "dragover"].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add("is-drag");
      });
    });
    ["dragleave", "drop"].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove("is-drag");
      });
    });
    dropzone.addEventListener("drop", (e) => {
      if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });
  }

  if (contactForm) {
    // FormSubmit.co espone due endpoint diversi:
    // - https://formsubmit.co/<email>            -> pensato per un submit HTML nativo
    //   (risponde con un redirect a una pagina di conferma FormSubmit)
    // - https://formsubmit.co/ajax/<email>        -> pensato per richieste fetch/AJAX
    //   (risponde con JSON se si invia l'header "Accept: application/json")
    // Qui il submit viene intercettato via preventDefault() e inviato con fetch,
    // quindi usiamo l'endpoint /ajax/ dedicato invece dell'action "nativa" impostata
    // nel markup (che resta come fallback per un eventuale submit senza JavaScript).
    const formActionUrl = new URL(contactForm.action);
    const ajaxAction = formActionUrl.origin + "/ajax" + formActionUrl.pathname;

    const submitBtnDefaultLabel = contactSubmitBtn ? contactSubmitBtn.textContent : "";

    const setSubmitting = (isSubmitting) => {
      if (!contactSubmitBtn) return;
      contactSubmitBtn.disabled = isSubmitting;
      contactSubmitBtn.textContent = isSubmitting ? "Invio in corso..." : submitBtnDefaultLabel;
    };

    const hideMessages = () => {
      if (contactSuccess) contactSuccess.classList.remove("is-visible");
      if (contactError) contactError.classList.remove("is-visible");
    };

    contactForm.addEventListener("submit", (e) => {
      // Controllo di sicurezza aggiuntivo: se per qualche motivo il totale allegati
      // superasse il limite dichiarato (es. DataTransfer manipolato), blocchiamo
      // l'invio invece di scoprirlo dopo un fallimento lato server. Va fatto
      // prima di decidere il percorso AJAX/nativo, quindi blocca in ogni caso.
      const currentTotal = Array.from(fileInput ? fileInput.files : []).reduce((sum, f) => sum + f.size, 0);
      if (currentTotal > MAX_TOTAL_SIZE_BYTES) {
        e.preventDefault();
        if (fileError) {
          fileError.textContent = "Il totale degli allegati supera 10MB: rimuovine qualcuno prima di inviare la richiesta.";
          fileError.classList.add("is-visible");
        }
        return;
      }

      // L'endpoint /ajax/ di FormSubmit riceve correttamente i campi testuali
      // ma NON allega i file (limite noto del loro servizio: l'upload file è
      // documentato solo sull'endpoint "nativo"). Quando c'è almeno un file,
      // lasciamo che il form venga inviato normalmente dal browser (nessun
      // preventDefault): FormSubmit gestisce l'allegato e poi reindirizza a
      // "_next" (thanks.html). Senza allegati, restiamo sul flusso AJAX per
      // un feedback immediato senza uscire dalla pagina.
      const hasFiles = fileInput && fileInput.files && fileInput.files.length > 0;
      if (hasFiles) {
        setSubmitting(true);
        return; // submit nativo, nessun preventDefault
      }

      e.preventDefault();
      hideMessages();

      const data = new FormData(contactForm);
      setSubmitting(true);

      fetch(ajaxAction, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`FormSubmit ha risposto con stato ${response.status}`);
          }
          // FormSubmit AJAX risponde SEMPRE con un body JSON valido, ma con
          // l'header Content-Type impostato (in modo errato, lato loro) a
          // "text/html" — quindi non ci si può basare sul content-type per
          // decidere se leggere la risposta come JSON. Il corpo va sempre
          // interpretato come JSON e va controllato il campo "success"
          // (stringa "true"/"false") per sapere l'esito reale.
          const text = await response.text();
          let payload;
          try {
            payload = JSON.parse(text);
          } catch (parseErr) {
            throw new Error("Risposta illeggibile dal servizio di invio: " + text.slice(0, 200));
          }
          if (String(payload.success) !== "true") {
            // FormSubmit restituisce un messaggio utile in inglese, es. quando
            // il form/indirizzo non è ancora stato attivato: lo mostriamo così
            // com'è, è più chiaro di un errore generico.
            const err = new Error(payload.message || "Invio rifiutato dal servizio (success=false)");
            err.formsubmitMessage = payload.message;
            throw err;
          }
          return payload;
        })
        .then(() => {
          contactSuccess.classList.add("is-visible");
          contactForm.reset();
          if (fileList) fileList.innerHTML = "";
          if (fileError) fileError.classList.remove("is-visible");
        })
        .catch((err) => {
          console.error("Invio richiesta di preventivo fallito:", err);
          // Nessun redirect automatico a mailto: perderebbe silenziosamente
          // testo e allegati già inseriti dall'utente. Mostriamo un errore
          // esplicito (con il motivo reale se disponibile) e lasciamo il form
          // compilato così com'è, con contatti alternativi ben visibili.
          if (contactError) {
            if (contactErrorReason) {
              contactErrorReason.textContent = err.formsubmitMessage
                ? `Invio non riuscito: ${err.formsubmitMessage}`
                : "Invio non riuscito.";
            }
            contactError.classList.add("is-visible");
          }
        })
        .finally(() => {
          setSubmitting(false);
        });
    });
  }
});
