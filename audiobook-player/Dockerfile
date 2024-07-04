FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "--ssl-cert", "/usr/src/ssl/cert.pem", "--ssl-key", "/usr/src/ssl/key.pem", "-s", "build", "-l", "3000"]