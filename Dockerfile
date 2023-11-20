FROM node:18-alpine

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine
COPY --from=0 /app/dist/ /usr/share/nginx/html
COPY /nginx.conf /etc/nginx/conf.d/default.conf
