FROM node:lts-alpine3.15 as base
ENV NODE_ENV=production

EXPOSE 80

WORKDIR /app
COPY package*.json ./

RUN npm install --only=production \
    && npm cache clean --force
ENV PATH /app/node_modules/.bin:$PATH 


FROM base as dev
ENV NODE_ENV=development
COPY . .
RUN npm install --only=development
RUN npm run db:migrate
RUN npm run db:generate
CMD npm run dev


FROM dev as build
COPY . .
RUN tsc


FROM base as prod
COPY --from=build /app/dist/ .
CMD ["node", "src/index.js"]