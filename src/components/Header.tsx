"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { User, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";

import { Fade, Flex, Line, Row, ToggleButton } from "@once-ui-system/core";

import { routes, display, person, about, posts } from "@/resources";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.scss";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string; // Optionally allow locale, defaulting to 'en-GB'
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale = "en-GB" }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timeString = new Intl.DateTimeFormat(locale, options).format(now);
      setCurrentTime(timeString);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, [timeZone, locale]);

  return <>{currentTime}</>;
};

export default TimeDisplay;

const AuthControls = ({ session }: { session: Session | null }) => {

  if (session?.user) {
    return (
      <div className="flex gap-4 items-center">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center justify-center w-10 h-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
        </button>
        <a
          href="/dashboard"
          className="flex items-center justify-center w-10 h-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          title="Go to Dashboard"
        >
          <User className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
        </a>
      </div>
    );
  }

  return (
    <a
      href="/auth/signin"
      className="flex items-center justify-center w-10 h-10 bg-neutral-800 dark:bg-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors cursor-pointer"
      title="Sign In"
    >
      <LogIn className="w-4 h-4 text-white dark:text-black" />
    </a>
  );
};

const distance = 15;

// Enhanced ToggleButton with hover animation using motion values
const AnimatedToggleButton = ({
  prefixIcon,
  href,
  label,
  selected,
  itemKey,
  onHover,
  onLeave
}: {
  prefixIcon: string;
  href: string;
  label?: string;
  selected: boolean;
  itemKey: string;
  onHover: (itemKey: string, element: HTMLElement) => void;
  onLeave: () => void;
}) => {

  const [textHoverState, setTextHoverState] = useState({
    y: distance,
    opacity: 0,
    rotateX: 0
  });

  const buttonRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setTextHoverState({
      y: 0,
      opacity: 1,
      rotateX: 90
    });
    if (buttonRef.current) {
      onHover(itemKey, buttonRef.current);
    }
  };



  const handleMouseLeave = () => {
    setTextHoverState({
      y: distance,
      opacity: 0,
      rotateX: 0
    });
    onLeave();
  };

  return (
    <div
      ref={buttonRef}
      className="relative h-auto overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          position: "absolute",
          transformPerspective: 1000,
          top: 0,
          left: 0,
          height: "auto",
          zIndex: 1,
        }}
        animate={{
          y: textHoverState.y,
          opacity: textHoverState.opacity,
          rotateX: 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 40
        }}
      >
        <ToggleButton
          style={{
            backgroundColor: "transparent",
          }}
          prefixIcon={prefixIcon}
          href={href}
          label={label}
          selected={selected}
        />
      </motion.div>
      <motion.div
        style={{
          height: "auto",
          zIndex: 1,
        }}
        animate={{
          y: textHoverState.y - distance,
          opacity: 1 - textHoverState.opacity,
          rotateX: textHoverState.rotateX
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 40
        }}
      >
        <ToggleButton
          style={{
            backgroundColor: "transparent",
          }}
          prefixIcon={prefixIcon}
          href={href}
          label={label}
          selected={selected}
        />
      </motion.div>
    </div>
  );
};

