FROM node:20.11.1-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3333

VOLUME [ "/app/node_modules" ]

CMD ["npm", "run", "start:dev"]
