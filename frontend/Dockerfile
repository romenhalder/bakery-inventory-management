# ===== Stage 1: Build =====
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files for dependency caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .

# Build with the API URL pointing to the backend service
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ===== Stage 2: Serve =====
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
