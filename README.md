# Selfie

A website to help students manage their private, social and academic life.

## Table of Contents
- [Project Structure](#project-structure)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Choice of Technology](#choice-of-technology)
- [Use of AI](#use-of-ai)
- [Project Setup](#project-setup)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)

## Project Structure

The project is divided into 2 main parts: the frontend and the backend. The frontend is built using Vue.js and vanilla JavaScript, while the backend is built using Node.js.

### Frontend

The main part of the frontend is built using Vue.js with Typescript. The frontend is responsible for the user interface of the website. It is responsible for rendering the pages, handling user interactions, and making requests to the backend. A part of the frontend (the project one) is built using only vanilla JavaScript and HTML Components.


#### Folder Structure

```
public
├── index.html
├── projects.html
└── *.js
src
├── assets
├── components
├── directives
├── models
├── router
├── services
├── views
├── App.vue
└── main.ts
env.local
```
- **index.html** : The main page of the website.
- **projects.html** : The page where students can see their projects.
- **.js** : The javascript files used by projects.html, mainly HTML Components or modules.
----------------
- **assets**: Contains static files like images, fonts etc.
- **components**: Contains the components used in the website. A component is a reusable piece of code that can be used
  multiple times on the website.
- **directives**: Contains the custom directives used in the website. A directive is a custom attribute that can be
  attached to an element to add some behavior to it.
- **models**: Contains the data models used in the website. A data model is a class that represents the data used in the
  website.
- **router**: Contains the code for routing in the website. The router is responsible for mapping the URL to the
  components that should be rendered.
- **services**: Contains the code for making requests to the backend.
- **views**: Contains the views of the website. A view is a component that is rendered when the user visits a specific
  URL.
- **App.vue**: The root component of the website.
- **main.ts**: The entry point of the website.
- **env.local**: Contains the environment variables used in the website.

### Backend

The backend is built using Node.js. The backend is responsible for the business logic of the website. It is responsible
for handling requests from the frontend, processing the requests and sending the response back to the frontend.

#### Folder Structure

```
selfie-server
├── agenda
├── config
├── controllers
├── middlewares
├── models
├── routes
├── services
├── ws
└── server.ts
env.local
```
- **agenda**: Contains the code for the scheduler used in the website. Agenda is responsible for scheduling the tasks
  and events of the users.
- **config**: Contains the configuration files used in the website.
- **controllers**: Contains the code for handling the requests from the frontend.
- **models**: Contains the code for the data models used in the website.
- **routes**: Contains the code for routing in the backend. The routes are responsible for mapping the URL to the
  controllers that should be called.
- **services**: Contains the code for the services used in the website. A service contains part of the business logic of the website.
- **ws**: Contains the code for the WebSocket server.
- **server.ts**: The entry point of the backend.
- **env.local**: Contains the environment variables used in the backend.

## Choice of Technology

### Frontend
- **Vue.js**: Vue.js is a progressive JavaScript framework that is used for building user interfaces. It is easy to learn
  and has a small learning curve. Vue.js is a good choice for the frontend of the website because it is fast, lightweight
  and has a rich ecosystem of libraries and plugins.
- **Vanilla JavaScript**: Vanilla JavaScript is used for the project page of the website. Vanilla JavaScript is the
  native JavaScript language that is supported by all browsers. It is lightweight and has a small footprint.
----------------
- **tailwindcss**: Tailwind CSS is a utility-first CSS framework that is used for styling the website.
- **axios**: Axios is a promise-based HTTP client that is used for making requests to the backend.
- **pinia**: Pinia is a Vue.js store that is used for managing the state of the website. Vue does not have a common
  store like Redux or MobX, so we used Pinia to manage all the shared states.
- **fake-timers**: Fake Timers is a library that is used for mocking timers. We mainly used it with the time machine.


### Backend
- **Node.js**: Node.js is a JavaScript runtime that is used for building the backend of the website. Node.js is fast,
  lightweight and has a rich ecosystem of libraries and plugins.
- **Express.js**: Express.js is a web application framework for Node.js that is used for building the backend of the
  website.
- **MongoDB**: MongoDB is a NoSQL database that is used for storing the data of the website.
----------------
- **mongoose**: Mongoose is an Object Data Modeling (ODM) library for MongoDB that is used for interacting with the
  database.
- **passport**: Passport is an authentication middleware for Node.js that is used for authenticating the users.
- **ws**: ws is a WebSocket library for Node.js that is used for handling WebSocket connections.
- **agenda**: Agenda is a job scheduling library for Node.js that is used for scheduling the tasks and events of the
  users.
- **fake-timers**: Fake Timers is a library that is used for mocking timers. We mainly used it with the time machine.
- **nodmailer** and **node-pushnotifications**: Nodemailer and node-pushnotifications are libraries that are used for
  sending emails and push notifications to the users.

## Use of AI
Github Copilot was used as as an assistant for the project. It helped with the code completion and the code suggestions on repetitive tasks, such as completing the navbar for all the routes, writing simple functions for services and controllers, and performing manipulation tasks on arrays.  
It wasn't used on all the functions that required knowledge of the project or data structures, such as the scheduling of the tasks, as it would not have been able to understand the logic behind the scheduling.
We also did not use it for any graphic task, as graphic design is not its strong suit.  
This documentation, especially the "Project Structure" part, was partly generated with AI for best clarity.

## Project Setup

### Prerequisites

- **Node.js**: The project requires Node.js to be installed on your machine. You can download Node.js from
  [here](https://nodejs.org/).
- **Vue CLI**: The project uses Vue CLI for building the frontend. You can install Vue CLI using the following command:
  ```shell
  npm install -g @vue/cli
  ```
- **MongoDB**: The project uses MongoDB as the database. You can download MongoDB from [here](https://www.mongodb.com/).

### Setup

1. Clone the repository:
    ```shell
    git clone
    ```
2. Install the dependencies for the client:
    ```shell
    cd selfie-client
    npm install
    ```
3. Install the dependencies for the server:
    ```shell
    cd ../selfie-server
    npm install
    ```
4. Create a `.env.local` for both the client and the server and set the variables
5. Start the client:
    ```shell
    cd selfie-client
    npm run serve
    ```
6. Start the server:
    ```shell
    cd selfie-server
    npm run start
    ```

#### Project UI

```
vue ui
```
