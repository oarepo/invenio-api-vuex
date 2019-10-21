/* eslint "import/prefer-default-export": "off" */

import {
    Action, Module, Mutation, VuexModule
} from 'vuex-class-modules'
import axios from 'axios'
import Query from '../services/query'

const State = {
    INVALID: 0,
    LOADING: 1,
    LOADED: 2
}

@Module
class CollectionListModule extends VuexModule {
    // state
    collections = []

    // loading state
    state = State.INVALID

    apiURL = null

    @Mutation
    setCollections (collections) {
        this.collections = collections
    }

    @Mutation
    setApiURL (apiURL) {
        this.apiURL = apiURL
    }

    @Mutation
    setState (state) {
        this.state = state
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
    async loadCollections (force = false) {
        if (this.loaded && !force) {
            return this.collections
        }

        this.setState(State.LOADING)
        const response = await axios.get(`${this.apiURL}collections`)
        this.setCollections(response.data)
        this.setState(State.LOADED)

        return response.data
    }
}

@Module
class CollectionModule extends VuexModule {
    // state
    collectionDefinition = {}

    // translations
    valueTranslator = null

    state = State.INVALID

    aggregations = {}

    items = []

    queryParams = {}

    collectionListModule = null

    facetHandler = null

    totalPages = 0

    @Mutation
    setFacetHandler (facetHandler) {
        this.facetHandler = facetHandler
    }

    @Mutation
    setState (state) {
        this.state = state
    }

    @Mutation
    setCollectionListModule (collectionListModule) {
        this.collectionListModule = collectionListModule
    }

    @Mutation
    setCollectionDefinition (collectionDefinition) {
        this.collectionDefinition = collectionDefinition
    }

    @Mutation
    setValueTranslator (valueTranslator) {
        this.valueTranslator = valueTranslator
    }

    @Mutation
    setQueryParams (queryParams) {
        // make duplicate
        this.queryParams = Object.assign({}, queryParams)
    }

    flatten (aggregations, queryParams) {
        const valueTranslator = this.valueTranslator || (x => x)
        const flattenedAggregations = {}
        Object.entries(aggregations).forEach(([key, val]) => {
            const value = val
            if (key !== 'doc_count' && value !== null) {
                if (value.buckets !== undefined) {
                    value.label = valueTranslator(key, {
                        type: 'facet'
                    })
                    value.buckets.forEach((x) => {
                        const bucket = x
                        bucket.facet = key
                        bucket.label = valueTranslator(x.key, {
                            type: 'bucket',
                            facet: key,
                            bucket: bucket
                        })
                        const _key = this.callFacetHandler('facetKey', key, bucket.key, bucket) || bucket.key

                        bucket.selected = queryParams.has(key, _key)
                    })
                    flattenedAggregations[key] = value
                } else {
                    // NOTE: This is needed for numeric aggregations
                    if ('value' in value && Number.isInteger(value['value'])) {
                        flattenedAggregations[key] = value
                    } else {
                        Object.assign(flattenedAggregations, this.flatten(value, queryParams))
                    }
                }
            }
        })
        return flattenedAggregations
    }

    @Mutation
    setSearchResults (
        {
            aggregations,
            items,
            total
        }
    ) {
        const q = new Query(this.queryParams)
        this.aggregations = this.flatten(aggregations, q)
        this.items = items
        const pageSize = this.queryParams.size || 10
        this.totalPages = Math.ceil(total / pageSize)

    }

    get restSearchUrl () {
        const col = this.collectionDefinition
        if (col && col.rest) {
            return col.rest
        }
        return undefined
    }

    get loaded () {
        return this.state === State.LOADED
    }

    @Action
    async search (
        {
            collectionDefinition,
            params,
            force
        }
    ) {
        // duplicate params
        const queryParams = params || {}
        if (this.loaded
            && this.collectionDefinition.code === collectionDefinition.code
            && this.queryParams === queryParams && !force) {
            return undefined // already loaded
        }
        this.setCollectionDefinition(collectionDefinition)
        this.setQueryParams(queryParams)
        this.setState(State.LOADING)

        // convert to http params
        const axiosParams = new URLSearchParams()
        Object.entries(queryParams).forEach(([pkey, pvalue]) => {
            if (Array.isArray(pvalue)) {
                pvalue.forEach((val) => {
                    axiosParams.append(pkey, val)
                })
            } else {
                axiosParams.append(pkey, pvalue)
            }
        })

        const response = await axios.get(`${this.restSearchUrl}`, {
            params: axiosParams
        })
        const { aggregations, hits } = response.data
        this.setSearchResults({
            aggregations,
            items: hits.hits,
            total: hits.total
        })
        this.setState(State.LOADED)
        return { response: response.data }
    }

