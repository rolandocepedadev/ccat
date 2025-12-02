"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import Image from "next/image";
import { usePathname } from "next/navigation";
import HamburgerMenu from "./HamburgerMenu";
import "../app/cosmo-hero.css";

// Register GSAP plugins
gsap.registerPlugin(SplitText, CustomEase);

// Image data - supports both local (/public) and CDN images
interface ImageData {
  src: string;
  alt: string;
  thumbSrc: string;
  isLocal?: boolean; // Optional flag to indicate local images
  priority?: boolean; // Optional flag for priority loading
}

// Helper functions for easier image configuration
const createLocalImage = (
  filename: string,
  alt: string,
  priority = false,
): ImageData => ({
  src: `/images/${filename}`,
  alt,
  thumbSrc: `/images/${filename}`,
  isLocal: true,
  priority,
});

const createCDNImage = (
  src: string,
  alt: string,
  thumbSrc?: string,
  priority = false,
): ImageData => ({
  src,
  alt,
  thumbSrc: thumbSrc || src,
  isLocal: false,
  priority,
});

const IMAGES: ImageData[] = [
  // Mix of local and CDN images using helper functions
  createLocalImage(
    "beige.jpg",
    "Close-up of a curved corner of a sleek, modern device with a smooth dark surface.",
  ),
  createLocalImage(
    "blue.jpg",
    "Close-up view of a rounded corner of a textured, dark gray-blue rectangular object against a matching background.",
  ),
  createCDNImage(
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "Close-up of textured green headphones focusing on the ear cup and headband connection.",
    // true, // Priority loading for center image
  ),
  createLocalImage(
    "orange.jpg",
    "Close-up of a rounded corner of a brown leather phone case with textured surface.",
  ),
  createLocalImage(
    "purple-2.jpg",
    "Close-up of a corner of a tablet with a smooth glass screen and rounded edges on a purple surface.",
  ),

  // Easy to add more images:
  // createLocalImage("your-image.jpg", "Description", false),
  // createCDNImage("https://your-cdn.com/image.jpg", "Description"),
];

const DEFAULT_SLIDE_INDEX = 2;

// Header text for each slide
const HEADER_TEXTS = [
  "writing.",
  "organizing.",
  "collaboration.",
  "chatting.",
  "creating.",
];

