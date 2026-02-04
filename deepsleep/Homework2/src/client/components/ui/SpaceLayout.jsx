import React from 'react';
import { useAppContext } from '../../context/AppContext';

/**
 * SpaceLayout - Wraps the page in the Galactic Drift theme.
 * Includes the radial gradient background and the animated stars.
 */
import ThemeToggle from '../ThemeToggle';

/**
 * SpaceLayout - Wraps the page in the Galactic Drift theme.
 * Includes the radial gradient background and the animated stars.
 */
export default function SpaceLayout({ children, className = "", backgroundChildren = null }) {
  const { theme } = useAppContext();
  const isDark = theme === 'dark';

  return (
    <div dir="rtl" className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans transition-colors duration-500 ${className}`}>

      {/* Theme Toggle (Top Left) */}
      <div className="absolute top-4 left-4 z-50">
        <ThemeToggle />
      </div>

      {/* DARK MODE: Deep Space Background */}
      {isDark && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="stars-bg w-full h-full"></div>
        </div>
      )}

      {/* LIGHT MODE: Sky Blue Gradient + Sun */}
      {!isDark && (
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-sky-400 to-blue-200 overflow-hidden">
          {/* CSS Sun */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-xl opacity-80 shadow-[0_0_80px_rgba(253,224,71,1)] animate-pulse"></div>
          {/* Sun Core */}
          <div className="absolute top-14 right-14 w-24 h-24 bg-yellow-200 rounded-full shadow-inner"></div>
        </div>
      )}

      {/* Custom Background Elements (e.g. Moon, Shooting Stars) */}
      {backgroundChildren}

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
