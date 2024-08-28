let currentIndex = 0;
const images = document.querySelectorAll('.gallery-item img');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');

function openLightbox(index) {
    currentIndex = index;
    lightboxImage.src = images[currentIndex].src;
    lightbox.style.display = 'flex';
    document.addEventListener('keydown', handleKeydown);
    lightbox.addEventListener('touchstart', handleTouchStart, false);
    lightbox.addEventListener('touchmove', handleTouchMove, false);
}

function closeLightbox() {
    lightbox.style.display = 'none';
    document.removeEventListener('keydown', handleKeydown);
    lightbox.removeEventListener('touchstart', handleTouchStart, false);
    lightbox.removeEventListener('touchmove', handleTouchMove, false);
}

function changeImage(step) {
    currentIndex += step;
    if (currentIndex >= images.length) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = images.length - 1;
    }
    lightboxImage.src = images[currentIndex].src;
}

function handleKeydown(event) {
    if (event.key === 'ArrowLeft') {
        changeImage(-1);
    } else if (event.key === 'ArrowRight') {
        changeImage(1);
    }
}

// 滑动切换
let xStart = null;

function handleTouchStart(event) {
    const firstTouch = event.touches[0];
    xStart = firstTouch.clientX;
}

function handleTouchMove(event) {
    if (!xStart) {
        return;
    }

    let xEnd = event.touches[0].clientX;
    let xDiff = xStart - xEnd;

    if (xDiff > 0) {
        // 向左滑动
        changeImage(1);
    } else {
        // 向右滑动
        changeImage(-1);
    }

    xStart = null; // 重置起始点
}
