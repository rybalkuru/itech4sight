import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                agrosainsurance: resolve(__dirname, 'agrosainsurance.html'),
            }
        }
    }
});