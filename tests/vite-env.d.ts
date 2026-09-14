// The override tests read source files as text (the animation modules import
// Phaser and cannot be loaded in the node test environment), which needs Vite's
// `?raw` imports and `import.meta.glob`. The repo has no @types/node, so the
// two shapes are declared here rather than pulling in another dependency.
declare module '*?raw' {
  const content: string;
  export default content;
}

interface ImportMeta {
  glob(pattern: string): Record<string, unknown>;
}
