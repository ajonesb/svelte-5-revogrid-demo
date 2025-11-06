/**
 * Dropdown Overlay Design Tokens
 * Reusable values for dropdown/overlay components
 */

export const overlayTokens = {
	// Colors (Tailwind equivalents)
	background: '#ffffff',
	border: '#e5e7eb', // gray-200
	textPrimary: '#0f172a', // slate-900
	textSecondary: '#94a3b8', // slate-400
	hoverBackground: '#f1f5f9', // slate-100
	
	// Spacing
	borderRadius: '8px',
	padding: '4px 0',
	optionPadding: '6px 10px',
	minWidth: '220px',
	maxHeight: '220px',
	
	// Typography
	fontSize: '12px',
	lineHeight: '1.2',
	
	// Shadow
	boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0,0,0,0.06)',
	
	// Z-index
	zIndex: 9999
} as const;

/**
 * Generate CSS variables from tokens
 */
export function getOverlayCssVars(): string {
	return Object.entries(overlayTokens)
		.map(([key, value]) => `--overlay-${key}: ${value};`)
		.join(' ');
}
