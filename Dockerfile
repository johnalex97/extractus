FROM node:20 AS app-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000 4000

FROM nginx:stable

COPY --from=app-stage /app /app
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 3000 4000

CMD ["sh", "-c", "nginx -g 'daemon off;' & cd /app && npm run dev"]