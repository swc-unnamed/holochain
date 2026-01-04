import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    experimental: {
      async: true
    }
  },
    kit: {
        adapter: adapter({
      out: 'build'
    }),
    experimental: {
     remoteFunctions: true,

     tracing: {
      server: true
     },

     instrumentation: {
      server: true
     }
    },
    }
};

export default config;