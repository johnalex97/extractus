FROM node:20 AS app-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000 4000

FROM node:20

RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

COPY --from=app-stage /app /app
COPY ./nginx.conf /etc/nginx/conf.d/sites-available/default

WORKDIR /app

EXPOSE 80 3000 4000

CMD ["sh", "-c", "service nginx start && npm run dev"]
