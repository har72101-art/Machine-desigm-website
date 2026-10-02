document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const menuToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

  document.querySelectorAll('.voice-input-btn').forEach((button) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const field = document.getElementById(button.getAttribute('aria-controls'));
    const language = button.parentElement.querySelector('.voice-language');
    const status = button.parentElement.querySelector('.voice-status');

    if (!SpeechRecognition || !field) {
      button.disabled = true;
      status.textContent = 'Voice input is not supported in this browser.';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.continuous = false;

    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') {
        recognition.stop();
        return;
      }

      recognition.lang = language.value;
      status.textContent = 'Listening...';
      try {
        recognition.start();
      } catch {
        status.textContent = 'Could not start voice input. Try again.';
      }
    });

    recognition.addEventListener('start', () => {
      button.textContent = 'Stop listening';
      button.setAttribute('aria-pressed', 'true');
    });

    recognition.addEventListener('result', (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim();

      if (transcript) {
        field.value = `${field.value.trim()}${field.value.trim() ? ' ' : ''}${transcript}`;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        status.textContent = 'Voice text added.';
      }
    });

    recognition.addEventListener('error', (event) => {
      status.textContent = event.error === 'not-allowed'
        ? 'Allow microphone access to use voice input.'
        : event.error === 'no-speech'
          ? 'No speech detected. Try again.'
          : 'Voice input stopped. Try again.';
    });

    recognition.addEventListener('end', () => {
      button.textContent = 'Start voice input';
      button.setAttribute('aria-pressed', 'false');
      if (status.textContent === 'Listening...') status.textContent = '';
    });
  });

  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Thank you! Your inquiry has been submitted successfully.');
      form.reset();
    });
  }
});
