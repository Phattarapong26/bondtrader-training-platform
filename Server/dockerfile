FROM node:20-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript code (optional, since the app uses ts-node-dev)
RUN npx tsc || echo "Skipping TypeScript compilation"

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies including dev dependencies (needed for ts-node)
RUN npm install

# Copy the rest of the application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/nodemon.json ./nodemon.json

# Create uploads directory if it doesn't exist
RUN mkdir -p /app/src/uploads

# Expose the port the app runs on
EXPOSE 3000

# Run the application with ts-node-dev in production (can be changed to use node with compiled JS if needed)
CMD ["npm", "start"] 