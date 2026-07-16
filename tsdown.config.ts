import { defineConfig } from 'tsdown';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  entry: ['src/content/content.ts', 'src/popup/popup.ts'],
  outDir: 'dist',
  format: ['cjs'],
  clean: true,
  external: ['chrome'],
  plugins: [
    {
      name: 'copy-files',
      writeBundle() {
        try {
          // Copy manifest.json
          if (existsSync('manifest.json')) {
            copyFileSync('manifest.json', 'dist/manifest.json');
          }

          // Copy popup files
          mkdirSync('dist/popup', { recursive: true });
          if (existsSync('src/popup/popup.html')) {
            copyFileSync('src/popup/popup.html', 'dist/popup/popup.html');
          }
          if (existsSync('src/popup/popup.css')) {
            copyFileSync('src/popup/popup.css', 'dist/popup/popup.css');
          }

          // Copy content CSS
          if (existsSync('src/content/styles.css')) {
            mkdirSync('dist/content', { recursive: true });
            copyFileSync('src/content/styles.css', 'dist/content/styles.css');
          }

          // Copy assets
          if (existsSync('src/assets')) {
            mkdirSync('dist/assets', { recursive: true });
            const files = readdirSync('src/assets');
            files.forEach((file: string) => {
              copyFileSync(join('src/assets', file), join('dist/assets', file));
            });
          }
        } catch (error) {
          console.error('Error copying files:', error);
        }
      },
    },
  ],
});
