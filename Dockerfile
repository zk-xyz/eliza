# Use a specific Node.js version for better reproducibility
FROM node:23.3.0-slim AS builder

# Add these lines
ARG GITHUB_TOKEN
ARG NPM_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}
ENV NPM_TOKEN=${NPM_TOKEN}

# Install pnpm globally and necessary build tools
RUN npm install -g pnpm@9.4.0 && \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
        git \
        python3 \
        python3-pip \
        curl \
        node-gyp \
        ffmpeg \
        libtool-bin \
        autoconf \
        automake \
        libopus-dev \
        make \
        g++ \
        build-essential \
        libcairo2-dev \
        libjpeg-dev \
        libpango1.0-dev \
        libgif-dev \
        openssl \
        libssl-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Python 3 as the default python
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Set the working directory
WORKDIR /app

# Copy application code
COPY . .

# Before pnpm install
RUN git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"

# Install dependencies
RUN pnpm install

# Build the project
RUN pnpm run build && pnpm prune --prod

# Final runtime image
FROM node:23.3.0-slim

# Install runtime dependencies
RUN npm install -g pnpm@9.4.0 && \
    apt-get update && \
    apt-get install -y \
        git \
        python3 \
        ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy built artifacts and production dependencies from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/turbo.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/agent ./agent
COPY --from=builder /app/client ./client
COPY --from=builder /app/lerna.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/characters ./characters

# Production environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=10000

# Expose port
EXPOSE 10000

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# The entrypoint script will handle client vs agent based on SERVICE_TYPE
ENTRYPOINT ["docker-entrypoint.sh"]