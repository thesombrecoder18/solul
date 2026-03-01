/**
 * Charte graphique SOLUL
 * Couleurs extraites du design Figma
 */

export const Colors = {
  // Couleurs principales
  primary: '#8B6914',        // Doré/marron — couleur du logo
  background: '#F5E6D0',     // Beige/crème — fond principal
  backgroundWhite: '#FFFFFF', // Fond secondaire
  
  // Textes
  textPrimary: '#3D2B1F',    // Marron foncé
  textSecondary: '#8B7355',  // Marron clair
  textLight: '#FFFFFF',      // Texte sur fond sombre
  
  // Accent & actions
  accent: '#8B6914',         // CTA / boutons principaux
  accentLight: '#C4A44A',    // Variante claire du doré
  
  // États
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#F57C00',
  info: '#1976D2',
  
  // Neutres
  border: '#E0D5C7',
  disabled: '#BFBFBF',
  placeholder: '#A89880',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;
