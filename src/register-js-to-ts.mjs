import { registerHooks } from 'node:module'

/**
 * When running src/*.spec.ts with Node type-stripping, production files
 * import sibling modules via .js specifiers. Map those to .ts sources.
 */
registerHooks({
	resolve(specifier, context, nextResolve) {
		try {
			return nextResolve(specifier, context)
		} catch (error) {
			if (typeof specifier === 'string' && specifier.endsWith('.js')) {
				try {
					return nextResolve(specifier.replace(/\.js$/u, '.ts'), context)
				} catch {
					throw error
				}
			}
			throw error
		}
	},
})
