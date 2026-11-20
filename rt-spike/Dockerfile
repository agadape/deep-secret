# Deep Secret presence + gas-drip server. Holds no game secrets; DRIP_PRIVATE_KEY (testnet only) comes from the host's secret store.
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.mjs drip.mjs ./
COPY public ./public
ENV NODE_ENV=production PORT=8787
EXPOSE 8787
USER node
CMD ["node", "server.mjs"]
