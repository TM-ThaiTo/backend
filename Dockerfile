# Development stage
FROM node:18-alpine AS development

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set NODE_ENV
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built application from development stage
COPY --from=development /usr/src/app/dist ./dist

# Expose API port
EXPOSE 6103

# Start the server using production build
CMD ["node", "dist/main"]



# docker build . -t nestjs
# docker run -p 6103:6103 nestjs