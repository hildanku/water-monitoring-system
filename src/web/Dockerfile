FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 9006

CMD ["npm", "run", "preview", "--", "--port", "9006", "--host"]