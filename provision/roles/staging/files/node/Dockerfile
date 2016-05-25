FROM node:4.4.4
EXPOSE 8888
CMD npm install --no-bin-links && nodemon server.js

RUN npm install -g nodemon
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

VOLUME ["/usr/src/app"]