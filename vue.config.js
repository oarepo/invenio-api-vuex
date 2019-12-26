const path = require('path')


module.exports = {
    configureWebpack (cfg) {
        cfg.resolve.alias['@oarepo/invenio-api'] =
            path.join(__dirname, 'library/index.js');
    },
    pluginOptions: {
        "serve-api-mocks": {
            base: "/api",
            routes: []
        }
    }
}
