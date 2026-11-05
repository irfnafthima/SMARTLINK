# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app

# Copy package descriptors first for Docker layer caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build the production bundle
RUN npm run build

# Stage 2: Serve with Nginx web server
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build from stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
