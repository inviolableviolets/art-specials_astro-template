import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let scrollyContext = null;
let scrollTriggers = [];
let currentImage = null;

function initScrollTelling() {
  cleanup();

  scrollyContext = gsap.context(() => {
    const slider = document.querySelector(".scroll-slider");
    if (!slider) {
      console.warn("No se encontró .scroll-slider");
      return;
    }

    const mediaContainer = slider.querySelector(".scroll-slider__media");
    const cardsContainer = slider.querySelector(".scroll-slider__cards");
    const cards = slider.querySelectorAll(".scroll-slider__cards > ul");

    if (!mediaContainer || !cardsContainer || cards.length === 0) {
      return;
    }

    pinMediaContainer(mediaContainer, slider);

    setupImageTransitions(cards, mediaContainer);

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }, ".scroll-slider");
}

function pinMediaContainer(mediaContainer, slider) {
  const pinTrigger = ScrollTrigger.create({
    trigger: slider,
    start: "top top",
    end: "bottom bottom",
    pin: mediaContainer,
    pinSpacing: false,
    id: "media-pin",
    refreshPriority: 0,
  });

  scrollTriggers.push(pinTrigger);
  console.log("Media container pinned");
}

function setupImageTransitions(cards, mediaContainer) {
  cards.forEach((card, index) => {
    const cardId = card.id;
    if (!cardId) return;

    const figure = mediaContainer.querySelector(`.${cardId}`);
    if (!figure) {
      console.warn(`No se encontró figure para ${cardId}`);
      return;
    }

    const isFirst = index === 0;
    gsap.set(figure, { opacity: isFirst ? 1 : 0 });

    if (isFirst) {
      currentImage = figure;
    }

    const cardTrigger = ScrollTrigger.create({
      trigger: card,
      start: "top center",
      end: "bottom center",
      id: `card-${cardId}`,
      refreshPriority: 0,

      onEnter: () => {
        console.log(`Entrando: ${cardId}`);
        showImage(figure);
      },

      onEnterBack: () => {
        console.log(`Volviendo: ${cardId}`);
        showImage(figure);
      },

      onLeave: () => {
        console.log(`Saliendo: ${cardId}`);
      },

      onLeaveBack: () => {
        console.log(`Saliendo atrás: ${cardId}`);
        if (currentImage === figure) {
          hideImage(figure);
          const prevFigure = getPreviousVisibleImage(figure);
          if (prevFigure) {
            currentImage = prevFigure;
            gsap.to(prevFigure, {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        }
      },
    });

    scrollTriggers.push(cardTrigger);
  });
}

function showImage(figure) {
  if (currentImage === figure) return;

  gsap.to(figure, {
    opacity: 1,
    duration: 0.3,
    ease: "power2.out",
    onComplete: () => {
      if (currentImage && currentImage !== figure) {
        gsap.to(currentImage, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    },
  });

  currentImage = figure;
}

function hideImage(figure) {
  gsap.to(figure, {
    opacity: 0,
    duration: 0.3,
    ease: "power2.out",
  });

  if (currentImage === figure) {
    currentImage = null;
  }
}

function getPreviousVisibleImage(currentFigure) {
  const allFigures = Array.from(
    document.querySelectorAll(".scroll-slider__media figure")
  );
  const currentIndex = allFigures.indexOf(currentFigure);

  for (let i = currentIndex - 1; i >= 0; i--) {
    const figure = allFigures[i];
    const correspondingCard = document.getElementById(figure.className);

    if (correspondingCard) {
      const rect = correspondingCard.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.bottom > windowHeight / 2) {
        return figure;
      }
    }
  }

  return null;
}

function cleanup() {
  if (scrollyContext) {
    scrollyContext.revert();
    scrollyContext = null;
  }

  scrollTriggers.forEach((trigger) => {
    if (trigger && typeof trigger.kill === "function") {
      trigger.kill();
    }
  });
  scrollTriggers = [];
  currentImage = null;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function initialize() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initScrollTelling, 150);
    });
  } else {
    setTimeout(initScrollTelling, 150);
  }

  window.addEventListener(
    "resize",
    debounce(() => {
      ScrollTrigger.refresh();
    }, 250)
  );
}

initialize();

export { initScrollTelling, cleanup };
