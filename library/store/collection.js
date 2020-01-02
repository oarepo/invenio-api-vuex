import { Action, Mutation, VuexModule } from 'vuex-class-modules'
import axios from 'axios'
import { State } from './types'
import { facetFlattener } from './facets'


class CollectionModule extends VuexModule {
    /** @type {ConfigModule} */
    config = null

    collectionId = null

    state = State.INVALID

    facets = []

    records = []

    response = null

    queryParams = {}

    totalPages = 0

    totalRecords = 0

    reloadNeeded = false

    constructor (config, options) {
        super(options)
        this.config = config
    }

    @Mutation
    setSearchResults (
        {
            aggregations,
            records,
            total
        }
    ) {
        this.response = {
            aggregations,
            records,
            total
        }
        const collectionFacetOptions = this.config.facetOptions[this.collectionId] || this.config.defaultFacetOptions
        this.facets = this.transformFacets(aggregations, collectionFacetOptions)
        const collectionListRecordPreprocessors =
            this.config.listRecordPreprocessors[this.collectionId] || this.config.defaultListRecordPreprocessors
        this.records = records.map(
            x => collectionListRecordPreprocessors.chainCall(x, {
                collection: this
            }))
        const pageSize = this.queryParams.size || this.config.defaultPageSize
        this.totalRecords = total
        this.totalPages = Math.ceil(total / pageSize)
    }

    transformFacets (aggregations, facetOptions) {
        const flattenedFacets =
            facetFlattener(aggregations, facetOptions.facetExtractors, this)

        return facetOptions.facetPreprocessors.chainCall(flattenedFacets, {
            facetOptions,
            collection: this,
            i18n: this.config.i18n
        })
    }

    get loaded () {
        return this.state === State.LOADED
    }

    get page () {
        return parseInt(this.queryParams.page || 1)
    }

    get pageSize () {
        return parseInt(this.queryParams.size || this.config.defaultPageSize)
    }

    get axiosParams () {
        const axiosParams = new URLSearchParams()
        const qp = { ...this.queryParams }
        if (qp.size === undefined) {
            qp.size = this.config.defaultPageSize
        }
        Object.entries(this.queryParams).forEach(([pkey, pvalue]) => {
            if (Array.isArray(pvalue)) {
                pvalue.forEach((val) => {
                    axiosParams.append(pkey, val)
                })
            } else {
                axiosParams.append(pkey, pvalue)
            }
        })
        return axiosParams
    }

    @Action
    async load ({ query, collectionId }) {
        this.collectionId = collectionId
        this.queryParams = { ...query }
        return this.reload()
    }


    @Action
    async reload () {
        // duplicate params
        this.state = State.LOADING

        // convert to http params
        const axiosParams = this.axiosParams

        const response = await axios.get(`${this.config.collectionURL(this.collectionId)}`, {
            params: axiosParams
        })
        const { aggregations, hits } = response.data
        this.setSearchResults({
            aggregations,
            records: hits.hits,
            total: hits.total
        })
        this.state = State.LOADED
        return response.data
    }

    @Action
    transform () {
        // setSearchResults will reload facets so that all their values get translated (if needed)
        this.setSearchResults(this.response)
    }

    @Action
    async create ({ metadata, storeModule }) {
        const resp = await axios.post(
            this.config.collectionURL(this.collectionId),
            metadata, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        this.reloadNeeded = true
        if (storeModule !== undefined) {
            storeModule.setResponse(resp)
            storeModule.recordId = resp.data.metadata.id
            storeModule.collectionId = this.collectionId
            storeModule.state = State.LOADED
        }
        return resp.data
    }
}

export {
    CollectionModule
}
