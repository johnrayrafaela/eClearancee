// Common styling constants and animations for the eClearance application
// Based on the enhanced TeacherAddSubject styling

// Animation keyframes
export const fadeInUp = {
  animation: 'fadeInUp 0.6s ease-out'
};

export const slideIn = {
  animation: 'slideIn 0.5s ease-out'
};

export const slideInLeft = {
  animation: 'slideInLeft 0.8s ease-out'
};

export const slideInRight = {
  animation: 'slideInRight 0.8s ease-out'
};

export const bounceIn = {
  animation: 'bounceIn 0.7s ease-out'
};

export const pulse = {
  animation: 'pulse 2s infinite'
};

// Keyframes CSS
export const keyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  
  .btn-hover {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .btn-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
  }
  
  .btn-hover:active {
    transform: translateY(0);
  }
  
  .card-hover {
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.15) !important;
  }
  
  .search-focus {
    transition: all 0.3s ease;
  }
  
  .search-focus:focus {
    border-color: #0277bd !important;
    box-shadow: 0 0 0 3px rgba(2,119,189,0.1) !important;
    transform: scale(1.02);
  }
  
  .loading-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
`;

// Common gradient backgrounds
export const gradients = {
  primary: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)',
  success: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
  warning: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
  danger: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
  info: 'linear-gradient(135deg, #2196f3 0%, #0277bd 100%)',
  light: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
  card: 'linear-gradient(135deg, #fff 0%, #e3f2fd 100%)',
  cardSuccess: 'linear-gradient(135deg, #fff 0%, #e8f5e8 100%)',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
  hero: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #0277bd 100%)'
};

// Common button styles
export const buttonStyles = {
  primary: {
    background: gradients.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 25,
    padding: '12px 25px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    boxShadow: '0 4px 15px rgba(2,119,189,0.3)',
    transition: 'all 0.3s ease'
  },
  success: {
    background: gradients.success,
    color: '#fff',
    border: 'none',
    borderRadius: 25,
    padding: '12px 25px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
    transition: 'all 0.3s ease'
  },
  warning: {
    background: gradients.warning,
    color: '#fff',
    border: 'none',
    borderRadius: 25,
    padding: '12px 25px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    boxShadow: '0 4px 15px rgba(255,152,0,0.3)',
    transition: 'all 0.3s ease'
  },
  danger: {
    background: gradients.danger,
    color: '#fff',
    border: 'none',
    borderRadius: 25,
    padding: '12px 25px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    boxShadow: '0 4px 15px rgba(244,67,54,0.3)',
    transition: 'all 0.3s ease'
  },
  secondary: {
    background: 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 25,
    padding: '12px 25px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    boxShadow: '0 4px 15px rgba(144,164,174,0.3)',
    transition: 'all 0.3s ease'
  }
};

// Common card styles
export const cardStyles = {
  default: {
    background: gradients.light,
    borderRadius: 20,
    boxShadow: '0 10px 30px rgba(2,119,189,0.1)',
    overflow: 'hidden',
    border: '2px solid #e1f5fe'
  },
  success: {
    background: gradients.cardSuccess,
    borderRadius: 15,
    padding: 25,
    border: '2px solid #e8f5e8',
    boxShadow: '0 8px 25px rgba(76,175,80,0.1)',
    position: 'relative',
    overflow: 'hidden'
  },
  info: {
    background: gradients.card,
    borderRadius: 15,
    padding: 20,
    border: '2px solid #e1f5fe',
    boxShadow: '0 8px 25px rgba(2,119,189,0.1)',
    position: 'relative',
    overflow: 'hidden'
  }
};

// Common header styles
export const headerStyles = {
  pageTitle: {
    color: '#0277bd',
    fontWeight: 700,
    fontSize: '1.8rem',
    marginBottom: 10,
    letterSpacing: '1px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    color: '#0277bd',
    fontWeight: 700,
    fontSize: '1.5rem',
    marginBottom: 8,
    letterSpacing: '0.5px'
  },
  cardTitle: {
    color: '#2e7d32',
    marginBottom: 15,
    fontSize: '1.1rem',
    fontWeight: 700
  }
};

// Common modal styles
export const modalStyles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.6)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(5px)'
  },
  container: {
    background: gradients.light,
    borderRadius: 20,
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
    padding: 30,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  largeContainer: {
    background: gradients.light,
    borderRadius: 20,
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
    padding: 30,
    width: '90%',
    maxWidth: 1000,
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    background: gradients.danger,
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: 35,
    height: 35,
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(244,67,54,0.3)',
    zIndex: 10
  }
};

// Common page container styles
export const pageStyles = {
  container: {
    minHeight: '100vh',
    background: gradients.background,
    padding: 20
  },
  content: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 25
  },
  hero: {
    textAlign: 'center',
    marginBottom: 30,
    padding: 40,
    background: gradients.hero,
    borderRadius: 20,
    color: '#fff',
    boxShadow: '0 15px 40px rgba(30,60,114,0.3)'
  }
};

// Common form styles
export const formStyles = {
  group: {
    marginBottom: 20
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontWeight: 600,
    color: '#0277bd',
    fontSize: '0.9rem'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: 10,
    border: '2px solid #e1f5fe',
    fontSize: '0.9rem',
    outline: 'none',
    background: '#f8fafc',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  },
  textarea: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: 10,
    border: '2px solid #e1f5fe',
    fontSize: '0.9rem',
    outline: 'none',
    background: '#f8fafc',
    boxSizing: 'border-box',
    minHeight: 100,
    resize: 'vertical',
    transition: 'all 0.3s ease'
  },
  select: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: 10,
    border: '2px solid #e1f5fe',
    fontSize: '0.9rem',
    outline: 'none',
    background: '#f8fafc',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

// Status badge styles
export const badgeStyles = {
  success: {
    background: gradients.success,
    color: 'white',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5
  },
  warning: {
    background: gradients.warning,
    color: 'white',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5
  },
  danger: {
    background: gradients.danger,
    color: 'white',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5
  },
  info: {
    background: gradients.info,
    color: 'white',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5
  }
};

// Utility function to inject keyframes
export const injectKeyframes = () => {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = keyframes;
    document.head.appendChild(styleElement);
  }
};

// Common spacing
export const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 25,
  xxl: 30
};

// Common colors
export const colors = {
  primary: '#0277bd',
  secondary: '#546e7a',
  success: '#4caf50',
  warning: '#ff9800',
  danger: '#f44336',
  info: '#2196f3',
  light: '#f8fafc',
  dark: '#263238',
  muted: '#90a4ae'
};

// Compact typography scale (for pages adopting the smaller, denser layout)
// These values mirror the sizing approach already used in TeacherSubjectRequests.jsx
export const typeScale = {
  xxs: '.55rem',
  xs: '.6rem',
  sm: '.65rem',
  base: '.7rem',
  md: '.75rem',
  lg: '.8rem',
  xl: '.9rem',
  xxl: '1rem'
};

// Helper: commonly re-used compact card padding & font reduction
export const compact = {
  cardPadding: '14px 16px',
  sectionGap: 12,
  heading: {
    fontSize: typeScale.lg,
    fontWeight: 600,
    margin: 0
  },
  subHeading: {
    fontSize: typeScale.base,
    fontWeight: 600,
    margin: 0
  },
  text: {
    fontSize: typeScale.base,
    lineHeight: 1.3
  }
};