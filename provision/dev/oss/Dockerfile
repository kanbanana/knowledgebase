FROM java:openjdk-7-jdk

EXPOSE 9090

VOLUME ["/srv"]

RUN apt-get update -y
RUN apt-get install -y curl
RUN curl -o opensearchserver.deb -L http://sourceforge.net/projects/opensearchserve/files/Stable_release/1.5.10/opensearchserver-1.5.10-b893.deb/download

RUN dpkg -i opensearchserver.deb

RUN mkdir /files/

CMD service opensearchserver stop && sed -e 's/OPENSEARCHSERVER_DATA=\/var\/lib\/opensearchserver\/data/OPENSEARCHSERVER_DATA=\/srv\/opensearchserver/' -i /etc/opensearchserver && service opensearchserver start && tail -F /var/log/opensearchserver/server.out


