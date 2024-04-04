FROM node:18.17.1

COPY . .

COPY package*.json ./ 

RUN npm i -g nodemon

WORKDIR /usr/app

EXPOSE 3000

CMD [ "npm", "start" ]