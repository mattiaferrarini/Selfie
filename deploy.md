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

- wait two minutes and go to [https://site232410.tw.cs.unibo.it/](https://site232410.tw.cs.unibo.it/)

git credentials in theory are saved (configuration `git config credential.helper store`)

### Tip use ssh with a private key

# deployment script

- setup pubic key ssh login for unibo computers
    - `cd ~/.ssh/`
    - create a key `ssh-keygen -t ed25519 -C "nome.cognome@studio.unibo.it"`
    - print the public key `cat id_ed25519.pub`
    - copy it on the clipboard
    - ssh into one of unibo pc `ssh nome.cognome@bettina.cs.unibo.it`
    - append public key to file `.ssh/authorized_keys` with `echo 'ssh-ed25519 XXXX ..@studio.unibo.it' >> .ssh/authorized_keys`

- make a copy of deploy-script.sh.example `cp deploy-script.sh.example deploy-script.sh`
- modify all placeholder variables
- run it with `bash deploy-script.sh`
