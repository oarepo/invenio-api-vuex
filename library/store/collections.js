// import { Action, Module, VuexModule } from 'vuex-class-modules'
import { Action, VuexModule } from 'vuex-class-modules'
import axios from 'axios'
import { State } from './types'

class CollectionListModule extends VuexModule {
    /** @type {ConfigModule} */
    config = null

    collections = []

    // loading state
    state = State.INVALID

    reloadNeeded = false

    constructor(config, options) {
        super(options);
        this.config = config;
    }

    get loaded () {
        return this.state === State.LOADED
    }

    get visibleCollections () {
        if (this.state !== State.LOADED) {
            return []
        }
        return this.collections.filter(x => !x.hidden)
    }

    @Action
    async load () {
        this.state = State.LOADING
        const response = await axios.get(this.config.collectionsURL)
        this.collections = response.data
        this.state = State.LOADED
        return this.collections
    }

    @Action
    async reload () {
        return this.load()
    }
}

export {
    CollectionListModule,
    State
}
