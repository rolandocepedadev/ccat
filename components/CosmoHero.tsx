"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import HamburgerMenu from "./HamburgerMenu";
import "../app/cosmo-hero.css";

// Register GSAP plugins - will be done dynamically in useEffect

export default function CosmoHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<unknown>(null);

  // Image data - ordered to match original HTML sequence (sleek, teal, green, orange, tablet)
  const images = [
    {
      src: "https://cdn.prod.website-files.com/69158db916f2854de7fae735/69158e74238022f91976b287_sleek-device-close-up.avif",
      alt: "Close-up of a curved corner of a sleek, modern device with a smooth dark surface.",
      thumbSrc:
        "https://cdn.prod.website-files.com/69158db916f2854de7fae735/69158e74238022f91976b287_sleek-device-close-up.avif",
    },
    {
      src: "https://cdn.prod.website-files.com/69158db916f2854de7fae735/69158e74238022f91976b268_minimalist-teal-design.avif",
      alt: "Close-up view of a rounded corner of a textured, dark gray-blue rectangular object against a matching background.",
      thumbSrc:
        "https://cdn.prod.website-files.com/69158db916f2854de7fae735/69158e74238022f91976b268_minimalist-teal-design.avif",
    },
    {
      src: "https://cdn.prod.website-files.com/69158db916f2854de7fae735/69158e74238022f91976b241_green-headphone-close-up.avif",
      alt: "Close-up of textured green headphones focusing on the ear cup and headband connection.",
      thumbSrc:
        "https://cdn.prod.website-files.com/69158db916f2854de7fae735/69158e74238022f91976b241_green-headphone-close-up.avif",
    },
    {
      src: "https://cdn.prod.website-files.com/69158db916f2854de7fae735/69158e74238022f91976b278_orange-leather-case.avif",
      alt: "Close-up of a rounded corner of a brown leather phone case with textured surface.",
      thumbSrc:
        "https://cdn.prod.website-files.com/69158db916f2854de7fae735/69158e74238022f91976b278_orange-leather-case.avif",
    },
    {
      src: "https://cdn.prod.website-files.com/69158db916f2854de7fae735/69158e74238022f91976b258_modern-device-close-up.avif",
      alt: "Close-up of a corner of a tablet with a smooth glass screen and rounded edges on a purple surface.",
      thumbSrc:
        "https://cdn.prod.website-files.com/69158db916f2854de7fae735/69158e74238022f91976b258_modern-device-close-up.avif",
    },
  ];

  // Loading Animation
  const initCrispLoadingAnimation = async () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const heading = container.querySelectorAll(".crisp-header__h1");
    const revealImages = container.querySelectorAll(".crisp-loader__group > *");
    const isScaleUp = container.querySelectorAll(".crisp-loader__media");
    const isScaleDown = container.querySelectorAll(
      ".crisp-loader__media .is--scale-down",
    );
    const isRadius = container.querySelectorAll(
      ".crisp-loader__media.is--scaling.is--radius",
    );
    const smallElements = container.querySelectorAll(
      ".crisp-header__top, .crisp-header__p",
    );
    const sliderNav = container.querySelectorAll(
      ".crisp-header__slider-nav > *",
    );

    /* GSAP Timeline */
    const tl = gsap.timeline({
      defaults: {
        ease: "expo.inOut",
      },
      onStart: () => {
        container.classList.remove("is--hidden");
      },
    });

    /* GSAP SplitText */
    let split: unknown;
    if (heading.length && typeof window !== "undefined") {
      try {
        const gsapPlugins = await import("gsap/all");
        const { SplitText } = gsapPlugins;
        split = new SplitText(heading, {
          type: "words",
          mask: "words",
        });
        splitRef.current = split;

        gsap.set((split as { words: Element[] }).words, {
          yPercent: 110,
        });
      } catch {
        // Fallback: animate the heading directly
        gsap.set(heading, {
          yPercent: 110,
          opacity: 0,
        });
      }
    }

    /* Start of Timeline */
    if (revealImages.length) {
      tl.fromTo(
        revealImages,
        {
          xPercent: 500,
        },
        {
          xPercent: -500,
          duration: 2.5,
          stagger: 0.05,
        },
      );
    }

    if (isScaleDown.length) {
      tl.to(
        isScaleDown,
        {
          scale: 0.5,
          duration: 2,
          stagger: {
            each: 0.05,
            from: "edges",
            ease: "none",
          },
          onComplete: () => {
            if (isRadius) {
              isRadius.forEach((el: Element) =>
                el.classList.remove("is--radius"),
              );
            }
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
        },
        "< 0.5",
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

    if (
      split &&
      (split as { words: Element[] }).words &&
      (split as { words: Element[] }).words.length
    ) {
      tl.to(
        (split as { words: Element[] }).words,
        {
          yPercent: 0,
          stagger: 0.075,
          ease: "expo.out",
          duration: 1,
        },
        "< 0.1",
      );
    } else if (heading.length) {
      // Fallback animation for heading
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

    tl.call(
      function () {
        container.classList.remove("is--loading");
      },
      [],
      "+=0.45",
    );
  };

  // Slideshow
  const initSlideShow = (el: HTMLElement) => {
    const ui = {
      el,
      slides: Array.from(
        el.querySelectorAll('[data-slideshow="slide"]'),
      ) as HTMLElement[],
      inner: Array.from(
        el.querySelectorAll('[data-slideshow="parallax"]'),
      ) as HTMLElement[],
      thumbs: Array.from(
        el.querySelectorAll('[data-slideshow="thumb"]'),
      ) as HTMLElement[],
    };

    let current = 2; // Start with green headphones (center image from loading)
    const length = ui.slides.length;
    let animating = false;
    const animationDuration = 1.5;

    ui.slides.forEach((slide, index) =>
      slide.setAttribute("data-index", index.toString()),
    );
    ui.thumbs.forEach((thumb, index) =>
      thumb.setAttribute("data-index", index.toString()),
    );

    ui.slides[current]?.classList.add("is--current");
    ui.thumbs[current]?.classList.add("is--current");

    function navigate(direction: number, targetIndex: number | null = null) {
      if (animating) return;
      animating = true;

      const previous = current;
      current =
        targetIndex !== null && targetIndex !== undefined
          ? targetIndex
          : direction === 1
            ? current < length - 1
              ? current + 1
              : 0
            : current > 0
              ? current - 1
              : length - 1;

      const currentSlide = ui.slides[previous];
      const currentInner = ui.inner[previous];
      const upcomingSlide = ui.slides[current];
      const upcomingInner = ui.inner[current];

      gsap
        .timeline({
          defaults: { duration: animationDuration, ease: "power2.inOut" },
          onStart() {
            upcomingSlide?.classList.add("is--current");
            ui.thumbs[previous]?.classList.remove("is--current");
            ui.thumbs[current]?.classList.add("is--current");
          },
          onComplete() {
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
    }

    ui.thumbs.forEach((thumb) => {
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
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Preload high-resolution images immediately with Next.js optimization
    const preloadImages = () => {
      images.forEach((image, index) => {
        // Create preload link elements for better Next.js integration
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = `/_next/image?url=${encodeURIComponent(image.src)}&w=1920&q=95`;

        // High priority for center image and adjacent images
        if (index >= 1 && index <= 3) {
          link.setAttribute("fetchpriority", "high");
        }

        document.head.appendChild(link);

        // Also preload with native Image API as fallback
        const img = new window.Image();
        img.src = image.src;
      });
    };

    // Initialize GSAP plugins
    const initPlugins = async () => {
      try {
        const gsapPlugins = await import("gsap/all");
        const { SplitText, CustomEase } = gsapPlugins;
        gsap.registerPlugin(SplitText, CustomEase);
        CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");
      } catch {
        console.warn(
          "GSAP premium plugins not available, using fallback animations",
        );
        gsap.registerPlugin();
      }
    };

    // Start preloading images immediately
    preloadImages();

    // Wait for fonts to load, then initialize
    document.fonts.ready.then(async () => {
      await initPlugins();
      await initCrispLoadingAnimation();
    });

    // Initialize Slideshow
    if (containerRef.current) {
      initSlideShow(containerRef.current);
    }

    // Cleanup
    return () => {
      if (
        splitRef.current &&
        (splitRef.current as { revert: () => void }).revert
      ) {
        (splitRef.current as { revert: () => void }).revert();
      }
    };
  });

  return (
    <main>
      <section
        ref={containerRef}
        data-slideshow="wrap"
        className="crisp-header is--loading is--hidden"
      >
        {/* Loader */}
        <div className="crisp-loader">
          <div className="crisp-loader__wrap">
            <div className="crisp-loader__groups">
              {/* Duplicate group (background) */}
              <div className="crisp-loader__group is--duplicate">
                {images.map((image, index) => (
                  <div
                    key={`duplicate-${index}`}
                    className="crisp-loader__single"
                  >
                    <div className="crisp-loader__media">
                      <Image
                        className="crisp-loader__cover-img"
                        src={image.src}
                        alt={image.alt}
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
                {images.map((image, index) => (
                  <div
                    key={`relative-${index}`}
                    className="crisp-loader__single"
                  >
                    <div
                      className={`crisp-loader__media ${index === 2 ? "is--scaling is--radius" : ""}`}
                    >
                      <Image
                        className={`crisp-loader__cover-img ${index !== 2 ? "is--scale-down" : ""}`}
                        src={image.src}
                        alt={image.alt}
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

              <div className="crisp-loader__fade"></div>
              <div className="crisp-loader__fade is--duplicate"></div>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="crisp-header__slider">
          <div className="crisp-header__slider-list">
            {images.map((image, index) => (
              <div
                key={`slide-${index}`}
                data-slideshow="slide"
                className={`crisp-header__slider-slide ${index === 2 ? "is--current" : ""}`}
              >
                <Image
                  className="crisp-header__slider-slide-inner"
                  src={image.src}
                  alt={image.alt}
                  data-slideshow="parallax"
                  fill
                  style={{ objectFit: "cover" }}
                  draggable={false}
                  priority={index === 2}
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
          <div className="crisp-header__top">
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
          </div>

          {/* Center */}
          <div className="crisp-header__center">
            <h1 className="crisp-header__h1">We just love collaboration. </h1>
          </div>

          {/* Bottom */}
          <div className="crisp-header__bottom">
            <div className="crisp-header__slider-nav">
              {images.map((image, index) => (
                <div
                  key={`thumb-${index}`}
                  data-slideshow="thumb"
                  className={`crisp-header__slider-nav-btn ${index === 2 ? "is--current" : ""}`}
                >
                  <Image
                    loading="eager"
                    src={image.thumbSrc}
                    alt={image.alt}
                    className="crisp-loader__cover-img"
                    width={56}
                    height={56}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
            {/*<p className="crisp-header__p">Crisp Loading Animation</p>*/}
          </div>
        </div>
      </section>
    </main>
  );
}
