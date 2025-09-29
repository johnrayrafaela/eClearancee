// Unified styling helpers for Admin pages leveraging existing CommonStyles
import React from 'react';
import {
  gradients,
  pageStyles,
  cardStyles,
  headerStyles,
  buttonStyles,
  typeScale,
  fadeInUp,
  slideInLeft,
  slideInRight,
  keyframes,
  injectKeyframes
} from './CommonStyles';

export const adminLayout = {
  container: pageStyles.container,
  content: pageStyles.content,
  hero: (icon, title, subtitle) => ({ icon, title, subtitle }),
};

export const heroSection = (title, icon, subtitle) => {
  const heroChildren = [
    React.createElement('div', { key: 'icon', style: { fontSize: '1.4rem', marginBottom: 8 } }, icon),
    React.createElement('h1', {
      key: 'title',
      style: {
        ...headerStyles.pageTitle,
        color: '#fff',
        fontSize: typeScale.xxl,
        textShadow: '1px 1px 2px rgba(0,0,0,0.25)',
        marginBottom: 4
      }
    }, title)
  ];
  if (subtitle) {
    heroChildren.push(React.createElement('p', {
      key: 'subtitle',
      style: {
        fontSize: typeScale.md,
        opacity: 0.9,
        margin: 0,
        lineHeight: 1.3
      }
    }, subtitle));
  }
  return React.createElement('div', { style: { ...pageStyles.hero, ...fadeInUp, padding: 24 } }, heroChildren);
};

export const tableStyles = {
  wrapper: { width: '100%', overflowX: 'auto' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(2,119,189,0.06)'
  },
  th: {
    background: '#e1f5fe',
    color: '#0277bd',
    padding: '10px 12px',
    fontWeight: 600,
    fontSize: typeScale.sm,
    textAlign: 'left',
    letterSpacing: '.25px',
    borderBottom: '1px solid #b3e5fc'
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #eceff1',
    fontSize: typeScale.sm,
    color: '#455a64'
  },
  actionCell: { display: 'flex', gap: 6, flexWrap: 'wrap' }
};

export const formStyles = {
  section: {
    ...cardStyles.default,
    background: '#ffffff',
    border: '1px solid #e1f5fe',
    boxShadow: '0 4px 12px -2px rgba(2,119,189,0.06)'
  },
  title: {
    margin: 0,
    fontSize: typeScale.lg,
    fontWeight: 600,
    color: '#0277bd'
  },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  input: {
    flex: '1 1 180px',
    minWidth: 160,
    background: '#fff',
    border: '1.5px solid #b3e5fc',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: typeScale.sm,
    color: '#0277bd',
    outline: 'none'
  },
  select: {
    flex: '1 1 180px',
    minWidth: 160,
    background: '#f1fafd',
    border: '1.5px solid #b3e5fc',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: typeScale.sm,
    color: '#0277bd',
    outline: 'none'
  },
  actions: { display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  primaryBtn: { ...buttonStyles.primary, borderRadius: 18, padding: '8px 18px', fontSize: typeScale.sm },
  secondaryBtn: { ...buttonStyles.secondary, borderRadius: 18, padding: '8px 18px', fontSize: typeScale.sm }
};

export const badge = (bg, color) => ({
  padding: '4px 8px',
  borderRadius: 16,
  fontSize: typeScale.xxs,
  fontWeight: 600,
  background: bg,
  color: color || '#fff',
  letterSpacing: '.25px'
});

export const smallButton = (tone = 'primary') => {
  const base = {
    border: 'none',
    borderRadius: 14,
    padding: '6px 12px',
    fontSize: typeScale.sm,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'background .25s, transform .25s'
  };
  const palettes = {
    primary: { background: 'linear-gradient(135deg,#0288d1,#0277bd)', color: '#fff' },
    danger: { background: 'linear-gradient(135deg,#e53935,#c62828)', color: '#fff' },
    warn: { background: 'linear-gradient(135deg,#ffb300,#fb8c00)', color: '#fff' },
    neutral: { background: '#eceff1', color: '#37474f' }
  };
  return { ...base, ...palettes[tone] };
};

export const filterBar = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    padding: '10px 12px',
    background: '#ffffff',
    border: '1px solid #e1f5fe',
    borderRadius: 14,
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
  },
  label: { fontSize: typeScale.sm, fontWeight: 600, color: '#0277bd' },
  control: {
    background: '#f5fbff',
    border: '1.5px solid #b3e5fc',
    borderRadius: 10,
    padding: '8px 10px',
    fontSize: typeScale.sm,
    color: '#0277bd',
    outline: 'none'
  },
  search: {
    flex: '1 1 240px',
    minWidth: 200,
    background: '#ffffff',
    border: '2px solid #90caf9',
    borderRadius: 14,
    padding: '10px 14px',
    fontSize: typeScale.sm,
    color: '#0277bd',
    outline: 'none',
    boxShadow: '0 1px 4px rgba(2,119,189,0.07)'
  }
};

export const analyticsCard = {
  ...cardStyles.default,
  display: 'flex',
  flexDirection: 'column',
  gap: 10
};

export { gradients, pageStyles, cardStyles, headerStyles, buttonStyles, typeScale, fadeInUp, slideInLeft, slideInRight, keyframes, injectKeyframes };
