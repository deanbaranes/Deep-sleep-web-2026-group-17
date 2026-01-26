import React from 'react';

/**
 * GlassCard - A translucent card container with neon glow effects.
 * 
 * @param {React.ReactNode} children
 * @param {string} className - Additional classes
 * @param {boolean} animateFloat - Whether to add the floating animation
 * @param {string} glowColor - 'cyan' | 'emerald' | 'indigo' | 'rose' (for shadow color)
 */
export default function GlassCard({ children, className = "", animateFloat = false, glowColor = 'indigo' }) {

  // Map glow colors to shadow classes
  const shadowColors = {
    cyan: 'shadow-cyan-500/20',
    emerald: 'shadow-emerald-500/20',
    indigo: 'shadow-indigo-500/20',
    rose: 'shadow-rose-500/20',
    purple: 'shadow-purple-500/20'
  };

  const shadowClass = shadowColors[glowColor] || shadowColors.indigo;
  const floatClass = animateFloat ? 'animate-float' : '';

  return (
    <div className={`
      relative z-20 
      p-6 sm:p-10 
      shadow-2xl 
      transition-all duration-300
      
      /* Dark Mode: Original Glass Effect */
      dark:glass-panel 
      dark:${shadowClass}
      
      /* Light Mode: High Contrast "Lab" Style */
      bg-white 
      border-2 border-slate-900 
      shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] 
      text-slate-900

      ${floatClass} 
      ${className}
    `}>
      {children}
    </div>
  );
}
