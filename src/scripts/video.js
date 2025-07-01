import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let videoContext = null;
let video = null;
let videoSlidesContainer = null;
let slidesContainer = null;
let videoDuration = 0;
let isVideoReady = false;
let scrollTriggerInstance = null;
let isUpdating = false;

async function initVideoController() {
  video = document.querySelector(".main-video");
  videoSlidesContainer = document.querySelector(".video-slides-container");
  slidesContainer = document.querySelector(".slides-container");

  if (!video || !videoSlidesContainer || !slidesContainer) {
    return;
  }

  videoContext = gsap.context(() => {
    setupVideoAndScrollTrigger();
  }, videoSlidesContainer);
}

async function setupVideoAndScrollTrigger() {
  await setupVideo();
  setupScrollTrigger();
  setupEventListeners();
}

function setupVideo() {
  return new Promise((resolve) => {
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const onVideoReady = () => {
      videoDuration = video.duration;
      isVideoReady = true;
      video.currentTime = 0;
      console.log("Video ready, duration:", videoDuration);
      resolve();
    };

    if (video.readyState >= 1) {
      onVideoReady();
    } else {
      video.addEventListener("loadedmetadata", onVideoReady, { once: true });

      if (video.readyState === 0) {
        video.load();
      }
    }
  });
}

function setupScrollTrigger() {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
  }

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: videoSlidesContainer,
    start: "top top",
    end: () => {
      const slidesHeight = slidesContainer.scrollHeight;
      return `+=${slidesHeight - window.innerHeight}`;
    },
    pin: true,
    scrub: true,
    invalidateOnRefresh: true,
    refreshPriority: 1,
    onUpdate: (self) => handleScrollUpdate(self),
    onRefresh: () => {
      if (isVideoReady) {
        video.currentTime = 0;
      }
    },
  });

  // gsap.from(video, {
  //   autoAlpha: 0,
  //   ease: "power1.inOut",
  //   scrollTrigger: {
  //     trigger: video,
  //     start: "top bottom",
  //     end: "top top",
  //     scrub: 1,
  //     invalidateOnRefresh: true,
  //     refreshPriority: 1,
  //   },
  // });

  console.log("ScrollTrigger setup complete");
}

function handleScrollUpdate(self) {
  const progress = self.progress;

  const slideOffset =
    progress * (slidesContainer.scrollHeight - window.innerHeight);
  gsap.set(slidesContainer, { y: -slideOffset });

  updateVideoTime(progress);
}

function updateVideoTime(progress) {
  if (!isVideoReady || videoDuration <= 0 || isUpdating) {
    return;
  }

  isUpdating = true;

  requestAnimationFrame(() => {
    try {
      const targetTime = Math.min(
        progress * videoDuration,
        videoDuration - 0.1
      );

      if (Math.abs(video.currentTime - targetTime) > 0.1) {
        video.currentTime = targetTime;
      }
    } catch (error) {
      console.warn("Error updating video time:", error);
    } finally {
      isUpdating = false;
    }
  });
}

function setupEventListeners() {
  video.addEventListener("play", (e) => {
    e.preventDefault();
    video.pause();
  });

  video.addEventListener("click", (e) => {
    e.preventDefault();
  });

  video.addEventListener("error", () => {
    console.error("Error loading video");
    isVideoReady = false;
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });
}

function cleanupVideo() {
  if (videoContext) {
    videoContext.revert();
    videoContext = null;
  }

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }

  video = null;
  videoSlidesContainer = null;
  slidesContainer = null;
  videoDuration = 0;
  isVideoReady = false;
  isUpdating = false;
}

function initialize() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initVideoController, 100);
    });
  } else {
    setTimeout(initVideoController, 100);
  }
}

initialize();

window.videoController = {
  cleanup: cleanupVideo,
  reinit: initialize,
};
