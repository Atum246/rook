FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY package*.json ./
RUN npm install --production

# Copy frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --production

# Copy source
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:10000/api/health || exit 1

# Start
CMD ["node", "server.js"]
