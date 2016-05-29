# knowledgebase


# Development
This repository uses git flow branching model! Information can be found at https://danielkummer.github.io/git-flow-cheatsheet/

## Setup Development VM
1. Download and install vagrant https://www.vagrantup.com/downloads.html
2. Open cmd and navigate to project root directory
3. Run "vagrant up --provision"

### Installed Services
- ssh (Port: 2222 - "vagrant ssh")
- mongodb (Port: 27017)
- nginx (Port:8080 Directory: development)
- opensearchserver (Port:9090 Directory: provision/roles/staging/volume/opensearchserver)
### Test
- run "npm install -g gulp"
- run gulp inside the development/server/ folder