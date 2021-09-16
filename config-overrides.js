module.exports = {
  webpack: function (config, env) {
    // POLYFILLS FOR NODE.JS CORE MODULES
    if (!config.resolve.fallback) {
      config.resolve.fallback = {}
    }
    config.resolve.fallback.crypto = 'crypto-browserify'
    config.resolve.fallback.path = 'path-browserify'
    config.resolve.fallback.stream = 'stream-browserify'

    return config
  },
}
