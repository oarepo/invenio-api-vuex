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

function convertToCallbackList (x) {
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

function convertDictToCallbackList (obj) {
    if (obj === null || obj === undefined) {
        return {}
    }
    return Object.fromEntries(Object.entries(obj).map(x => [x[0], convertToCallbackList(x[1])]))
}

class ConfigModule {
    // api URL, must NOT end with '/'
    apiURL = null

    defaultPageSize = 10

    i18n = (x) => x

    defaultFacetPreprocessors = new CallbackList()

    /*
     * @type {Object<string, CallbackList>}
     */
    facetPreprocessors = {}

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

    usePost = false

    language = 'en'

    facetMode = null

    get indicesURL () {
        return `${this.apiURL}/oarepo/indices/`
    }
}

export {
    ConfigModule,
    CallbackList,
    convertToCallbackList,
    convertDictToCallbackList
}
