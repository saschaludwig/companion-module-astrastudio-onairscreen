import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

export default [
	...(await generateEslintConfig({
		enableTypescript: true,
	})),
	{
		files: ['**/*.ts'],
		rules: {
			// TypeScript ESM imports use .js specifiers that map to .ts sources
			'n/no-missing-import': 'off',
		},
	},
	{
		files: ['**/*.spec.ts'],
		rules: {
			'@typescript-eslint/no-floating-promises': 'off',
		},
	},
]
