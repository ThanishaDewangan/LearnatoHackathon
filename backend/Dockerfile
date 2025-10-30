FROM node:20
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm i --no-audit --no-fund
RUN npm i -D typescript ts-node prisma
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npx tsc --init --rootDir src --outDir dist --esModuleInterop --module ES2022 --target ES2022 --moduleResolution node --resolveJsonModule --skipLibCheck --strict false || true
RUN npx tsc
ENV PORT=4000
EXPOSE 4000
CMD npx prisma db push && node dist/server.js

