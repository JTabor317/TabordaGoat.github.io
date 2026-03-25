const copyButtons = document.querySelectorAll(".copy-snippet");
const year = document.querySelector("#year");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxTitle = document.querySelector(".lightbox-title");
const lightboxBlurb = document.querySelector(".lightbox-blurb");
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

if (lightbox) {
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.style.display = "none";
}

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const snippet = button.closest(".code-snippet");
    const code = snippet ? snippet.querySelector("code") : null;

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
  if (!lightbox || !lightboxImage || !lightboxBlurb || !lightboxCounter) {
    return;
  }

  const currentItem = activeGallery[activeIndex];

  if (!currentItem) {
    return;
  }

  lightboxImage.src = currentItem.src;
  lightboxImage.alt = currentItem.alt;
  if (lightboxTitle) {
    lightboxTitle.textContent = currentItem.title;
  }

  lightboxBlurb.textContent = currentItem.caption;
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
  lightbox.style.display = "grid";
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
  lightbox.style.display = "none";
  document.body.classList.remove("lightbox-open");
  activeGallery = [];
  activeIndex = 0;

  if (lightboxImage) {
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
  }

  if (lightboxTitle) {
    lightboxTitle.textContent = "";
  }

  if (lightboxBlurb) {
    lightboxBlurb.textContent = "";
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
  const triggers = Array.from(projectCard.querySelectorAll(".media-trigger"));
  const galleryItems = triggers
    .map((trigger) => {
      const figure = trigger.closest(".media-card");
      const image = trigger.querySelector("img");
      const caption = figure ? figure.querySelector("figcaption") : null;

      if (!image) {
        return null;
      }

      return {
        title: projectCard.querySelector("h3") ? projectCard.querySelector("h3").textContent.trim() : "Project image",
        src: trigger.getAttribute("href") || image.getAttribute("src"),
        alt: image.getAttribute("alt") || "",
        caption: caption ? caption.textContent.trim() : image.getAttribute("alt") || "",
      };
    })
    .filter(function (item) {
      return Boolean(item);
    });

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
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
