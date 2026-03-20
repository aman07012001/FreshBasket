import React, { useEffect, useRef, useState } from 'react';

export const AnimatedOrderCard = ({ children, index = 0, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-8 opacity-0 scale-98'
      }`}
      style={{
        transitionDelay: `${delay + index * 50}ms`
      }}
    >
      {children}
    </div>
  );
};

export const StatusChangeAnimation = ({ status, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div
      className={`transition-all duration-300 ${
        isAnimating
          ? 'ring-2 ring-emerald-200 bg-emerald-50 scale-105'
          : 'ring-0 bg-white scale-100'
      }`}
    >
      {children}
    </div>
  );
};

export const HoverEffect = ({ children, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`transition-all duration-200 ease-out ${
        isHovered ? 'scale-105' : 'scale-100'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export const PulseIndicator = ({ isActive = false, color = 'emerald' }) => {
  const colors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  };

  return (
    <div className="relative inline-flex">
      <div
        className={`w-2 h-2 rounded-full ${colors[color]} ${
          isActive ? 'animate-pulse' : ''
        }`}
      />
      {isActive && (
        <div
          className={`absolute w-4 h-4 rounded-full ${colors[color]} opacity-20 animate-ping`}
          style={{ animationDuration: '2s' }}
        />
      )}
    </div>
  );
};

export const ShimmerEffect = ({ className = '' }) => {
  return (
    <div
      className={`animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-200 to-transparent ${className}`}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
  );
};

export const InteractiveStatusBadge = ({ status, children }) => {
  const [isPressed, setIsPressed] = useState(false);

  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-2 rounded-full border font-semibold text-xs transition-all duration-200 ${
        statusStyles[status] || statusStyles.pending
      } ${
        isPressed
          ? 'transform scale-95 opacity-80'
          : 'hover:scale-105 hover:shadow-md'
      }`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <span
        className={`w-2 h-2 rounded-full mr-2 ${
          status === 'delivered' ? 'bg-green-500' :
          status === 'cancelled' ? 'bg-red-500' :
          status === 'shipped' ? 'bg-indigo-500' :
          status === 'processing' ? 'bg-blue-500' :
          'bg-yellow-500'
        }`}
      />
      {children}
    </div>
  );
};

export const InteractiveButton = ({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
  };

  return (
    <button
      className={`inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        isPressed ? 'transform scale-95' : ''
      } ${
        isHovered && variant !== 'ghost'
          ? 'hover:shadow-xl hover:-translate-y-1'
          : ''
      } ${className}`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const StatusProgressRing = ({ progress = 0, size = 40, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          className="text-emerald-500 transition-all duration-500 ease-in-out"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-600">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

export const FloatingActionButton = ({ children, onClick, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={tooltip}
      >
        {children}
      </button>

      {showTooltip && (
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-in slide-in-from-bottom-2 duration-200">
          {tooltip}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export const AnimatedToast = ({ message, type = 'success', duration = 3000, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };

  const typeClasses = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  if (!isVisible && !isExiting) return null;

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm w-full bg-white border-l-4 shadow-lg rounded-lg p-4 transform transition-all duration-300 ${
        isExiting
          ? 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100'
      } ${typeClasses[type]} animate-in slide-in-from-right-2 duration-300`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            {type === 'success' && (
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 1.414l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'error' && (
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'warning' && (
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'info' && (
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 000-2a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 11-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfettiAnimation = ({ isActive = false, colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'] }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 8 + 4
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            color: particle.color,
            fontSize: `${particle.size}px`,
            animationDuration: '2s',
            transform: `rotate(${particle.rotation}deg)`
          }}
        >
          ✦
        </div>
      ))}
    </div>
  );
};

export const useSmoothScroll = () => {
  const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  };

  return { scrollToElement };
};

export const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        className="h-full bg-emerald-500 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};