FROM node:lts-alpine3.15

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install 

COPY . .

RUN npm tun db:migrate
RUN npm run db:generate
CMD npm run dev