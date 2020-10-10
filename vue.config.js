const path = require('path')
const useProxy = true

const exp = {}

if (useProxy) {
    exp['devServer'] = {
        proxy: {
            '^/api': {
                target: 'https://localhost:5000',
                changeOrigin: false
            }
        }
    }
    exp['pluginOptions'] = {
        'serve-api-mocks': {
            base: '/not-used-mocks-api',
            routes: []
        }
    }
} else {
    exp['pluginOptions'] = {
        'serve-api-mocks': {
            base: '/api',
            routes: []
        }
    }
}

module.exports = {
    configureWebpack (cfg) {
        cfg.resolve.alias['@oarepo/invenio-api-vuex'] =
            path.join(__dirname, 'library/index.js')
    },
    ...exp
}