    @Action
    changeLocale () {
        this.setSearchResults({
            aggregations: this.aggregations,
            items: this.items
        })
    }

    @Action
    async setPage (page) {
        return this.search({
            collectionDefinition: this.collectionDefinition,
            params: {
                ...this.queryParams,
                page
            },
            force: false,
            append: false
        })
    }

    getRouter() {
        const router = this.callFacetHandler('getRouter')
        if (!router) {
            throw new Error('Please set up getRouter method on facetHandler')
        }
        return router
    }

    @Action
    async facetSelected (
        {
            facet,
            key,
            bucket
        }
    ) {
        if (!this.callFacetHandler('facetSelected', facet, key, bucket)) {
            key = this.callFacetHandler('facetKey', facet, key, bucket) || key
            const router = this.getRouter()
            const q = new Query(router.currentRoute.query)
            q.set(facet, key)
            router.push({
                query: q.query
            })
        }
    }

    callFacetHandler (methodName, ...options) {
        if (!this.facetHandler || !this.facetHandler[methodName]) {
            return null
        }
        return this.facetHandler[methodName](...options)
    }

    @Action
    async facetDeselected (
        {
            facet,
            key,
            bucket
        }
    ) {
        if (!this.callFacetHandler('facetDeselected', facet, key, bucket)) {
            key = this.callFacetHandler('facetKey', facet, key, bucket) || key
            const router = this.getRouter()
            const q = new Query(router.currentRoute.query)
            q.remove(facet, key)
            router.push({
                query: q.query
            })
        }
    }
}

@Module
class CollectionItemModule extends VuexModule {
    // state
    collectionDefinition = {}

    // translations
    valueTranslator = null

    state = State.INVALID

    item = {}

    itemId = null

    collectionListModule = null

    collectionModule = null

    itemPreprocessors = []

    @Mutation
    setCollectionListModule (collectionListModule) {
        this.collectionListModule = collectionListModule
    }

    @Mutation
    setCollectionModule (collectionModule) {
        this.collectionModule = collectionModule
    }

    @Mutation
    setState (state) {
        this.state = state
    }

    @Mutation
    setCollectionDefinition (collectionDefinition) {
        this.collectionDefinition = collectionDefinition
    }

    @Mutation
    setValueTranslator (valueTranslator) {
        this.valueTranslator = valueTranslator
    }

    @Mutation
    setItem (item) {
        this.item = item
    }

    @Mutation
    setItemId (itemId) {
        this.itemId = itemId
    }

    @Mutation
    registerItemPreprocessor (itemPreprocessor) {
        this.itemPreprocessors.push(itemPreprocessor)
    }

    @Mutation
    unregisterItemPreprocessor (itemPreprocessor) {
        this.itemPreprocessors = this.itemPreprocessors.filter(x => x !== itemPreprocessor)
    }

    get restUrl () {
        const col = this.collectionDefinition
        if (col && col.rest) {
            return col.rest
        }
        return undefined
    }

    get loaded () {
        return this.state === State.LOADED
    }

    get itemRestUrl () {
        return `${this.restUrl}${this.itemId}`
    }

    @Action
    async load (
        {
            collectionDefinition,
            itemId,
            force = false
        }
    ) {
        if (this.loaded
            && this.collectionDefinition.code === collectionDefinition.code
            && this.itemId === itemId && !force) {
            return { item: this.item } // already loaded
        }

        this.setCollectionDefinition(collectionDefinition)
        this.setItemId(itemId)
        this.setState(State.LOADING)

        const response = await axios.get(this.itemRestUrl)
        const item = response.data

        this.itemPreprocessors.forEach(x => x(item, 'loaded'))
        this.setItem(item)
        this.setState(State.LOADED)
        return { item: response.data }
    }

    @Action
    async reload () {
        this.load({
            collectionDefinition: this.collectionDefinition,
            itemId: this.itemId,
            force: true
        })
    }

    @Action
    async patch (data) {
        if (!Array.isArray(data)) {
            data = [data]
        }
        const resp = await axios.patch(this.itemRestUrl, data, {
            headers: {
                'Content-Type': 'application/json-patch+json'
            }
        })
        if (resp.status === 200) {
            this.setItem(resp.data)
        }

        return resp
    }
}

export {
    CollectionListModule,
    CollectionModule,
    CollectionItemModule,
    State
}
