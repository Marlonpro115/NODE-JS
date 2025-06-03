document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;

    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});

const coverModal = document.getElementById('coverModal');
const coverImage = document.getElementById('coverImage');
const coverModalLabel = document.getElementById('coverModalLabel');

coverModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const imageSrc = button.getAttribute('data-image');
    const title = button.getAttribute('data-title');

    coverImage.src = imageSrc;
    coverImage.alt = `Portada del libro: ${title}`;
    coverModalLabel.textContent = `Portada del libro: ${title}`;
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
