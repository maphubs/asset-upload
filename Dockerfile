FROM mhart/alpine-node:10 as builder
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache --upgrade git
COPY package.json package-lock.json /app/
RUN npm config set '@bit:registry' https://node.bitsrc.io && \
    npm install --production

# Bundle app source
FROM mhart/alpine-node:base-10
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app .
COPY . .
EXPOSE 4012
CMD ["node", "/app/server.js"]