# AhomeApp Server application
Simple Express.js based backend for  home surveillance and monitoring application (AHomeApp)

# Requirements
    - Node 19
    - Docker
    - Bridge application


# Configuration
    - create configuration sqlite database (see template)
    - create .env file with following config
        CONFIG_DB: '<SQLITE database with configuration>'
        JWT_KEY: '<key for authentication signing>'
        AUTHKEY: Authentication key for data retriever bridge application
        HOST: Backend host IP (ex. 10.243.151.1)
        PORT: backend port (ex. 3000)
        USEHTTPS: enable https (true / false)
        SSL_PRIVKEY, SSL_CA, SSL_CERT: path to SSL cerificate files


# how to run
    npm start: run backend server
    npm startforever: run backend server with autorestart on update or crash 
    npm package to create docker image 
    