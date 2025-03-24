# Use Node.js as the base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Install JSON Server globally
RUN npm install -g json-server

# Copy the db.json file to the container
COPY db.json /app/db.json

# Expose the port JSON Server runs on
EXPOSE 3000

# Run JSON Server
CMD ["json-server", "--host", "0.0.0.0", "--watch", "db.json"]
