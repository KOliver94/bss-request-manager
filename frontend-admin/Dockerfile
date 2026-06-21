###################################
#  FOR DEVELOPMENT PURPOSES ONLY  #
###################################
FROM node:24-alpine

# Set work directory
WORKDIR /app/frontend-admin

# Copy manifest, pnpm lockfile and workspace config to Docker environment
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml /app/frontend-admin/

# Enable pnpm via Corepack and install all required node packages
RUN corepack enable
RUN pnpm install

# Copy everything over to Docker environment
COPY . /app/frontend-admin

# Open port
EXPOSE 5174

# Start the frontend-admin app
CMD ["pnpm", "start"]