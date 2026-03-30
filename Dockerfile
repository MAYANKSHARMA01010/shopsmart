FROM node:20-alpine

# Set the working directory corresponding to your project structure
WORKDIR /app

# Enable corepack to use pnpm and install dependencies first for caching layers
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy the core workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy each packages package.json
COPY client/package.json client/
COPY server/package.json server/

# Install the monorepo dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Generate Prisma Client (if applicable for server)
RUN pnpm db:generate

# Build the client application (Next.js)
RUN pnpm build

# Expose ports that your Next.js frontend (3000) and Express server/API (e.g. 8080 or 4000) will use
# Adjust server port as necessary based on your server configuration
EXPOSE 3000
EXPOSE 8080

# For a basic setup, we execute the unified dev script which starts both your client and server via pnpm
# Alternatively, you can change this to run a specific package, e.g., ["pnpm", "run", "dev:server"]
CMD ["pnpm", "run", "dev"]
