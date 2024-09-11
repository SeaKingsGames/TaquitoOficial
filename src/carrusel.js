const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
let currentIndex = 0;

function showSlide(index) {
    const newIndex = (index + slides.length) % slides.length;
    const offset = -newIndex * 100;
    document.querySelector('.carousel-wrapper').style.transform = `translateX(${offset}%)`;

    dots.forEach(dot => dot.classList.remove('active'));
    dots[newIndex].classList.add('active');

    currentIndex = newIndex;
}

dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide'));
        showSlide(slideIndex);
    });
});

showSlide(currentIndex);

// Optional: Add auto-slide functionality
setInterval(() => {
    showSlide(currentIndex + 1);
}, 5000); // Cambia la imagen cada 5 segundos
