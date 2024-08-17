const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        "util": require.resolve("util/"),
        "timers": require.resolve("timers-browserify")
      }
    }
  }
})
