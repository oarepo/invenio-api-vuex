import { Action, Mutation, VuexModule } from 'vuex-class-modules'
import axios from 'axios'
import { State } from './types'

function until(conditionFunction) {
    const timeout = [100]

    const poll = resolve => {
        if(conditionFunction()) {
            resolve()
        }
        else {
            timeout[0] *= 1.5
            setTimeout(() => poll(resolve), timeout[0]);
        }
    }

    return new Promise(poll);
}

class IndicesModule extends VuexModule {
    /** @type {ConfigModule} */
    config = null

    indices = null

    currentLanguage = null

    currentIndex = {}

    currentEndpointName = null

    currentEndpoint = {}

    // loading state
    state = State.INVALID

    reloadNeeded = false

    constructor (config, options) {
        super(options)
        this.config = config
    }

    get loaded () {
        return this.state === State.LOADED
    }

    @Action
    async load ({ language } = { language: null }) {
        if (language === null || language === undefined) {
            language = this.config.language
        }
        if (language === this.currentLanguage && !this.reloadNeeded) {
            return      // already loaded
        }
        this.state = State.LOADING
        const response = await axios.get(this.config.indicesURL + `?ln=${language}`)
        this.indices = response.data
        // convert facet values array to translation map
        Object.values(this.indices).forEach(idx => {
            idx.facets.forEach(facet => {
                if (facet.facet.values !== undefined) {
                    facet.facet.translatedValues = facet.facet.values.reduce(
                        (n, item) => {
                            n[item.value] = item.label
                            return n
                        }, {}
                    )
                }
            })
        })
        this.currentLanguage = language
        if (this.currentEndpointName) {
            this.selectEndpoint(this.currentEndpointName)
        }
        this.state = State.LOADED
        return this.indices
    }

    @Action
    async reload () {
        return this.load({})
    }

    @Action
    async ensureLoaded () {
        if (this.state === State.LOADING) {
            // already loading, wait
            await until(() => this.state !== State.LOADED);
        }
        if (this.indices === null) {
            await this.reload()
        }
    }

    @Mutation
    selectEndpoint (endpointName) {
        this.currentEndpointName = null
        this.currentIndex = {}
        this.currentEndpoint = {}
        for (const index of Object.values(this.indices || {})) {
            for (const [indexEndpointName, endpoint] of Object.entries(index.endpoints || {})) {
                if (endpointName === indexEndpointName) {
                    this.currentIndex = index
                    this.currentEndpoint = endpoint
                    this.currentEndpointName = endpointName
                    return
                }
            }
        }
    }

    get byEndpoint () {
        const ret = {}
        for (const index of Object.values(this.indices || {})) {
            for (const [indexEndpointName, endpoint] of Object.entries(index.endpoints || {})) {
                ret[indexEndpointName] = {
                    endpoint, index
                }
            }
        }
        return ret
    }
}

export {
    IndicesModule,
    State
}
