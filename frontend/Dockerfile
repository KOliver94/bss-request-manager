###################################
#  FOR DEVELOPMENT PURPOSES ONLY  #
###################################
FROM node:16-alpine

# Set work directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json to Docker environment
COPY ./package*.json /app/frontend/

# Install all required node packages
RUN npm install --silent

# Copy everything over to Docker environment
COPY . /app/frontend

# Open port
EXPOSE 3000

# Build the frontend
CMD ["npm", "start"]