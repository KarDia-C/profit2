const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true
        }
      }
    }
  },
  productionSourceMap: false,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/profit2/'
    : '/'
})
