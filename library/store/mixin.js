import { Module } from 'vuex-class-modules'

function applyMixins (clz, mixins) {
    // inspired by https://github.com/justinfagnani/mixwith.js/blob/master/src/mixwith.js
    const app = mixins.reduce((c, m) => m(c), clz)

    return Module({
        generateMutationSetters: true
    })(app)
}

export { applyMixins }
