const copyButtons = document.querySelectorAll(".copy-snippet");
const year = document.querySelector("#year");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxCounter = document.querySelector(".lightbox-counter");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxCloseButtons = document.querySelectorAll("[data-lightbox-close]");

let activeGallery = [];
let activeIndex = 0;
let lastTrigger = null;

if (year) {
  year.textContent = new Date().getFullYear();
}

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.closest(".code-snippet")?.querySelector("code");

    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code.textContent.trim());
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1600);
    } catch (error) {
      button.textContent = "Select text";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1600);
    }
  });
});

function updateLightbox() {
  if (!lightbox || !lightboxImage || !lightboxCaption || !lightboxCounter) {
    return;
  }

  const currentItem = activeGallery[activeIndex];

  if (!currentItem) {
    return;
  }

  lightboxImage.src = currentItem.src;
  lightboxImage.alt = currentItem.alt;
  lightboxCaption.textContent = currentItem.caption;
  lightboxCounter.textContent = `${activeIndex + 1} / ${activeGallery.length}`;

  const disableNavigation = activeGallery.length <= 1;

  if (lightboxPrev) {
    lightboxPrev.disabled = disableNavigation;
  }

  if (lightboxNext) {
    lightboxNext.disabled = disableNavigation;
  }
}

function openLightbox(galleryItems, index, trigger) {
  if (!lightbox || galleryItems.length === 0) {
    return;
  }

  activeGallery = galleryItems;
  activeIndex = index;
  lastTrigger = trigger;

  updateLightbox();
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");

  if (lightboxClose) {
    lightboxClose.focus();
  }
}

function closeLightbox() {
  if (!lightbox) {
    return;
  }

  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  activeGallery = [];
  activeIndex = 0;

  if (lightboxImage) {
    lightboxImage.src = "";
    lightboxImage.alt = "";
  }

  if (lightboxCaption) {
    lightboxCaption.textContent = "";
  }

  if (lightboxCounter) {
    lightboxCounter.textContent = "";
  }

  if (lastTrigger) {
    lastTrigger.focus();
    lastTrigger = null;
  }
}

function stepLightbox(offset) {
  if (activeGallery.length <= 1) {
    return;
  }

  activeIndex = (activeIndex + offset + activeGallery.length) % activeGallery.length;
  updateLightbox();
}

document.querySelectorAll(".project-card").forEach((projectCard) => {
  const figures = Array.from(projectCard.querySelectorAll(".media-card"));
  const galleryItems = figures
    .map((figure) => {
      const image = figure.querySelector("img");
      const caption = figure.querySelector("figcaption");

      if (!image) {
        return null;
      }

      return {
        src: image.getAttribute("src"),
        alt: image.getAttribute("alt") || "",
        caption: caption?.textContent.trim() || image.getAttribute("alt") || "",
      };
    })
    .filter(Boolean);

  figures.forEach((figure, index) => {
    const trigger = figure.querySelector(".media-trigger");

    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", () => {
      openLightbox(galleryItems, index, trigger);
    });
  });
});

if (lightboxPrev) {
  lightboxPrev.addEventListener("click", () => {
    stepLightbox(-1);
  });
}

if (lightboxNext) {
  lightboxNext.addEventListener("click", () => {
    stepLightbox(1);
  });
}

lightboxCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeLightbox();
  });
});

document.addEventListener("keydown", (event) => {
  if (!lightbox || lightbox.hidden) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    stepLightbox(-1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    stepLightbox(1);
  }
});
