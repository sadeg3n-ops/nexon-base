document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-enabled');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -15% 0px',
    threshold: 0,
  };

  const intersectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll('.reveal-up, .reveal-stagger');
  revealElements.forEach((element) => intersectionObserver.observe(element));

  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) {
    return;
  }

  window.addEventListener('scroll', () => {
    const docElem = document.documentElement;
    const scrollTop = docElem.scrollTop || document.body.scrollTop;
    const scrollHeight = docElem.scrollHeight || document.body.scrollHeight;
    const clientHeight = docElem.clientHeight;
    const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
    progressBar.style.width = `${scrollPercent}%`;
  }, { passive: true });
});