export default function CosmoHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<unknown>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const slideshowInitialized = useRef(false);
  const headerTextRef = useRef<HTMLHeadingElement>(null);
  const headerSplitRef = useRef<unknown>(null);
  const pathname = usePathname();
  const [animationKey, setAnimationKey] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [currentHeaderText, setCurrentHeaderText] = useState(
    HEADER_TEXTS[DEFAULT_SLIDE_INDEX],
  );

  // Force animation reset on mount
  useEffect(() => {
    // Reset all states
    slideshowInitialized.current = false;
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    // Force component re-render with new animation key
    setAnimationKey((prev) => prev + 1);

    // Set ready after a small delay to ensure DOM is stable
    setTimeout(() => {
      setIsReady(true);
    }, 50);
  }, [pathname]);

  // Loading Animation - Always runs
  const initLoadingAnimation = useCallback(async () => {
    if (!containerRef.current || !isReady) return;

    const container = containerRef.current;

    // Force reset loading state
    container.classList.add("is--loading", "is--hidden");

    const heading = container.querySelectorAll(".crisp-header__h1");
    const revealImages = container.querySelectorAll(".crisp-loader__group > *");
    const isScaleUp = container.querySelectorAll(".crisp-loader__media");
    const isScaleDown = container.querySelectorAll(
      ".crisp-loader__media .is--scale-down",
    );
    const smallElements = container.querySelectorAll(
      ".crisp-header__top, .crisp-header__p",
    );
    const sliderNav = container.querySelectorAll(
      ".crisp-header__slider-nav > *",
    );

    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline
    const tl = gsap.timeline({
      defaults: {
        ease: "expo.inOut",
      },
      onStart: () => {
        container.classList.remove("is--hidden");
      },
      onComplete: () => {
        container.classList.remove("is--loading");
      },
    });

    timelineRef.current = tl;

    // Handle SplitText
    let split: { words: Element[] } | null = null;
    if (heading.length && typeof window !== "undefined") {
      const splitInstance = new SplitText(Array.from(heading), {
        type: "words",
        mask: "words",
      });
      split = splitInstance as { words: Element[] };
      splitRef.current = split;

      gsap.set(split.words, {
        yPercent: 110,
      });
    }

    // Build animation sequence
    if (revealImages.length) {
      tl.fromTo(
        revealImages,
        { xPercent: 500 },
        {
          xPercent: -500,
          duration: 2.5,
          stagger: 0.05,
        },
        0,
      );
    }

    if (isScaleDown.length) {
      tl.to(
        isScaleDown,
        {
          scale: 0.5,
          duration: 2,
          force3D: true,
          stagger: {
            each: 0.05,
            from: "edges",
            ease: "none",
          },
        },
        "-=0.1",
      );
    }

    if (isScaleUp.length) {
      tl.fromTo(
        isScaleUp,
        {
          width: "10em",
          height: "10em",
        },
        {
          width: "100vw",
          height: "100dvh",
          duration: 2,
          ease: "expo.inOut",
          force3D: true,
        },
        "< 0",
      );
    }

    if (sliderNav.length) {
      tl.from(
        sliderNav,
        {
          yPercent: 150,
          stagger: 0.05,
          ease: "expo.out",
          duration: 1,
        },
        "-=0.9",
      );
    }

    // Animate text
    if (split?.words?.length) {
      tl.to(
        split.words,
        {
          yPercent: 0,
          stagger: 0.075,
          ease: "expo.out",
          duration: 1,
        },
        "< 0.1",
      );
    } else if (heading.length) {
      tl.to(
        heading,
        {
          yPercent: 0,
          opacity: 1,
          ease: "expo.out",
          duration: 1,
        },
        "< 0.1",
      );
    }

    if (smallElements.length) {
      tl.from(
        smallElements,
        {
          opacity: 0,
          ease: "power1.inOut",
          duration: 0.2,
        },
        "< 0.15",
      );
    }

    return tl;
  }, [isReady]);

  // Slideshow initialization
  // Animate header text change with split text
  const animateHeaderText = useCallback(async (newText: string) => {
    if (!headerTextRef.current || typeof window === "undefined") return;

    const header = headerTextRef.current;

    try {
      // Revert previous split if exists
      if (
        headerSplitRef.current &&
        (headerSplitRef.current as { revert?: () => void }).revert
      ) {
        (headerSplitRef.current as { revert: () => void }).revert();
      }

      // Split current text
      const currentSplit = new SplitText(header, {
        type: "chars",
        charsClass: "char",
      });

      // Animate out current text
      await gsap
        .timeline()
        .to(currentSplit.chars, {
          yPercent: -100,
          opacity: 0,
          duration: 0.4,
          stagger: 0.02,
          ease: "power2.in",
        })
        .then();

      // Revert the split
      currentSplit.revert();

      // Hide the header temporarily to prevent flash
      gsap.set(header, { opacity: 0 });

      // Update text
      setCurrentHeaderText(newText);

      // Wait a tick for React to update the DOM
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Split new text
      const newSplit = new SplitText(header, {
        type: "chars",
        charsClass: "char",
      });

      headerSplitRef.current = newSplit;

      // Set initial state for new characters
      gsap.set(newSplit.chars, {
        yPercent: 100,
        opacity: 0,
      });

      // Show the header again
      gsap.set(header, { opacity: 1 });

      // Animate in new text
      gsap.to(newSplit.chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.out",
      });
    } catch (error) {
      // Fallback to simple text change
      console.warn("Text animation failed:", error);
      setCurrentHeaderText(newText);
    }
  }, []);

  const initSlideshow = useCallback(
    (container: HTMLElement) => {
      if (slideshowInitialized.current) return;

      const slides = Array.from(
        container.querySelectorAll('[data-slideshow="slide"]'),
      ) as HTMLElement[];
      const inner = Array.from(
        container.querySelectorAll('[data-slideshow="parallax"]'),
      ) as HTMLElement[];
      const thumbs = Array.from(
        container.querySelectorAll('[data-slideshow="thumb"]'),
      ) as HTMLElement[];

      if (!slides.length || !inner.length || !thumbs.length) return;

      let current = DEFAULT_SLIDE_INDEX;
      let animating = false;

      // Set initial states
      slides.forEach((slide, index) => {
        slide.setAttribute("data-index", index.toString());
        slide.classList.toggle("is--current", index === current);
      });

      thumbs.forEach((thumb, index) => {
        thumb.setAttribute("data-index", index.toString());
        thumb.classList.toggle("is--current", index === current);
      });

      // Navigation function
      const navigate = (
        direction: number,
        targetIndex: number | null = null,
      ) => {
        if (animating) return;
        animating = true;

        const previous = current;
        current =
          targetIndex !== null
            ? targetIndex
            : direction === 1
              ? current < slides.length - 1
                ? current + 1
                : 0
              : current > 0
                ? current - 1
                : slides.length - 1;

        const currentSlide = slides[previous];
        const currentInner = inner[previous];
        const upcomingSlide = slides[current];
        const upcomingInner = inner[current];

        gsap
          .timeline({
            defaults: { duration: 1.5, ease: "power2.inOut" },
            onStart: () => {
              upcomingSlide?.classList.add("is--current");
              thumbs[previous]?.classList.remove("is--current");
              thumbs[current]?.classList.add("is--current");
              // Trigger header text animation
              animateHeaderText(HEADER_TEXTS[current]);
            },
            onComplete: () => {
              currentSlide?.classList.remove("is--current");
              animating = false;
            },
          })
          .to(currentSlide, { xPercent: -direction * 100 }, 0)
          .to(currentInner, { xPercent: direction * 75 }, 0)
          .fromTo(
            upcomingSlide,
            { xPercent: direction * 100 },
            { xPercent: 0 },
            0,
          )
          .fromTo(
            upcomingInner,
            { xPercent: -direction * 75 },
            { xPercent: 0 },
            0,
          );
      };

      // Add click handlers
      thumbs.forEach((thumb) => {
        thumb.addEventListener("click", (event) => {
          const targetIndex = parseInt(
            (event.currentTarget as HTMLElement).getAttribute("data-index") ||
              "0",
            10,
          );
          if (targetIndex === current || animating) return;
          const direction = targetIndex > current ? 1 : -1;
          navigate(direction, targetIndex);
        });
      });

      slideshowInitialized.current = true;
    },
    [animateHeaderText],
  );

  // Preload images - handles both local and CDN sources
  const preloadImages = () => {
    IMAGES.forEach((image, index) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";

      // Handle local vs CDN images differently
      if (image.isLocal) {
        // For local images, use direct path (Next.js will optimize)
        link.href = image.src;
      } else {
        // For CDN images, use Next.js Image optimization
        link.href = `/_next/image?url=${encodeURIComponent(image.src)}&w=1920&q=95`;
      }

      // Set priority based on image priority flag or center position
      if (image.priority || index === DEFAULT_SLIDE_INDEX) {
        link.setAttribute("fetchpriority", "high");
      } else if (index >= 1 && index <= 3) {
        link.setAttribute("fetchpriority", "medium");
      }

      document.head.appendChild(link);

      // Also preload with native Image API as fallback
      const img = new window.Image();
      img.src = image.src;
    });
  };

  // Initialize plugins
  const initPlugins = () => {
    CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");
  };

  // Main initialization effect
  useEffect(() => {
    if (!isReady || typeof window === "undefined") return;

    // Always preload images
    preloadImages();

    // Initialize everything
    const initialize = async () => {
      try {
        initPlugins();

        // Wait for fonts
        await document.fonts.ready;

        // Start animation
        await initLoadingAnimation();

        // Initialize slideshow
        if (containerRef.current) {
          initSlideshow(containerRef.current);
        }
      } catch {
        // Fallback: show content
        if (containerRef.current) {
          containerRef.current.classList.remove("is--loading", "is--hidden");
        }
      }
    };

    initialize();

    // Cleanup function
    return () => {
      if (
        splitRef.current &&
        (splitRef.current as { revert?: () => void }).revert
      ) {
        (splitRef.current as { revert: () => void }).revert();
        splitRef.current = null;
      }
      if (
        headerSplitRef.current &&
        (headerSplitRef.current as { revert?: () => void }).revert
      ) {
        (headerSplitRef.current as { revert: () => void }).revert();
        headerSplitRef.current = null;
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      slideshowInitialized.current = false;
    };
  }, [isReady, animationKey, initLoadingAnimation, initSlideshow]);

  // Debug utility (development only)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      (
        window as unknown as { forceHeroAnimation?: () => void }
      ).forceHeroAnimation = () => {
        setAnimationKey((prev) => prev + 1);
      };
    }
  }, []);

  return (
    <main>
      <section
        ref={containerRef}
        data-slideshow="wrap"
        className="crisp-header is--loading is--hidden"
        role="banner"
        aria-label="Hero section with slideshow"
        key={`hero-${animationKey}`}
      >
        {/* Loader */}
        <div className="crisp-loader" aria-hidden="true">
          <div className="crisp-loader__wrap">
            <div className="crisp-loader__groups">
              {/* Duplicate group (background) */}
              <div className="crisp-loader__group is--duplicate">
                {IMAGES.map((image, index) => (
                  <div
                    key={`duplicate-${index}-${animationKey}`}
                    className="crisp-loader__single"
                  >
                    <div className="crisp-loader__media">
                      <Image
                        className="crisp-loader__cover-img"
                        src={image.src}
                        alt=""
                        width={400}
                        height={400}
                        draggable={false}
                        loading="eager"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Relative group (foreground with animations) */}
              <div className="crisp-loader__group is--relative">
                {IMAGES.map((image, index) => (
                  <div
                    key={`relative-${index}-${animationKey}`}
                    className="crisp-loader__single"
                  >
                    <div
                      className={`crisp-loader__media ${
                        index === DEFAULT_SLIDE_INDEX
                          ? "is--scaling is--radius"
                          : ""
                      }`}
                    >
                      <Image
                        className={`crisp-loader__cover-img ${
                          index !== DEFAULT_SLIDE_INDEX ? "is--scale-down" : ""
                        }`}
                        src={image.src}
                        alt=""
                        width={800}
                        height={800}
                        draggable={false}
                        loading="eager"
                        sizes="100vw"
                        quality={90}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="crisp-loader__fade" />
              <div className="crisp-loader__fade is--duplicate" />
            </div>
          </div>
        </div>

        {/* Slider */}
        <div
          className="crisp-header__slider"
          role="region"
          aria-label="Product slideshow"
          aria-live="polite"
        >
          <div className="crisp-header__slider-list">
            {IMAGES.map((image, index) => (
              <div
                key={`slide-${index}-${animationKey}`}
                data-slideshow="slide"
                className={`crisp-header__slider-slide ${
                  index === DEFAULT_SLIDE_INDEX ? "is--current" : ""
                }`}
                role="img"
                aria-label={image.alt}
              >
                <Image
                  className="crisp-header__slider-slide-inner"
                  src={image.src}
                  alt={image.alt}
                  data-slideshow="parallax"
                  fill
                  style={{ objectFit: "cover" }}
                  draggable={false}
                  priority={image.priority || index === DEFAULT_SLIDE_INDEX}
                  quality={95}
                  sizes="100vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bvnjrQdJTEfOk+zNjDDGjR+YaEtGWgXoI8R2j7wz4n8JQy9FYV4m7yMdD6FOwlVm4FDqLuWCRCEZdQ+lG8o7Qn8UkZ7vhzKs6q8vY9JciE0jh2xHjNX5xSn7DGRQ7XVoHOj8a6P3X+8k9FHFB2X3qf6qFjJASKtpZD4rQOSYGKFSIvYhgtcKzPUKGgQYa8gY+zBDNFpK9u/k5/3nrJ7tCZ/c9K7lGovMKLDjJW4I8MBKn4l3GlGLCKl3tQRaNHhN4z3YXQNOCOLg4zdK9c7sZjB0L0vCxHPTuWaHgQO3+c5O7T3aXTl4d2ydqhzZ2d1Ioz5/wDV/9k="
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="crisp-header__content">
          {/* Top */}
          <header className="crisp-header__top">
            <div className="collide-logo">
              <Image
                src="/images/collide-white.png"
                alt="Collide Logo"
                width={128}
                height={32}
                className="collide-logo__img"
              />
            </div>
            <HamburgerMenu />
          </header>

          {/* Center */}
          <div className="crisp-header__center">
            <h1 className="crisp-header__h1">We just love</h1>
            <h1
              ref={headerTextRef}
              className="crisp-header__h1 crisp-header__h1--animated"
            >
              {currentHeaderText}
            </h1>
          </div>

          {/* Bottom */}
          <nav
            className="crisp-header__bottom"
            role="navigation"
            aria-label="Slideshow navigation"
          >
            <div className="crisp-header__slider-nav">
              {IMAGES.map((image, index) => (
                <button
                  key={`thumb-${index}-${animationKey}`}
                  data-slideshow="thumb"
                  className={`crisp-header__slider-nav-btn ${
                    index === DEFAULT_SLIDE_INDEX ? "is--current" : ""
                  }`}
                  type="button"
                  aria-label={`View ${image.alt}`}
                  aria-pressed={index === DEFAULT_SLIDE_INDEX}
                >
                  <Image
                    loading="eager"
                    src={image.thumbSrc}
                    alt=""
                    className="crisp-loader__cover-img"
                    width={56}
                    height={56}
                    style={{ objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              Currently viewing slide {DEFAULT_SLIDE_INDEX + 1} of{" "}
              {IMAGES.length}: {IMAGES[DEFAULT_SLIDE_INDEX]?.alt}
            </div>
          </nav>
        </div>
      </section>
    </main>
  );
}
