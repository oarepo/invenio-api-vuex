import { Action, Mutation, VuexModule } from 'vuex-class-modules'
import axios from 'axios'
import { State } from './types'

class RecordModule extends VuexModule {

    /** @type {ConfigModule} */
    config = null

    state = State.INVALID

    indices = null

    record = {}

    metadata = {}

    links = {}

    created = null

    updated = null

    collectionId = null

    recordId = null

    reloadNeeded = false

    constructor (config, indices, options) {
        super(options)
        this.config = config
        this.indices = indices
    }

    get recordUrl () {
        const index = this.indices.byEndpoint[this.collectionId]
        if (index !== undefined) {
            return `${index.endpoint.url}/${this.recordId}`
        }
        return null
    }

    get loaded () {
        return this.state === State.LOADED
    }

    @Action
    async load ({ collectionId, recordId }) {
        this.collectionId = collectionId
        this.recordId = recordId

        return this.reload()
    }

    @Mutation
    setResponse (response) {
        const record = response.data
        const collectionRecordPreprocessors =
            this.config.recordPreprocessors[this.collectionId] || this.config.defaultRecordPreprocessors
        collectionRecordPreprocessors.call(record, { record: this })

        this.record = record

        this.metadata = record.metadata
        this.links = record.links
        this.created = new Date(record.created)
        this.updated = new Date(record.updated)
    }

    @Action
    async reload () {
        console.log('reload starting')
        this.state = State.LOADING
        if (this.recordUrl) {
            const response = await axios.get(this.recordUrl, {
                headers: {
                    Accept: 'application/json'
                },
                params: new URLSearchParams([['ln', this.config.language]])
            })
            this.setResponse(response)
            this.state = State.LOADED
            console.log('reload finished')
            return response.data
        } else {
            console.log('reload waiting')
            return null
        }
    }

    @Action
    async patch (data) {
        this.state = State.LOADING
        if (!Array.isArray(data)) {
            data = [data]
        }
        let resp
        if (this.config.usePost) {
            resp = await axios.post(this.recordUrl, data, {
                headers: {
                    'Content-Type': 'application/json-patch+json',
                    'X-HTTP-Method-Override': 'PATCH'
                },
                params: new URLSearchParams([['ln', this.config.language]])
            })
        } else {
            resp = await axios.patch(this.recordUrl, data, {
                headers: {
                    'Content-Type': 'application/json-patch+json'
                },
                params: new URLSearchParams([['ln', this.config.language]])
            })
        }
        this.setResponse(resp)
        this.state = State.LOADED
        return resp.data
    }

    @Action
    async save () {
        this.state = State.LOADING
        const resp = await axios.post(this.recordUrl, this.record.metadata, {
            headers: {
                'Content-Type': 'application/json'
            },
            params: new URLSearchParams([['ln', this.config.language]])
        })
        this.setResponse(resp)
        this.state = State.LOADED
        return resp.data
    }
}

export {
    RecordModule
}
