// Compatibility bridge: certain uni build steps resolve `store/global` at project root.
// Re-export actual Pinia store implementation in src to satisfy those resolutions.
export * from '../src/store/global'



