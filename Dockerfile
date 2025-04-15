# Stage 1: Build
FROM node:20-slim AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force

# Now copy the rest of the source code, including migrations
COPY . ./

# Optionally build your project (if you have a build script)
# RUN npm run build

# (Optional) You can add a debug step to confirm your files are copied
RUN ls -la /app

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Copy everything from the build stage into the production image
COPY --from=build /app /app

# Copy entrypoint script and set it to be executable
#COPY entrypoint.sh /usr/local/bin/entrypoint.sh
#RUN chmod +x /usr/local/bin/entrypoint.sh

# Use the entrypoint script to run migrations and then start the app
# ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# The default command to run your application
CMD ["node", "app.js"]

# Expose the app's port (if necessary)
EXPOSE 3000

