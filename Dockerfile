FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Prisma needs OpenSSL available during generate.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Install workspace dependencies without lifecycle scripts.
# server/postinstall runs prisma generate, but schema is not copied yet.
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/
RUN npm ci --ignore-scripts

# Copy source after dependency install for better layer caching.
COPY . .

# Build shared types and client assets, then compile the server.
RUN npm run build -w shared \
  && npm run db:generate -w server \
  && npm run build -w client \
  && npm run build -w server

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV RDS_CA_BUNDLE_PATH=/etc/ssl/certs/rds-global-bundle.pem
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/rds-global-bundle.pem

# Install CA certificates and trust AWS RDS TLS chain for production SSL.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && curl -fsSL -o "$RDS_CA_BUNDLE_PATH" "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem" \
  && rm -rf /var/lib/apt/lists/*

# Keep CLI tooling available so migrations can run at container startup.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/prisma.config.ts ./server/prisma.config.ts
COPY --from=builder /app/server/src/generated ./server/src/generated
COPY --from=builder /app/server/package*.json ./server/

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate:deploy -w server && npm run start -w server"]
