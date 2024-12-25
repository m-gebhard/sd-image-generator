# Build the frontend
FROM node:20 AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

ARG VITE_APP_WEBSOCKET_URL
ENV VITE_APP_WEBSOCKET_URL=${VITE_APP_WEBSOCKET_URL}

# Copy the rest of the application files
COPY . .

# Build the app
RUN npm run build

# Serve the app using Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy build files to Nginx web root
COPY --from=build /app/dist .

# Copy custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
