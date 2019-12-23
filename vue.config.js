const path = require('path')


module.exports = {
    configureWebpack (cfg) {
        cfg.resolve.alias['@oarepo/invenio-oarepo-ui-vue'] =
            path.join(__dirname, 'library/index.js');
    }
}

