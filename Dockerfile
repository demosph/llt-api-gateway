FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY src ./src
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD node -e "fetch('http://localhost:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["npm","start"]
