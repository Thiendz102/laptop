// Chỉ chạy code khi toàn bộ web (bao gồm ảnh) đã tải xong
window.addEventListener('load', function() {
    
    const track = document.querySelector('.slides-inner');
    // Lấy danh sách slide ban đầu
    let slides = document.querySelectorAll('.slide');
    
    // Kiểm tra nếu không có slide nào thì dừng luôn để tránh lỗi
    if (slides.length === 0) return;

    // Lấy chiều rộng chính xác sau khi ảnh đã tải
    let slideWidth = document.querySelector('.main-slider').clientWidth;

    // --- 1. KHỞI TẠO: CLONE ---
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    firstClone.id = 'first-clone';
    lastClone.id = 'last-clone';

    track.append(firstClone);
    track.prepend(lastClone);

    // Cập nhật lại danh sách slides
    slides = document.querySelectorAll('.slide');

    // Các biến trạng thái
    let index = 1;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let autoSlideInterval;

    // Đặt vị trí ban đầu
    track.style.transform = `translateX(${-slideWidth * index}px)`;

    // --- SỰ KIỆN ---
    slides.forEach((slide, i) => {
        slide.addEventListener('dragstart', (e) => e.preventDefault());
        
        // Touch
        slide.addEventListener('touchstart', touchStart(i));
        slide.addEventListener('touchend', touchEnd);
        slide.addEventListener('touchmove', touchMove);

        // Mouse
        slide.addEventListener('mousedown', touchStart(i));
        slide.addEventListener('mouseup', touchEnd);
        slide.addEventListener('mouseleave', () => { if(isDragging) touchEnd() });
        slide.addEventListener('mousemove', touchMove);
    });

    function touchStart(i) {
        return function(event) {
            isDragging = true;
            clearInterval(autoSlideInterval); 
            track.style.transition = 'none'; // Tắt hiệu ứng để kéo dính tay
            startPos = getPositionX(event);
            animationID = requestAnimationFrame(animation);
            track.style.cursor = 'grabbing';
        }
    }

    function touchMove(event) {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    }

    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        track.style.cursor = 'grab';

        const movedBy = currentTranslate - prevTranslate;

        // --- LOGIC CHẶN LỖI MÀN HÌNH TRẮNG ---
        if (movedBy < -70 && index < slides.length - 1) { // Kéo sang trái
            index++;
        } else if (movedBy > 70 && index > 0) { // Kéo sang phải
            index--;
        }

        setPositionByIndex();
        resetTimer(); 
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function animation() {
        track.style.transform = `translateX(${currentTranslate}px)`;
        if (isDragging) requestAnimationFrame(animation);
    }

    function setPositionByIndex() {
        currentTranslate = index * -slideWidth;
        prevTranslate = currentTranslate;
        track.style.transition = 'transform 0.4s ease-out';
        track.style.transform = `translateX(${currentTranslate}px)`;
        updateDots();
    }

    // --- INFINITE LOOP ---
    track.addEventListener('transitionend', () => {
        if (slides[index].id === 'first-clone') {
            track.style.transition = 'none';
            index = 1;
            track.style.transform = `translateX(${-slideWidth * index}px)`;
            currentTranslate = -slideWidth * index;
            prevTranslate = currentTranslate;
        }
        if (slides[index].id === 'last-clone') {
            track.style.transition = 'none';
            index = slides.length - 2;
            track.style.transform = `translateX(${-slideWidth * index}px)`;
            currentTranslate = -slideWidth * index;
            prevTranslate = currentTranslate;
        }
    });

    // --- DOTS ---
    const dots = document.querySelectorAll('.dot');
    function updateDots() {
        dots.forEach(d => d.classList.remove('active'));
        
        let realDotIndex;
        // Map index từ slider (có clone) sang index của dot (không clone)
        if (index === 0) realDotIndex = dots.length - 1;
        else if (index === slides.length - 1) realDotIndex = 0;
        else realDotIndex = index - 1;

        if(dots[realDotIndex]) dots[realDotIndex].classList.add('active');
    }

    // Support click dots
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
             currentSlide(i);
        });
    });

    function changeSlide(n) {
        if (n > 0) {
            if (index >= slides.length - 1) return; 
            index++;
        } else {
            if (index <= 0) return; 
            index--;
        }
        setPositionByIndex();
        resetTimer();
    }

    function currentSlide(n) {
        index = n + 1;
        setPositionByIndex();
        resetTimer();
    }

    function resetTimer() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => { changeSlide(1); }, 4000);
    }
    
    // Resize Browser: Tính lại chiều rộng
    window.addEventListener('resize', () => {
        slideWidth = document.querySelector('.main-slider').clientWidth;
        track.style.transition = 'none';
        track.style.transform = `translateX(${-slideWidth * index}px)`;
        currentTranslate = -slideWidth * index;
        prevTranslate = currentTranslate;
    });

    // Bắt đầu chạy
    resetTimer();
});