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

  const portfolioTabs = document.querySelectorAll('.portfolio-tab');
  const portfolioPanels = document.querySelectorAll('.portfolio-panel');

  portfolioTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;

      portfolioTabs.forEach((item) => item.classList.toggle('active', item === tab));
      portfolioPanels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === `${target}-panel`);
      });
    });
  });

  const initGallery = (gallery) => {
    const slides = Array.from(gallery.querySelectorAll('.gallery-slide'));
    const dotsWrap = gallery.querySelector('.gallery-dots');
    const prevButton = gallery.querySelector('.prev');
    const nextButton = gallery.querySelector('.next');
    const interval = Number(gallery.dataset.interval || 2000);

    if (!slides.length) return;

    let activeIndex = 0;
    let timer = null;

    const renderDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `gallery-dot${index === activeIndex ? ' is-active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => {
          activeIndex = index;
          showSlide();
          restartTimer();
        });
        dotsWrap.appendChild(dot);
      });
    };

    const showSlide = () => {
      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === activeIndex);
      });
      renderDots();
    };

    const nextSlide = () => {
      activeIndex = (activeIndex + 1) % slides.length;
      showSlide();
    };

    const previousSlide = () => {
      activeIndex = (activeIndex - 1 + slides.length) % slides.length;
      showSlide();
    };

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const startTimer = () => {
      if (slides.length < 2) return;
      stopTimer();
      timer = setInterval(nextSlide, interval);
    };

    const restartTimer = () => {
      startTimer();
    };

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        previousSlide();
        restartTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        nextSlide();
        restartTimer();
      });
    }

    gallery.addEventListener('mouseenter', stopTimer);
    gallery.addEventListener('mouseleave', startTimer);
    gallery.addEventListener('focusin', stopTimer);
    gallery.addEventListener('focusout', startTimer);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopTimer(); else startTimer();
    });

    if (slides.length === 1) {
      if (prevButton) prevButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
      if (dotsWrap) dotsWrap.style.display = 'none';
    }

    showSlide();
    startTimer();
  };

  document.querySelectorAll('.portfolio-gallery').forEach(initGallery);

  document.querySelectorAll('.voice-input-btn').forEach((button) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const field = document.getElementById(button.getAttribute('aria-controls'));
    const language = button.parentElement.querySelector('.voice-language');
    const status = button.parentElement.querySelector('.voice-status');

    if (!SpeechRecognition || !field) {
      button.disabled = true;
      if (status) status.textContent = 'Voice input is not supported in this browser.';
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
      if (status && status.textContent === 'Listening...') status.textContent = '';
    });
  });

  document.querySelectorAll('.contact-form form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name')?.toString().trim() || 'Not provided',
        company: formData.get('company')?.toString().trim() || 'Not provided',
        email: formData.get('email')?.toString().trim() || 'Not provided',
        service: formData.get('service')?.toString().trim() || 'Not provided',
        message: formData.get('message')?.toString().trim() || 'No project details provided',
        _subject: `New machine design query from ${formData.get('name') || 'customer'}`
      };

      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton ? submitButton.textContent : 'Submit Query';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      try {
        const response = await fetch('https://formsubmit.co/ajax/sac72101@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        alert('Thank you! Your inquiry has been submitted successfully.');
        form.reset();
      } catch (error) {
        alert('There was a problem sending your message. Please email sac72101@gmail.com directly.');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }
    });
  });
});
