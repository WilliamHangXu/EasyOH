# Stage 1: Build the app
FROM node:16-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci


# Copy the rest of your application's code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Copy the built files from the previous stage to Nginx's default directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Optional: Copy custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
