"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface HamburgerMenuProps {
  className?: string;
}

export default function HamburgerMenu({ className = "" }: HamburgerMenuProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.keyCode === 27 && isActive) {
        setIsActive(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleMouseEnter = (itemHref: string) => {
    setHoveredItem(itemHref);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleClose = () => {
    setIsActive(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  // Debug useEffect to track hoveredItem changes
  useEffect(() => {
    if (hoveredItem) {
    } else {
    }
  }, [hoveredItem]);

  if (loading) return null;

  const menuItems = user
    ? [
        { label: "Home", href: "/" },
        { label: "Files", href: "/files" },
        { label: "Shared", href: "/shared" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Login", href: "/auth/login" },
      ];

  return (
    <>
      <nav
        ref={navRef}
        data-navigation-status={isActive ? "active" : "not-active"}
        className={`navigation ${className}`}
      >
        <div
          ref={closeRef}
          onClick={handleClose}
          className="navigation__dark-bg"
        ></div>
        <div className="hamburger-nav">
          <div className="hamburger-nav__bg"></div>
          <div className="hamburger-nav__group">
            <p className="hamburger-nav__menu-p">Menu</p>
            <ul className="hamburger-nav__ul">
              {menuItems.map((item) => (
                <div key={item.href} className="hamburger-nav__li">
                  <Link
                    href={item.href}
                    className="hamburger-nav__a flex items-center"
                    aria-current={pathname === item.href ? "page" : undefined}
                    onMouseEnter={() => handleMouseEnter(item.href)}
                    onMouseLeave={() => handleMouseLeave()}
                  >
                    <p
                      className="hamburger-nav__p"
                      style={{
                        color: pathname === item.href ? "gray" : "",
                      }}
                    >
                      {item.label}
                    </p>
                    <div
                      className="hamburger-nav__dot"
                      style={{
                        transform:
                          pathname === item.href || hoveredItem === item.href
                            ? "scale(1) rotate(0.001deg)"
                            : "scale(0) rotate(0.001deg)",
                        opacity:
                          pathname === item.href
                            ? 1
                            : hoveredItem === item.href
                              ? 0.25
                              : 0.5,
                        background:
                          hoveredItem === item.href
                            ? "gray"
                            : pathname === item.href
                              ? "gray"
                              : "blue",
                        border: "2px solid gray",
                      }}
                      data-debug={`item: ${item.label}, current: ${pathname === item.href}, hovered: ${hoveredItem === item.href}, hoveredItem: ${hoveredItem}`}
                    ></div>
                  </Link>
                </div>
              ))}
              {user && (
                <div className="hamburger-nav__li">
                  <button
                    onClick={handleSignOut}
                    className="hamburger-nav__a hamburger-nav__a--button"
                    onMouseEnter={() => handleMouseEnter("signout")}
                    onMouseLeave={() => handleMouseLeave()}
                  >
                    <p className="hamburger-nav__p">Sign Out</p>
                    <div
                      className="hamburger-nav__dot"
                      style={{
                        transform:
                          hoveredItem === "signout"
                            ? "scale(1) rotate(0.001deg)"
                            : "scale(0) rotate(0.001deg)",
                        opacity: hoveredItem === "signout" ? 0.25 : 0.5,
                        background: hoveredItem === "signout" ? "red" : "blue",
                        border: "2px solid yellow",
                      }}
                      data-debug={`signout hovered: ${hoveredItem === "signout"}, hoveredItem: ${hoveredItem}`}
                    ></div>
                  </button>
                </div>
              )}
            </ul>
          </div>
          <div
            ref={toggleRef}
            onClick={handleToggle}
            className="hamburger-nav__toggle"
          >
            <div className="hamburger-nav__toggle-bar"></div>
            <div className="hamburger-nav__toggle-bar"></div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .navigation {
          z-index: 500;
          pointer-events: none;
          position: fixed;
          inset: 0;
        }

        .navigation[data-navigation-status="active"] {
          pointer-events: auto;
        }

        .navigation__dark-bg {
          transition: all 0.7s cubic-bezier(0.5, 0.5, 0, 1);
          opacity: 0;
          pointer-events: auto;
          visibility: hidden;
          background-color: #000;
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .navigation[data-navigation-status="active"] .navigation__dark-bg {
          opacity: 0.33;
          visibility: visible;
        }

        .hamburger-nav {
          border-radius: 1.5em;
          position: absolute;
          top: 2em;
          right: 2em;
          z-index: 10;
        }

        .hamburger-nav__bg {
          transition: all 0.7s cubic-bezier(0.5, 0.5, 0, 1);
          background-color: #e2e1df;
          border-radius: 1.75em;
          width: 3.5em;
          height: 3.5em;
          position: absolute;
          top: 0;
          right: 0;
          z-index: 2;
        }

        .navigation[data-navigation-status="active"] .hamburger-nav__bg {
          width: 250px;
          height: 275px;
          background-color: #e2e1df;
        }

        .hamburger-nav__group {
          transition:
            all 0.5s cubic-bezier(0.5, 0.5, 0, 1),
            transform 0.7s cubic-bezier(0.5, 0.5, 0, 1);
          grid-column-gap: 1em;
          grid-row-gap: 1em;
          pointer-events: auto;
          transform-origin: 100% 0;
          flex-flow: column;
          padding: 2.25em 2.5em 2em 2em;
          display: flex;
          position: relative;
          transform: scale(0.15) rotate(0.001deg);
          opacity: 0;
          visibility: hidden;
          z-index: 3;
        }

        .navigation[data-navigation-status="active"] .hamburger-nav__group {
          transform: scale(1) rotate(0.001deg);
          opacity: 1;
          visibility: visible;
        }

        .hamburger-nav__menu-p {
          opacity: 0.5;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 0;
          font-family: var(--font-dm-mono), "Courier New", monospace;
          font-size: 1em;
          font-weight: 400;
          color: #131313;
        }

        .hamburger-nav__ul {
          grid-column-gap: 0.375em;
          grid-row-gap: 0.375em;
          flex-flow: column;
          margin-top: 0;
          margin-bottom: 0;
          padding: 0;
          display: flex;
          position: relative;
        }

        .hamburger-nav__li {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .hamburger-nav__a {
          color: #131313;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          display: flex;
          width: 100%;
        }

        .hamburger-nav__a--button {
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
        }

        .hamburger-nav__a[aria-current] .hamburger-nav__p {
          opacity: 0.33;
        }

        .hamburger-nav__p {
          color: #131313;
          white-space: nowrap;
          margin-bottom: 0;
          padding-right: 1.25em;
          font-size: 2em;
          font-family: var(--font-dm-mono), "Courier New", monospace;
          font-weight: 400;
          flex: 1;
        }

        .hamburger-nav__dot {
          transition: all 0.7s cubic-bezier(0.5, 0.5, 0, 1);
          background-color: currentColor;
          border-radius: 50%;
          flex-shrink: 0;
          width: 0.5em;
          height: 0.5em;
          transform: scale(0) rotate(0.001deg);
          opacity: 0.5;
          position: relative;
          z-index: 10;
          margin-left: auto;
          flex-shrink: 0;
        }

        .hamburger-nav__a[aria-current] .hamburger-nav__p {
          opacity: 0.33;
        }

        .hamburger-nav__a[aria-current] .hamburger-nav__dot {
          transform: scale(1) rotate(0.001deg) !important;
          opacity: 1 !important;
        }

        .hamburger-nav__toggle {
          transition: transform 0.7s cubic-bezier(0.5, 0.5, 0, 1);
          pointer-events: auto;
          cursor: pointer;
          border-radius: 50%;
          justify-content: center;
          align-items: center;
          width: 3.5em;
          height: 3.5em;
          display: flex;
          position: absolute;
          top: 0;
          right: 0;
          transform: translate(0em, 0em) rotate(0.001deg);
          z-index: 5;
        }

        .navigation[data-navigation-status="active"] .hamburger-nav__toggle {
          transform: translate(-1em, 1em) rotate(0.001deg);
        }

        .hamburger-nav__toggle-bar {
          transition: transform 0.7s cubic-bezier(0.5, 0.5, 0, 1);
          background-color: #131313;
          width: 40%;
          height: 0.125em;
          position: absolute;
          transform: translateY(-0.15em) rotate(0.001deg);
        }

        .hamburger-nav__toggle:hover .hamburger-nav__toggle-bar {
          transform: translateY(0.15em) rotate(0.001deg);
        }

        .navigation[data-navigation-status="active"]
          .hamburger-nav__toggle
          .hamburger-nav__toggle-bar {
          transform: translateY(0em) rotate(45deg);
        }

        .hamburger-nav__toggle .hamburger-nav__toggle-bar:nth-child(2) {
          transition: transform 0.7s cubic-bezier(0.5, 0.5, 0, 1);
          transform: translateY(0.15em) rotate(0.001deg);
        }

        .hamburger-nav__toggle:hover .hamburger-nav__toggle-bar:nth-child(2) {
          transform: translateY(-0.15em) rotate(0.001deg);
        }

        .navigation[data-navigation-status="active"]
          .hamburger-nav__toggle
          .hamburger-nav__toggle-bar:nth-child(2) {
          transform: translateY(0em) rotate(-45deg);
        }
      `}</style>
    </>
  );
}
