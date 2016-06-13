FROM ubuntu:trusty

RUN apt-get update -y
RUN apt-get install -y curl
RUN curl -o opensearchserver.deb -L http://sourceforge.net/projects/opensearchserve/files/Stable_release/1.5.10/opensearchserver-1.5.10-b893.deb/download

RUN apt-get install -y openjdk-7-jdk

RUN dpkg -i opensearchserver.deb

COPY ./roles/staging/volume/ /srv/

RUN mkdir -p /srv/opensearchserver/logs/
RUN touch /srv/opensearchserver/logs/oss.log

CMD service opensearchserver stop && chmod -R 777 /srv/ && sed -e 's/OPENSEARCHSERVER_DATA=\/var\/lib\/opensearchserver\/data/OPENSEARCHSERVER_DATA=\/srv\/opensearchserver/' -i /etc/opensearchserver && service opensearchserver start && tail -F /var/log/opensearchserver/server.out
