# Selfie

A website to help students manage their private, social and academic life.

## Project Structure

The project is divided into 2 main parts: the frontend and the backend. The frontend is built using Vue.js and the
backend is built using Node.js.

### Frontend
The frontend is built using Vue.js. The frontend is responsible for the user interface of the website. It is responsible
for rendering the pages, handling user interactions and making requests to the backend.
#### Folder Structure
```
src
├── assets
├── components
├── directives
├── router
├── services
├── views
├── App.vue
└── main.ts
env.local
```
- **assets**: Contains static files like images, fonts etc.
- **components**: Contains the components used in the website. A component is a reusable piece of code that can be used
  multiple times on the website.
- **directives**: Contains the custom directives used in the website. A directive is a custom attribute that can be
  attached to an element to add some behavior to it.
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
src
├── config
├── controllers
├── models
├── routes
└── server.ts
env.local
```
- **config**: Contains the configuration files used in the website.
- **controllers**: Contains the code for handling the requests from the frontend.
- **models**: Contains the code for the data models used in the website.
- **routes**: Contains the code for routing in the backend. The routes are responsible for mapping the URL to the
  controllers that should be called.
- **server.ts**: The entry point of the backend.
- **env.local**: Contains the environment variables used in the backend.

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

## Project UI

```
vue ui
```

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
