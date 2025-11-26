FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000 4000

CMD ["npm", "run", "dev"]

FROM nginx:stable

COPY --from=app /app /app
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 3000 4000

CMD ["sh", "-c", "nginx -g 'daemon off;' & cd /app && npm run dev"]