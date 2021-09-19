FROM node:10.15.1
COPY . /app/gateway
WORKDIR /app/gateway
RUN npm rebuild
RUN npm install
USER node
CMD npm run start:dev