export const Header = ({ session }: { session: Session | null }) => {
  const pathname = usePathname() ?? "";
  const navRef = useRef<HTMLDivElement>(null);

  // Use state for animation values
  const [hoverState, setHoverState] = useState({
    x: 0,
    width: 0,
    opacity: 0
  });

  const handleHover = (itemKey: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const navRect = navRef.current?.getBoundingClientRect();

    if (navRect) {
      const x = rect.left - navRect.left;
      const width = rect.width;
      // Update state to trigger animation
      setHoverState({
        x,
        width,
        opacity: 1
      });
    }
  };

  const handleLeave = () => {
    // Fade out smoothly
    // setHoverState(prev => ({
    //   ...prev,
    //   opacity: 0
    // }));
  };

  return (
    <>
      <Fade s={{ hide: true }} fillWidth position="fixed" height="80" zIndex={9} />
      <Fade
        hide
        s={{ hide: false }}
        fillWidth
        position="fixed"
        bottom="0"
        to="top"
        height="80"
        zIndex={9}
      />
      <Row
        fitHeight
        className={styles.position}
        position="sticky"
        as="header"
        zIndex={9}
        fillWidth
        padding="8"
        horizontal="center"
        data-border="rounded"
        s={{
          position: "fixed",
        }}
      >
        <Row paddingLeft="12" fillWidth vertical="center" textVariant="body-default-s">
          {display.location && <Row s={{ hide: true }}>{person.location}</Row>}
        </Row>
        <Row fillWidth horizontal="center">
          <Row
            background="page"
            border="neutral-alpha-weak"
            radius="m-4"
            shadow="l"
            padding="4"
            horizontal="center"
            zIndex={1}
            ref={navRef}
            className="relative"
          >
            {/* Animated hover background using state */}
            <motion.div
              className="absolute inset-0 bg-muted rounded-xl h-[calc(100%-8px)] top-4"
              animate={hoverState}
              style={{
                zIndex: -1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            />

            <Row gap="4" vertical="center" textVariant="body-default-s" suppressHydrationWarning>
              {routes["/"] && (
                <AnimatedToggleButton
                  prefixIcon="home"
                  href="/"
                  selected={pathname === "/"}
                  itemKey="home"
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              )}
              <Line background="neutral-alpha-medium" vert maxHeight="24" />
              {routes["/about"] && (
                <>
                  <Row s={{ hide: true }}>
                    <AnimatedToggleButton
                      prefixIcon="person"
                      href="/about"
                      label={about.label}
                      selected={pathname === "/about"}
                      itemKey="about"
                      onHover={handleHover}
                      onLeave={handleLeave}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <AnimatedToggleButton
                      prefixIcon="person"
                      href="/about"
                      selected={pathname === "/about"}
                      itemKey="about"
                      onHover={handleHover}
                      onLeave={handleLeave}
                    />
                  </Row>
                </>
              )}
              {/* {routes["/work"] && (
                <>
                  <Row s={{ hide: true }}>
                    <AnimatedToggleButton
                      prefixIcon="grid"
                      href="/work"
                      label={work.label}
                      selected={pathname.startsWith("/work")}
                      itemKey="work"
                      onHover={handleHover}
                      onLeave={handleLeave}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <AnimatedToggleButton
                      prefixIcon="grid"
                      href="/work"
                      selected={pathname.startsWith("/work")}
                      itemKey="work"
                      onHover={handleHover}
                      onLeave={handleLeave}
                    />
                  </Row>
                </>
              )}
              {routes["/blog"] && (
                <>
                  <Row s={{ hide: true }}>
                    <AnimatedToggleButton
                      prefixIcon="book"
                      href="/blog"
                      label={blog.label}
                      selected={pathname.startsWith("/blog")}
                      itemKey="blog"
                      onHover={handleHover}
                      onLeave={handleLeave}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <AnimatedToggleButton
                      prefixIcon="book"
                      href="/blog"
                      selected={pathname.startsWith("/blog")}
                      itemKey="blog"
                      onHover={handleHover}
                      onLeave={handleLeave}
                    />
                  </Row>
                </>
              )} */}
              {routes["/posts"] && (
                <>
                  <Row s={{ hide: true }}>
                    <AnimatedToggleButton
                      prefixIcon="message-circle"
                      href="/posts"
                      label={posts.label}
                      selected={pathname.startsWith("/posts")}
                      itemKey="posts"
                      onHover={handleHover}
                      onLeave={handleLeave}
                    />
                  </Row>
                  <Row hide s={{ hide: false }}>
                    <AnimatedToggleButton
                      prefixIcon="message-circle"
                      href="/posts"
                      selected={pathname.startsWith("/posts")}
                      itemKey="posts"
                      onHover={handleHover}
                      onLeave={handleLeave}
                    />
                  </Row>
                </>
              )}
              {display.themeSwitcher && (
                <>
                  <Line background="neutral-alpha-medium" vert maxHeight="24" />
                  <ThemeToggle />
                </>
              )}
            </Row>
          </Row>
        </Row>
        <Flex fillWidth horizontal="end" vertical="center">
          <Flex
            paddingRight="12"
            horizontal="end"
            vertical="center"
            textVariant="body-default-s"
            gap="20"
          >
            <Flex s={{ hide: true }}>
              {display.time && <TimeDisplay timeZone={person.location} />}
            </Flex>
            <AuthControls session={session} />
          </Flex>
        </Flex>
      </Row>
    </>
  );
};
