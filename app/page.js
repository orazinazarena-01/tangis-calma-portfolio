'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const ARTWORKS = [
  { id: 0, src: '/assets/image_1.jpeg', title: 'Obra I' },
  { id: 1, src: '/assets/image_2.jpeg', title: 'Obra II' },
  { id: 2, src: '/assets/image_3.jpeg', title: 'Obra III' },
  { id: 3, src: '/assets/image_4.jpeg', title: 'Obra IV' },
  { id: 4, src: '/assets/image_5.jpeg', title: 'Obra V' },
  { id: 5, src: '/assets/image_6.jpeg', title: 'Obra VI' },
  { id: 6, src: '/assets/image_7.jpeg', title: 'Obra VII' },
  { id: 7, src: '/assets/image_8.jpeg', title: 'Obra VIII' },
  { id: 8, src: '/assets/image_9.jpeg', title: 'Obra IX' },
];

const THEME_COLORS = [
  { name: 'BLACK', hex: '#888888', glow: 'rgba(255, 255, 255, 0.2)' },
  { name: 'RED', hex: '#ff2a2a', glow: 'rgba(255, 42, 42, 0.45)' },
  { name: 'GREEN', hex: '#00ff66', glow: 'rgba(0, 255, 102, 0.45)' },
  { name: 'YELLOW', hex: '#ffcc00', glow: 'rgba(255, 204, 0, 0.45)' },
  { name: 'BLUE', hex: '#0099ff', glow: 'rgba(0, 153, 255, 0.45)' },
];

const CUBE_FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'];
const PETALS_COUNT = 9;

