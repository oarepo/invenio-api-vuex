import { Action, Mutation, VuexModule } from 'vuex-class-modules'
import axios from 'axios'
import { State } from './types'

class IndicesModule extends VuexModule {
    /** @type {ConfigModule} */
    config = null

    indices = {}

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
            language = this.config.defaultLanguage
        }
        if (language === this.currentLanguage && !this.reloadNeeded) {
            return      // already loaded
        }
        this.state = State.LOADING
        const response = await axios.get(this.config.indicesURL + `?ln=${language}`)
        this.indices = response.data
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

    @Mutation
    selectEndpoint (endpointName) {
        this.currentEndpointName = null
        this.currentIndex = {}
        this.currentEndpoint = {}
        for (const index of Object.values(this.indices)) {
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
        for (const index of Object.values(this.indices)) {
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
