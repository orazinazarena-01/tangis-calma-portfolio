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

  // REFS para evitar re-suscripciones constantes en el useEffect
  const selectedImageRef = useRef(null);
  const radiusRef = useRef(680);
  const frontIndexRef = useRef(0);

  const [activeColor, setActiveColor] = useState('BLUE');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentFrontIndex, setCurrentFrontIndex] = useState(0);

  const angleStep = 360 / ARTWORKS.length;

  // Sincronización de Refs con Estado
  useEffect(() => {
    selectedImageRef.current = selectedImage;
  }, [selectedImage]);

  useEffect(() => {
    // Manejo de tecla Escape para accesibilidad
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedImageRef.current) {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loop de Animación 3D Principal (Ejecución única)
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      radiusRef.current = isMobile ? 460 : 680;
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
      if (selectedImageRef.current) return;
      targetRotationRef.current -= e.deltaY * 0.04;
    };

    const handleTouchStart = (e) => {
      if (selectedImageRef.current) return;
      isTouchingRef.current = true;
      touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      if (!isTouchingRef.current || selectedImageRef.current) return;
      const currentX = e.touches[0].clientX;
      const deltaX = (touchStartXRef.current - currentX) * 0.35;
      targetRotationRef.current -= deltaX;
      touchStartXRef.current = currentX;
    };

    const handleTouchEnd = () => {
      isTouchingRef.current = false;
    };

    const updateRotationLoop = () => {
      // Pausa del loop si la pestaña está oculta o si la obra está abierta en modal
      if (!document.hidden && !selectedImageRef.current) {
        if (!isTouchingRef.current) {
          targetRotationRef.current -= 0.05;
        }

        currentRotationRef.current += (targetRotationRef.current - currentRotationRef.current) * 0.08;

        if (ringRef.current) {
          ringRef.current.style.transform = `translateZ(-${radiusRef.current}px) rotateY(${currentRotationRef.current}deg)`;
        }

        const normalized = ((currentRotationRef.current % 360) + 360) % 360;
        const frontIdx = Math.round((360 - normalized) / angleStep) % ARTWORKS.length;

        // Bailout: Evita re-renders a 60fps si el índice de tarjeta al frente no cambió
        if (frontIdx !== frontIndexRef.current) {
          frontIndexRef.current = frontIdx;
          setCurrentFrontIndex(frontIdx);
        }
      }

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
  }, [angleStep]);

  const handleColorChange = (colorObj) => {
    setActiveColor(colorObj.name);
    document.documentElement.style.setProperty('--accent-color', colorObj.hex);
    document.documentElement.style.setProperty('--accent-glow', colorObj.glow);
  };

  // Tilt 3D optimizado sobre wrapper interno sin intervenir en React State
  const handleCardMouseMove = (e) => {
    if (window.innerWidth <= 768 || selectedImage) return;
    const tiltWrapper = e.currentTarget.querySelector('.card-tilt-wrapper');
    if (!tiltWrapper) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateYVal = (x / (rect.width / 2)) * -18;
    const rotateXVal = (y / (rect.height / 2)) * 18;

    tiltWrapper.style.transform = `rotateY(${rotateYVal}deg) rotateX(${rotateXVal}deg) scale(1.04)`;
  };

  const handleCardMouseLeave = (e) => {
    if (window.innerWidth <= 768 || selectedImage) return;
    const tiltWrapper = e.currentTarget.querySelector('.card-tilt-wrapper');
    if (tiltWrapper) {
      tiltWrapper.style.transform = `rotateY(0deg) rotateX(0deg) scale(1)`;
    }
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
          sizes="100vw"
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

          {/* Accessible 3D Cards Buttons */}
          {ARTWORKS.map((art, index) => {
            const cardAngle = index * angleStep;
            const isCenter = index === currentFrontIndex;

            return (
              <button
                key={art.id}
                type="button"
                aria-label={`Ver ${art.title}`}
                className={`carousel-card ${isCenter ? 'active-center' : ''}`}
                style={{
                  transform: `rotateY(${cardAngle}deg) translateZ(var(--radius))`,
                }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                onClick={() => setSelectedImage(art)}
              >
                <div className="card-tilt-wrapper">
                  {/* Front Face */}
                  <div className="card-face card-front">
                    <div className="card-image-wrapper">
                      <Image
                        src={art.src}
                        alt={art.title}
                        fill
                        className="card-image"
                        sizes="(max-width: 768px) 270px, 300px"
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
              </button>
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
            type="button"
            aria-pressed={activeColor === c.name}
            className={`color-option ${activeColor === c.name ? 'active' : ''}`}
            onClick={() => handleColorChange(c)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Lightbox Modal View */}
      {selectedImage && (
        <button
          type="button"
          aria-label="Cerrar vista amplia"
          className="lightbox-backdrop"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="lightbox-back-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <span className="arrow-icon">&lt;</span> BACK
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-image-wrapper">
              <Image
                src={selectedImage.src}
                alt={selectedImage.title}
                fill
                className="lightbox-image-fit"
                sizes="90vw"
              />
            </div>
          </div>
        </button>
      )}
    </main>
  );
}