# Build stage
FROM node:22-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Configure Nginx for SPA and non-root execution
RUN echo "server { \
    listen 8080; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf && \
    sed -i '/user  nginx;/d' /etc/nginx/nginx.conf && \
    sed -i 's,/run/nginx.pid,/tmp/nginx.pid,' /etc/nginx/nginx.conf

# Set working directory
WORKDIR /usr/share/nginx/html

# Clean default nginx html files
RUN rm -rf ./*

# Copy built assets from builder
COPY --from=builder /app/dist .

# Change ownership for Nginx to run as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
