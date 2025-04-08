@echo off
set NODE_ENV=production
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --external:vite --external:./vite.ts --bundle --format=esm --outdir=dist --alias:@=./server --alias:@shared=./shared 