###################################
#  FOR DEVELOPMENT PURPOSES ONLY  #
###################################
FROM node:24-alpine

# Set work directory
WORKDIR /app/frontend

# Copy manifest, pnpm lockfile and workspace config to Docker environment
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml /app/frontend/

# Enable pnpm via Corepack and install all required node packages
RUN corepack enable
RUN pnpm install

# Copy everything over to Docker environment
COPY . /app/frontend

# Open port
EXPOSE 5173

# Start the frontend app
CMD ["pnpm", "start"]