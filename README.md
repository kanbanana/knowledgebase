# knowledgebase


# Development
This repository uses git flow branching model! Information can be found at https://danielkummer.github.io/git-flow-cheatsheet/

Jenkins CI build is triggered on every push event. Build results (including testsreports) can be found at https://danielweidle.de/jenkins/job/knowledgebase-develop/

## Setup Development VM
1. Donwload and install VirtualBox (https://www.virtualbox.org/wiki/Downloads)
2. Download and install vagrant https://www.vagrantup.com/downloads.html
3. Follow instructions in the clients readme (development/client/README.md)
4. Open cmd and navigate to project root directory
5. Run "vagrant up --provision"

### Installed Services
- ssh (Port: 2222 - "vagrant ssh")
- mongodb (Port: 27017)
- ~~nginx (Port:8080 Directory: development)~~
- nginx (localhost:8080 -> /development/client/dist | 
  localhost:8080/api/ -> nodeserver:3000/api/)
- nodeserver (localhost:3000)
- opensearchserver (Port:9090 Configuration: provision/roles/staging/volume/opensearchserver Files: development/server/uploads/articles/)

### Test
- run "npm install -g gulp"
- run gulp inside the development/server/ folder