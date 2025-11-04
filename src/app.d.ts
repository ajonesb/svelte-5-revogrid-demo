// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

// Minimal type shims for third‑party plugins without TS types
declare module '@revolist/revogrid-column-select' {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const SelectTypePlugin: any;
	export default SelectTypePlugin;
}
