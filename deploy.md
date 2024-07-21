# steps to deploy on gocker

- ssh in a unibo computer es. `ssh [name.surname]@bettina.cs.unibo.it`

- cd into the cloned repository with `cd /home/web/site232410/html/Selfie`

- run `git pull` if needed __access token is required__

- make sure to be in the deploy branch `git checkout deploy`

- build the project, run 
    ```bash
    cd selfie-client
    npm install
    npm run build
    cd ../selfie-server
    npm install
    npm run build
    cd ..
    ```

- ssh into gocker with `ssh [name.surname]@gocker.cs.unibo.it`

- run `start node-20 site232410 Selfie/selfie-server/server-deploy.js`

- wait two minuts and go to [https://site232410.tw.cs.unibo.it/](https://site232410.tw.cs.unibo.it/)

### Tip use ssh with a private key