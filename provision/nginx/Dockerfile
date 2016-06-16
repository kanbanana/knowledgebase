FROM nginx:1.10.1
MAINTAINER robert.kettler@outlook.com
MAINTAINER me@danielweidle.de
RUN apt-get update
RUN apt-get install -y curl
RUN /usr/bin/curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential
COPY development/client /tmp/client
RUN npm install -g gulp 
RUN npm install -g bower 
WORKDIR "/tmp/client"
RUN npm install --no-bin-links
RUN bower install --allow-root
RUN gulp build
RUN rm -Rf /usr/share/nginx/html
RUN mv -f /tmp/client/dist /usr/share/nginx/html
COPY provision/nginx/.htpasswd /etc/nginx/conf.d/.htpasswd
COPY provision/nginx/nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR "/usr/share/nginx/html"
