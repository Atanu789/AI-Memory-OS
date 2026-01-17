import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ResizableNavbarProps {
  items: NavItem[];
  activeItem?: string;
  onNavigate?: (href: string) => void;
  className?: string;
  expandedWidth?: number;
  collapsedWidth?: number;
}

export const ResizableNavbar = React.forwardRef<
  HTMLNavElement,
  ResizableNavbarProps
>(
  (
    {
      items,
      activeItem,
      onNavigate,
      className,
      expandedWidth = 280,
      collapsedWidth = 80,
    },
    ref
  ) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLElement | null>(null);

    // Detect scroll
    useEffect(() => {
      const handleScroll = () => {
        const scrollTop = window.scrollY;
        setIsScrolled(scrollTop > 50);
        
        // Auto collapse on mobile when scrolling
        if (isMobile && scrollTop > 50) {
          setIsExpanded(false);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobile]);

    // Detect mobile
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
        if (window.innerWidth >= 768) {
          setMobileOpen(false);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const currentWidth = isExpanded ? expandedWidth : collapsedWidth;

    return (
      <>
        {/* Desktop Navbar */}
        <motion.nav
          ref={ref}
          className={cn(
            'hidden md:flex fixed left-0 top-0 h-screen flex-col items-start justify-start py-6 px-4 backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-2xl z-50 transition-all duration-500',
            isScrolled && 'py-4',
            className
          )}
          animate={{
            width: currentWidth,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
        >
          {/* Glass Blur Effect Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-r-xl" />

          {/* Navbar Content Container */}
          <div className="relative w-full h-full flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex items-center justify-between w-full">
              <motion.div
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✦</span>
                </div>
                <span className="font-semibold text-slate-100 whitespace-nowrap">
                  Memory OS
                </span>
              </motion.div>

              {/* Toggle Button */}
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors ml-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {isExpanded ? (
                    <X className="w-5 h-5 text-slate-300" />
                  ) : (
                    <Menu className="w-5 h-5 text-slate-300" />
                  )}
                </motion.div>
              </motion.button>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-2 flex-1">
              <AnimatePresence>
                {items.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.href;

                  return (
                    <motion.button
                      key={item.href}
                      onClick={() => onNavigate?.(item.href)}
                      className={cn(
                        'relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group',
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      )}
                      whileHover={{ x: 4 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-600 rounded-r-lg"
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}

                      {Icon && (
                        <Icon
                          className={cn(
                            'w-5 h-5 flex-shrink-0 transition-transform duration-300',
                            isActive && 'text-blue-300',
                            !isActive && 'group-hover:scale-110'
                          )}
                        />
                      )}

                      <motion.span
                        animate={{
                          opacity: isExpanded ? 1 : 0,
                          width: isExpanded ? 'auto' : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap font-medium text-sm overflow-hidden"
                      >
                        {item.title}
                      </motion.span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer Section */}
            <motion.div
              animate={{ opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="pt-6 border-t border-white/10 w-full"
            >
              <div className="text-xs text-slate-500 text-center whitespace-nowrap overflow-hidden">
                {isScrolled ? (
                  <span className="text-blue-400">Scrolling...</span>
                ) : (
                  <span>Ready</span>
                )}
              </div>
            </motion.div>
          </div>
        </motion.nav>

        {/* Mobile Navbar */}
        <motion.nav
          className="md:hidden fixed top-0 left-0 right-0 backdrop-blur-xl bg-white/10 border-b border-white/20 z-50 px-4 py-3"
          animate={{
            height: isScrolled ? 56 : 64,
          }}
        >
          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">✦</span>
              </div>
              <motion.span
                animate={{ opacity: isScrolled ? 0 : 1 }}
                className="font-semibold text-slate-100 text-sm"
              >
                Memory OS
              </motion.span>
            </div>

            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </motion.button>
          </div>
        </motion.nav>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="md:hidden fixed left-0 top-16 bottom-0 w-64 backdrop-blur-xl bg-white/10 border-r border-white/20 z-40 flex flex-col gap-4 p-4 overflow-y-auto"
              >
                <div className="flex flex-col gap-2">
                  {items.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.href;

                    return (
                      <motion.button
                        key={item.href}
                        onClick={() => {
                          onNavigate?.(item.href);
                          setMobileOpen(false);
                        }}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        )}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {Icon && <Icon className="w-5 h-5" />}
                        <span className="font-medium text-sm">{item.title}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }
);

ResizableNavbar.displayName = 'ResizableNavbar';
