FROM node:18.17.1

COPY . .

COPY package*.json ./ 

RUN npm i -g nodemon

WORKDIR /usr/app

EXPOSE 8000

CMD [ "npm", "start" ]