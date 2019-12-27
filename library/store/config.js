import { bucketExtractor, facetTranslator, NOT_A_FACET, TranslationOptions } from './facets'

class CallbackList {
    callbacks = []

    constructor (...args) {
        this.callbacks.push(...args)
    }

    addCallback (callback) {
        if (Array.isArray(callback)) {
            this.callbacks.push(...callback)
        } else {
            this.callbacks.push(callback)
        }
    }

    removeCallback (callback) {
        this.callbacks = this.callbacks.map(x => x !== callback)
    }

    call (...args) {
        let ret = []
        for (let i = this.callbacks.length - 1; i >= 0; i--) {
            const c = this.callbacks[i]
            ret.push(c(...args))
        }
        return ret
    }

    chainCall (arg, ...args) {
        for (let i = this.callbacks.length - 1; i >= 0; i--) {
            const c = this.callbacks[i]
            arg = c(arg, ...args)
        }
        return arg
    }
}

function convertToCallbackList(x) {
    if (x === null || x === undefined) {
        return new CallbackList()
    }
    if (x instanceof CallbackList) {
        return x
    }
    if (!Array.isArray(x)) {
        x = [x]
    }
    return new CallbackList(...x)
}

function convertDictToCallbackList(obj) {
    if (obj === null || obj === undefined) {
        return {}
    }
    return Object.fromEntries(Object.entries(obj).map(x => [x[0], convertToCallbackList(x[1])]))
}

class FacetOptions {
    facetExtractors = new CallbackList(bucketExtractor)
    facetPreprocessors = new CallbackList(facetTranslator)

    translation = {
        /*
            Translate facet titles by default. Can be overriden via translatedTitles
         */
        defaultTranslateTitles: TranslationOptions.NO_PREFIX,

        /*
            Translate facet values by default. Can be overriden via translatedValues
         */
        defaultTranslateValues: TranslationOptions.NO_TRANSLATION,

        /*
            A dictionary from facet name to Union[TranslationOptions, false, str].

            not present: use defaultTranslateTitles
            NO_TRANSLATION: do not translate the name to title
            NO_PREFIX: use facet name as translation key
            any other string: use the given string as a translation key
         */
        translateTitles: {},

        /*
            A dictionary from facet name to Union[TranslationOptions, false, str].

            not present: use defaultTranslateValues
            NO_TRANSLATION: do not translate the facet value's label
            NO_PREFIX: use facet's label as translation key
            FACET_NAME_PREFIX: use ${facet_name}.${facet.value.label} as translation key
            any other string: use ${this_string}.${facet.value.label} as translation key
         */
        translateValues: {}
    }

    constructor ({
                     parent,
                     facetExtractors, facetPreprocessors,
                     defaultTranslateTitles, defaultTranslateValues,
                     translateTitles, translateValues
                 }) {
        if (parent) {
            this.assign({
                facetExtractors: parent.facetExtractors,
                facetPreprocessors: parent.facetPreprocessors,
                defaultTranslateTitles: parent.defaultTranslateTitles,
                defaultTranslateValues: parent.defaultTranslateValues,
                translateTitles: parent.translateTitles,
                translateValues: parent.translateValues
            })
        }
        this.assign({
            facetExtractors, facetPreprocessors,
            defaultTranslateTitles, defaultTranslateValues,
            translateTitles, translateValues
        })
    }

    assign ({
                facetExtractors, facetPreprocessors,
                defaultTranslateTitles, defaultTranslateValues,
                translateTitles, translateValues
            }) {
        if (facetExtractors !== undefined) {
            this.facetExtractors.addCallback(facetExtractors)
        }
        if (facetPreprocessors !== undefined) {
            this.facetPreprocessors.addCallback(facetPreprocessors)
        }
        if (defaultTranslateTitles !== undefined) {
            this.translation.defaultTranslateTitles = defaultTranslateTitles
        }
        if (defaultTranslateValues !== undefined) {
            this.translation.defaultTranslateValues = defaultTranslateValues
        }
        if (translateTitles !== undefined) {
            this.translation.translateTitles = { ...this.translation.translateTitles, ...translateTitles }
        }
        if (translateValues !== undefined) {
            this.translation.translateValues = { ...this.translation.translateValues, ...translateValues }
        }
    }
}

class ConfigModule {
    // api URL, must NOT end with '/'
    apiURL = null

    defaultPageSize = 10

    i18n = (x) => x

    defaultFacetOptions = new FacetOptions({})

    /*
     * @type {Object<string, FacetOptions>}
     */
    facetOptions = {}

    /*
     * @type {Object<string, CallbackList>}
     */
    recordPreprocessors = {}

    defaultRecordPreprocessors = new CallbackList()

    /*
     * @type {Object<string, CallbackList>}
     */
    listRecordPreprocessors = {}

    defaultListRecordPreprocessors = new CallbackList()


    get collectionsURL () {
        return `${this.apiURL}/1.0/oarepo/collections`
    }

    collectionURL (collectionId) {
        return `${this.apiURL}/${collectionId}`
    }

    recordURL (collectionId, persistentId) {
        return `${this.apiURL}/${collectionId}/${persistentId}`
    }
}

export {
    ConfigModule,
    CallbackList,
    NOT_A_FACET,
    TranslationOptions,
    FacetOptions,
    convertToCallbackList,
    convertDictToCallbackList
}
