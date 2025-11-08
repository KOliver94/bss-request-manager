###################################
#  FOR DEVELOPMENT PURPOSES ONLY  #
###################################
FROM node:24-alpine

# Set work directory
WORKDIR /app/frontend-admin

# Copy package.json and package-lock.json to Docker environment
COPY ./package*.json /app/frontend-admin/

# Install all required node packages
RUN npm install --silent

# Copy everything over to Docker environment
COPY . /app/frontend-admin

# Open port
EXPOSE 5174

# Start the frontend-admin app
CMD ["npm", "start"]