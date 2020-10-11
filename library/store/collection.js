import { Action, Mutation, VuexModule } from 'vuex-class-modules'
import axios from 'axios'
import { State, FacetMode } from './types'


class CollectionModule extends VuexModule {
    /** @type {ConfigModule} */
    config = null

    /** @type {IndicesModule} */
    indices = null

    collectionId = null

    state = State.INVALID

    queryParams = {}

    totalPages = 0

    totalRecords = 0

    reloadNeeded = false

    facetMode = null

    response = {
        aggregations: {},
        records: [],
        total: null
    }

    constructor (config, indices, options) {
        super(options)
        this.config = config
        this.indices = indices
        this.facetMode = config.facetMode || FacetMode.ALL_FACETS
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
        // const collectionFacetOptions = this.config.facetOptions[this.collectionId] || this.config.defaultFacetOptions
        // this.facets = this.transformFacets(aggregations, collectionFacetOptions)
        const pageSize = this.queryParams.size || this.config.defaultPageSize
        this.totalRecords = total
        this.totalPages = Math.ceil(total / pageSize)
    }

    @Action
    async setFacetMode (facetMode) {
        if (facetMode !== this.facetMode) {
            this.facetMode = facetMode
            await this.reload()
        }
    }

    get records () {
        const collectionListRecordPreprocessors =
            this.config.listRecordPreprocessors[this.collectionId] || this.config.defaultListRecordPreprocessors
        return this.response.records.map(
            x => collectionListRecordPreprocessors.chainCall(x, {
                collection: this
            }))
    }

    get facets () {
        const facetPreprocessors = this.config.facetPreprocessors[this.collectionId] || this.config.defaultFacetPreprocessors

        const receivedFacets = facetPreprocessors.chainCall(this.response.aggregations, {
            collection: this,
            i18n: this.config.i18n
        })
        let knownFacets = this.knownFacets
        if (knownFacets === null) {
            knownFacets = Object.keys(receivedFacets).map(x => ({
                code: x,
                facet: {
                    label: x
                }
            }))
        }
        return knownFacets.map(x => ({
            code: x.code,
            received: true,
            filtered: !!this.queryParams[x.code],
            ...receivedFacets[x.code],
            ...x['facet']
        }))
    }

    get filters () {
        const ret = this.indices.byEndpoint[this.collectionId]
        if (ret) {
            return ret.index.filters
        }
        return null
    }

    get knownFacets () {
        const ret = this.indices.byEndpoint[this.collectionId]
        if (ret) {
            return ret.index.facets
        }
        return null
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
        if (this.facetMode === FacetMode.SELECTED_FACETS) {
            if (qp.facets === undefined) {
                qp.facets = ['___selected_only___']
            }
        }
        Object.entries(qp).forEach(([pkey, pvalue]) => {
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
        this.indices.selectEndpoint(collectionId)
        this.collectionId = collectionId
        this.queryParams = query
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