export default function Home() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const targetRotationRef = useRef(0);
  const currentRotationRef = useRef(0);
  const animationFrameRef = useRef(null);
  const touchStartXRef = useRef(0);
  const isTouchingRef = useRef(false);

  const [activeColor, setActiveColor] = useState('BLUE');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentFrontIndex, setCurrentFrontIndex] = useState(0);
  const [radius, setRadius] = useState(680);

  const angleStep = 360 / ARTWORKS.length;

  useEffect(() => {
    const handleResize = () => {
      setRadius(window.innerWidth <= 768 ? 460 : 680);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      if (cursorRef.current && window.innerWidth > 768) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleWheel = (e) => {
      if (selectedImage) return;
      targetRotationRef.current -= e.deltaY * 0.04;
    };

    const handleTouchStart = (e) => {
      if (selectedImage) return;
      isTouchingRef.current = true;
      touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      if (!isTouchingRef.current || selectedImage) return;
      const currentX = e.touches[0].clientX;
      const deltaX = (touchStartXRef.current - currentX) * 0.35;
      targetRotationRef.current -= deltaX;
      touchStartXRef.current = currentX;
    };

    const handleTouchEnd = () => {
      isTouchingRef.current = false;
    };

    const updateRotationLoop = () => {
      if (!isTouchingRef.current && !selectedImage) {
        targetRotationRef.current -= 0.05;
      }

      currentRotationRef.current += (targetRotationRef.current - currentRotationRef.current) * 0.08;

      if (ringRef.current) {
        ringRef.current.style.transform = `translateZ(-${radius}px) rotateY(${currentRotationRef.current}deg)`;
      }

      const normalized = ((currentRotationRef.current % 360) + 360) % 360;
      const frontIdx = Math.round((360 - normalized) / angleStep) % ARTWORKS.length;
      setCurrentFrontIndex(frontIdx);

      animationFrameRef.current = requestAnimationFrame(updateRotationLoop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    animationFrameRef.current = requestAnimationFrame(updateRotationLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [selectedImage, angleStep, radius]);

  const handleColorChange = (colorObj) => {
    setActiveColor(colorObj.name);
    document.documentElement.style.setProperty('--accent-color', colorObj.hex);
    document.documentElement.style.setProperty('--accent-glow', colorObj.glow);
  };

  const handleCardMouseMove = (e) => {
    if (window.innerWidth <= 768 || selectedImage) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateYVal = (x / (rect.width / 2)) * -18;
    const rotateXVal = (y / (rect.height / 2)) * 18;

    card.style.transform = `rotateY(${card.dataset.angle}deg) translateZ(${radius}px) rotateY(${rotateYVal}deg) rotateX(${rotateXVal}deg) scale(1.04)`;
  };

  const handleCardMouseLeave = (e) => {
    if (window.innerWidth <= 768 || selectedImage) return;
    const card = e.currentTarget;
    card.style.transform = `rotateY(${card.dataset.angle}deg) translateZ(${radius}px) rotateY(0deg) rotateX(0deg) scale(1)`;
  };

  return (
    <main>
      <div ref={cursorRef} className="cursor-flashlight" />

      {/* Dimmed Artwork Background Layer */}
      <div className="hero-background-wrapper">
        <Image
          src="/assets/image_0.jpeg"
          alt="TANGI'S CALMA Background"
          fill
          priority
          className="hero-bg-image"
        />
      </div>

      {/* Top HUD Header */}
      <header className="hud-header" style={{ opacity: selectedImage ? 0 : 1 }}>
        <div className="hud-left">
          <a
            href="https://www.instagram.com/giulivittadini/"
            target="_blank"
            rel="noopener noreferrer"
            className="hud-link"
          >
            ABOUT
          </a>
        </div>

        <div className="hud-center">TANGI'S CALMA</div>

        <div className="hud-right">
          <a
            href="https://wa.me/5492914414290?text=Hola!%20Me%20contacto%20desde%20tu%20portfolio%20web"
            target="_blank"
            rel="noopener noreferrer"
            className="hud-talk-btn"
          >
            LET'S TALK
          </a>
        </div>
      </header>

      {/* 3D Carousel Stage */}
      <section className={`carousel-stage ${selectedImage ? 'dimmed-depth' : ''}`}>
        <div ref={ringRef} className="carousel-ring">
          
          {/* Central 3D Cube */}
          <div className="axis-cube-3d">
            <div className="cube-inner-wrapper">
              {CUBE_FACES.map((face) => (
                <div key={face} className={`cube-face cube-face-${face}`}>
                  <svg className="cube-flower-svg" viewBox="0 0 100 100">
                    {[...Array(PETALS_COUNT)].map((_, i) => {
                      const angle = i * 40 * (Math.PI / 180);
                      return (
                        <line
                          key={i}
                          x1="50"
                          y1="50"
                          x2={50 + 36 * Math.sin(angle)}
                          y2={50 - 36 * Math.cos(angle)}
                          strokeWidth="3"
                        />
                      );
                    })}
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Double-Sided Artwork Cards */}
          {ARTWORKS.map((art, index) => {
            const cardAngle = index * angleStep;
            const isCenter = index === currentFrontIndex;

            return (
              <div
                key={art.id}
                data-angle={cardAngle}
                className={`carousel-card ${isCenter ? 'active-center' : ''}`}
                style={{
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                onClick={() => setSelectedImage(art)}
              >
                {/* Front Face */}
                <div className="card-face card-front">
                  <div className="card-image-wrapper">
                    <Image
                      src={art.src}
                      alt={art.title}
                      fill
                      className="card-image"
                      sizes="(max-width: 768px) 270px, 300px"
                      priority
                    />
                  </div>
                </div>

                {/* Back Face */}
                <div className="card-face card-back">
                  <svg className="card-back-flower-svg" viewBox="0 0 100 100">
                    {[...Array(PETALS_COUNT)].map((_, i) => {
                      const angle = i * 40 * (Math.PI / 180);
                      return (
                        <line
                          key={i}
                          x1="50"
                          y1="50"
                          x2={50 + 38 * Math.sin(angle)}
                          y2={50 - 38 * Math.cos(angle)}
                          strokeWidth="2.5"
                        />
                      );
                    })}
                    <circle cx="50" cy="50" r="4.5" fill="var(--accent-color)" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Progress Flower Tracker */}
      <div className="bottom-flower-tracker" style={{ opacity: selectedImage ? 0 : 1 }}>
        <svg className="flower-tracker-svg" viewBox="-20 -20 140 140">
          {[...Array(PETALS_COUNT)].map((_, i) => {
            const angle = i * 40 * (Math.PI / 180);
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 44 * Math.sin(angle)}
                y2={50 - 44 * Math.cos(angle)}
                className={`petal-ray ${i <= currentFrontIndex ? 'lit' : ''}`}
              />
            );
          })}
          <circle cx="50" cy="50" r="4.5" className="flower-tracker-center" />
        </svg>
      </div>

      {/* Color Picker Widget */}
      <div className="color-picker-widget" style={{ opacity: selectedImage ? 0 : 1 }}>
        {THEME_COLORS.map((c) => (
          <button
            key={c.name}
            className={`color-option ${activeColor === c.name ? 'active' : ''}`}
            onClick={() => handleColorChange(c)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Lightbox Modal View */}
      {selectedImage && (
        <div className="lightbox-backdrop" onClick={() => setSelectedImage(null)}>
          <button className="lightbox-back-btn" onClick={() => setSelectedImage(null)}>
            <span className="arrow-icon">&lt;</span> BACK
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-image-wrapper">
              <Image
                src={selectedImage.src}
                alt={selectedImage.title}
                fill
                priority
                className="lightbox-image-fit"
                sizes="90vw"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}