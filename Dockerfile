FROM node:lts-alpine3.15

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install 

COPY . .

CMD [ "npm", "run", "dev" ]