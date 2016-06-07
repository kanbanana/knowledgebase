FROM node:4.4.4
CMD npm install --no-bin-links && nodemon -L bin/www

RUN npm install -g nodemon
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

VOLUME ["/usr/src/app"]