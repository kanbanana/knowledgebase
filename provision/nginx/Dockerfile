FROM nginx
COPY .htpasswd /etc/nginx/conf.d/.htpasswd
COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
