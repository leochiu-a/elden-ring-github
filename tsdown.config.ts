import { defineConfig } from 'tsdown';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  entry: {
    'content/content': 'src/content/content.ts',
    'popup/popup': 'src/popup/popup.ts',
  },
  outDir: 'dist',
  format: ['cjs'],
  target: 'es2022',
  clean: true,
  sourcemap: false,
  minify: false,
  dts: false,
  splitting: false,
  external: ['chrome'],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
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
          mkdirSync('dist/content', { recursive: true });
          if (existsSync('src/content/styles.css')) {
            copyFileSync('src/content/styles.css', 'dist/content/styles.css');
          }

          // Copy assets
          if (existsSync('src/assets')) {
            mkdirSync('dist/assets', { recursive: true });
            const files = readdirSync('src/assets');
            files.forEach(file => {
              copyFileSync(
                join('src/assets', file),
                join('dist/assets', file)
              );
            });
          }
        } catch (error) {
          console.error('Error copying files:', error);
        }
      }
    }
  ]
});