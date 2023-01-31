# AhomeApp Server application
Simple Express.js based backend for  home surveillance and monitoring application

# Requirements
    - Node 19
    - Docker


# Configuration
    - create configuration sqlite database (see template)
    - create .env file with following config
        CONFIG_DB: '<SQLITE database with configuration>'
        JWT_KEY: '<key for authentication signing>'
        AUTHKEY: Internal camera authentication key
        HOST: Backend host IP (ex. 10.243.151.1)
        PORT: backend port (ex. 3000)


# how to run
    npm start to run backend server
    npm package to create docker image 
    