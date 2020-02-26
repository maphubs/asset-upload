FROM node:12-alpine
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache --upgrade git
COPY package.json package-lock.json /app/
RUN npm config set '@bit:registry' https://node.bitsrc.io && \
    npm install --production
COPY . .
EXPOSE 4012
CMD ["node", "/app/server.js"]