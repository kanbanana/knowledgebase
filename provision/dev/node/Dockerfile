FROM node:4.4.4
CMD npm install --no-bin-links && node --debug=5858 bin/www

RUN npm install -g nodemon
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

VOLUME ["/usr/src/app"]