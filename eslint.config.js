import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import svelteParser from 'svelte-eslint-parser';

export default [
	eslint.configs.recommended,
	{
		files: ['**/*.ts', '**/*.js'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module'
			},
			globals: {
				console: 'readonly',
				setTimeout: 'readonly',
				fetch: 'readonly',
				URL: 'readonly',
				RequestInit: 'readonly',
				CustomEvent: 'readonly',
				MouseEvent: 'readonly',
				$state: 'readonly',
				$derived: 'readonly',
				Response: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': tseslint
		},
		rules: {
			// Prefer TS rule over base
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsparser,
				ecmaVersion: 2022,
				sourceType: 'module'
			},
			globals: {
				console: 'readonly',
				$state: 'readonly',
				$derived: 'readonly',
				CustomEvent: 'readonly'
			}
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off'
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/']
	}
];
