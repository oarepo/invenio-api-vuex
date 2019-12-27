# @oarepo/invenio-api-vuex

A set of vuex store modules and route utils to work with Invenio 3
REST API.

<p align="center">
    <a href="https://travis-ci.org/oarepo/invenio-api-vuex" target="_blank">
        <img src="https://img.shields.io/travis/oarepo/invenio-api-vuex"
            alt="travis build stat"></a>
    <a href="https://www.npmjs.com/package/@oarepo/invenio-api-vuex" target="_blank">
        <img src="https://img.shields.io/npm/v/@oarepo/invenio-api-vuex"
            alt="npm version"></a>
</p>


1. [Installation](#installation)
2. [Using it together with vuex preloader](#preloader)
3. [Store modules](#modules)
    1. [Collections module](#collections-module)
    2. [Collection module](#collection)
    3. [Record module](#record)
4. [Configuration](#configuration)
    1. [Facet processing](#facet-processing)
5. [Mixins](#mixins)


## Installation
```
yarn add @oarepo/invenio-api-vuex
```

```javascript

import Vue from 'vue'
import InvenioAPI from '@oarepo/invenio-api-vuex' 

Vue.use(Vuex)

const store = new Vuex.Store({})

Vue.use(InvenioAPI, {
    store,
    apiURL: '/api'
})
```

## Using it together with vuex preloader <a name="preloader"></a>

```
yarn add @oarepo/vuex-preloader
```


To use the library together with url preloader (recommended way),
add the following configuration to your routes:


```javascript
import { routerCollection, routerItem } from '@oarepo/invenio-api-vuex' 

routes = [
    routerCollection({
        name: 'collection',
        path: ':collectionId',
        component: MyCollectionComponent,
    }),
    routerItem({
        name: 'collection',
        path: ':collectionId/:itemId',
        component: MyItemComponent,
    }),
]
``` 

## Store modules <a name="modules"></a>

Store modules are implemented with ``vuex-class-modules``.

### Collections module <a name="collections-module"></a>

Use this store module only if ``invenio-oarepo-ui`` is installed on the backend.
This module returns a list of contained data models/collections together 
with extra information about the collections, such as:
* name
* description
* urls and identifiers
* validation rules (serialized marshmallow, WIP)
* json schema (WIP)

This module is registered under the name 'oarepoCollectionList' and is
not loaded automatically unless registered in the router.

```javascript
import { routerCollectionList } from '@oarepo/invenio-api-vuex' 

routes = [
    routerCollectionList({
        name: 'root',
        path: '/',
        component: MyApp,
        children: [...]
    })
]
``` 

To skip automatic loading and load it manually when needed, 
invoke ``oarepoCollectionList/load`` action on the store.

#### Usage in components

```javascript

// plain old js vuex
{
    computed: {
        ...mapState({
            collections: state => state.oarepoCollectionList.collections
        })
    }
    methods: {
        ...mapActions([
              'oarepoCollectionList.reload',
        ])
        reload () {
            this['oarepoCollectionList.reload']()    
        }
    }
}

// with with vuex-class-modules and vue-class-component
@Component({})
class MyComponent extends Vue {
    get collections() {
        return this.$oarepo.collections.collections 
    }
    reload() {
        return this.$oarepo.collections.reload() 
    }
}
```

Template:
```html
<list>
    <ul v-for="collection in collections" :key="collection.code">
        <p>{{ collection.title['en-us'] }}</p>
        <p>{{ collection.description['en-us'] }}</p>
    </ul>
</list>
```

See https://github.com/oarepo/invenio-oarepo-ui module for data structure details.

#### State/Getters

##### ``state``

One of ``State.INVALID``, ``State.LOADING``, ``State.LOADED``

##### ``collections``

An array of descriptions of collections received from the server 

##### ``visibleCollections``

An array of descriptions of collections received from the server
that are not marked as hidden 

#### Actions

##### ``load``, ``reload``

Fetches the list of collections from the server

### Collection module <a name="collection"></a>

Collection module is responsible for loading a single collection of
records (listing of records) and creating a new record. The module
is mapped at ``oarepoCollection``

#### Usage

```javascript

// plain old js vuex
{
    computed: {
        ...mapState({
            records: state => state.oarepoCollection.records,
            facets: state => state.oarepoCollection.facets,
        })
    }
    methods: {
        ...mapActions([
              'oarepoCollection.load',
        ])
        load (collectionId) {
            this['oarepoCollection.load']({collectionId})    
        }
    }
}

// with with vuex-class-modules and vue-class-component
@Component({})
class MyComponent extends Vue {
    get items() {
        return this.$oarepo.collection.items 
    }
    get facets() {
        return this.$oarepo.collection.facets 
    }
    load(collectionId) {
        return this.$oarepo.collection.load({collectionId}) 
    }
}
```

#### State/Getters

##### ``state``

One of ``State.INVALID``, ``State.LOADING``, ``State.LOADED``

##### ``collectionId``

ID of the currently loaded collection

##### ``records``

A list of loaded records as returned from the elasticsearch. Each record looks like:

```json
{
  "created":"2019-12-01T23:48:10.851166+00:00",
  "id":"32861b6d-1655-4c61-9914-80c5f9a19838",
  "links":{
    "self":"https://restaurovani.vscht.cz/api/drafts/restorations/objects/32861b6d-1655-4c61-9914-80c5f9a19838"
  },
  "metadata":{
    "$schema":"https://restaurovani.vscht.cz/schemas/draft/krokd/restoration-object-v1.0.0.json",
  },
  "revision":31,
  "updated":"2019-12-12T12:38:25.138961+00:00"
}
```

##### ``facets``

A list of loaded facets. Each facet looks like:

```javascript
{
    "element": {},    // original facet element
    "facets": [       // transformed and translated values
        {
            "count": 73,
            "label": "textil",
            "value": "textil"
        },
        {
            "count": 11,
            "label": "sklo",
            "value": "sklo"
        },
        {
            "count": 92,
            "label": "kovy",
            "value": "kovy"
        },
        {
            "count": 18,
            "label": "keramika",
            "value": "keramika"
        }
    ],
    "label": "category",    // translated label
    "code": "category",
    // type of the facet, will always be 'buckets' unless custom aggregation extractor is provided
    "type": "buckets"       
}
```

See [Configuration](#configuration) section of this readme for details how to configure
extractors and translators.


##### ``totalPages``

Total pages available

##### ``response``

The last axios response without any modifications

##### ``queryParams``

Query params (after ?) passed to the API call

##### ``reloadNeeded``

This state parameter works together with vuex-preloader. Set it to true to force
reloading of the state on the next route change
 
#### Actions

##### ``load({query, collectionId})``

Fetches ``apiURL/${collectionId}?{query}``
    
##### ``reload``

Reloads the state

##### ``transform``

Transforms the remembered response and refills ``facets`` and ``records``. This action
is useful for example when locale is changed to translate facets to the new locale.

##### ``create({metadata, storeModule})``

Calls HTTP post on collection url to create a new record. Returns the created item.
If storeModule is specified, the loaded record is fed to the storeModule (instance 
of RecordModule type). Returns json of the created record.

This call sets the ``reloadNeeded`` state so that the store is reloaded on the next 
route change when vuex-preloader is used (in case the created record falls into 
the current page).

### RecordModule <a name="record"></a>

Record module is responsible for loading, updating, deleting a single record. 
The module is mapped at ``oarepoRecord``

#### Usage

```javascript

// plain old js vuex
{
    computed: {
        ...mapState({
            metadata: state => state.oarepoRecord.metadata,
            links: state => state.oarepoRecord.links,
            created: state => state.oarepoRecord.created,
            updated: state => state.oarepoRecord.updated,
            // original response.data
            record: state => state.oarepoRecord.record,
        })
    }
    methods: {
        ...mapActions([
              'oarepoRecord.load',
        ])
        load (collectionId, recordId) {
            this['oarepoCollection.load']({collectionId, recordId})    
        }
    }
}

// with with vuex-class-modules and vue-class-component
@Component({})
class MyComponent extends Vue {
    get metadata() {
        return this.$oarepo.record.metadata 
    }
    load(collectionId, recordId) {
        return this.$oarepo.record.load({collectionId, recordId}) 
    }
}
```

#### State/Getters

##### ``state``

One of ``State.INVALID``, ``State.LOADING``, ``State.LOADED``

##### ``collectionId``

ID of the currently loaded collection

##### ``recordId``

ID of the currently loaded record

##### ``metadata``

The ``metadata`` section of the response

##### ``links``

The ``links`` section of the response

##### ``created``

Created timestamp

##### ``updated``

Updated timestamp

##### ``record``

Raw, unparsed record

#### Actions

##### ``load({collectionId, recordId})``

Loads the record and returns it

##### ``reload``

Reloads the last loaded record

##### ``patch(json)``

Issues patch command on the repository. ``json`` is a ``json-patch`` payload

##### ``save``

Saves (via HTTP POST) the current record and persists any modifications

## Configuration

```javascript
import InvenioAPI from '@oarepo/invenio-api-vuex'

Vue.use(InvenioAPI, {
    store,
    apiURL: '/api',
    defaultPageSize: 10,
    i18n (x) { return x },
    defaultFacetOptions: new FacetOptions({}),
    facetOptions: {},

    defaultRecordPreprocessors: new CallbackList(),
    recordPreprocessors: {},

    collectionListMixins: [],
    collectionMixins: [],
    recordMixins: [],
})
```

### Config Parameters

#### ``defaultPageSize``

Page size to use when no ?size is given

#### ``i18n``

A function taking a string (key) and converting it to translated msg

#### ``defaultFacetOptions``, ``facetOptions``

Facet options to be used for facet extraction and processing. For a collection
with id ``collectionId`` ``facetOptions[collectionId]`` are tried and if undefined
``defaultFacetOptions`` are used.

#### ``defaultRecordPreprocessors``, ``recordPreprocessors``

Preprocessors called when a record is fetched from repository. For a collection
with id ``collectionId`` ``recordPreprocessors[collectionId]`` are tried and if undefined
``defaultRecordPreprocessors`` are used.

Preprocessor is a function with a signature ``preprocess(response.data, { record: RecordModule })``


### Facet processing

Facet processing takes place in two phases. 
During the first phase, for each node of ``aggregations`` tree a facet extractor 
is called to extract facets.

During the second phase all the facets might be modified by facet preprocessors,
for example to add human-readable labels to facet values.

The configuration of this process is contained in ``FacetOptions`` class.

#### FacetOptions

A class containing options for handling collection facets:

```javascript
class FacetOptions {
    /*
     * A list of facet extractors. See below for details
     */
    facetExtractors = new CallbackList(bucketExtractor)

    /*
     * A list of facet preprocessors. See below for details
     */
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
    
    /*
     * Sets props above. If parent is not null, it is an instance of FacetOptions and its props
     * are taken as default.
     */
    constructor ({
                     parent,
                     facetExtractors, facetPreprocessors,
                     defaultTranslateTitles, defaultTranslateValues,
                     translateTitles, translateValues
                 }) {}
}
```

#### Extractors

The extractor decides if the node represents a facet or not and returns its representation.
It is a function with signature ``extractor({ node, path })``, ``node`` being the current
node in the json tree and path a reversed array of ``{code, element}`` (root comes last), 
where ``code`` is the key under which the ``element`` is stored.

If the extractor decides that the ``node`` represents facet, it returns it in the form of:

```javascript
return {
  type: "facet type",
  code: path[0].code,
  element: node,
  // any other elements, such as 
  facets: [
    {
        label: 'London',
        value: 'london',
        count: 30
    },
  ]
}
```    

If the extractor does not recognize the element as facet bearer, it returns ``undefined``.

The default implementation contains a bucketExtractor. To add yours, create new ``FacetOptions``:

```javascript
new FacetOptions({
    facetExtractors: [myFacetExtractor1, myFacetExtractor2]
})

// or

new FacetOptions({
    facetExtractors: myFacetExtractor
})
```

#### Facet preprocessors

Facet preprocessor is a function with signature 
``facetPreprocessor(facets, { facetOptions, i18n, collection })``. It should transform
the facets array (with items returned by the extractors) and return the transformed array.

The default implementation converts facet codes into labels as described below.

To add your own preprocessors, create an instance of FacetOptions with the preprocessors:

```javascript
new FacetOptions({
    facetPreprocessors: [myFacetPreprocessor1, myFacetPreprocessor2]
})

// or

new FacetOptions({
    facetPreprocessors: myFacetPreprocessor
})
```

#### Translation

This block configures the default ``facetTranslator``. Using ``config.i18n(key)``, 
the translator converts facet code and facet values into a human readable string. 

The description below will use the following facet as returned from facet extractor:

```javascript
facet = {
    type: "buckets",
    code: 'cities',
    element: {/*...*/},
    facets: [
        {
            value: 'london',
            count: 30
        },
    ]
}
```

Options:

##### ``defaultTranslateTitles, translateTitles``

``translateTitles[facet.code]`` specifies how facet titles will be obtained.
If it is not defined, ``defaultTranslateTitles`` setting will be used.
Default is ``TranslationOptions.TRANSLATE``.

It can be set to either TranslationOptions.NO_TRANSLATION, TranslationOptions.TRANSLATE
or an arbitrary string.

If set to TranslationOptions.NO_TRANSLATION, the translated facet will look like:

```javascript
facet = {
    label: 'cities',    // copied from code
    // all other options
}
```

TranslationOptions.TRANSLATE:
```javascript
facet = {
    label: i18n('cities'),
    // all other options
}
```

arbitrary string ('abc.'):
```javascript
facet = {
    label: i18n('abc.cities'),
    // all other options
}
```

##### ``defaultTranslateValues, translateValues``

Works similarly as titles, but for facet value labels.

``translateValues[facet.code]`` specifies how facet titles will be obtained.
If it is not defined, ``defaultTranslateValues`` setting will be used.
Default is ``TranslationOptions.NO_TRANSLATION``.

It can be set to either TranslationOptions.NO_TRANSLATION, 
TranslationOptions.TRANSLATE, TranslationOptions.FACET_CODE_PREFIX
or an arbitrary string.

If set to TranslationOptions.NO_TRANSLATION, the translated facet will look like:

```javascript
facet = {
    code: 'cities',
    facets: [
        {
            value: 'london',
            label: 'london',    // copied from value
            count: 30        
        }
    ],
    // rest of facet
}
```

TranslationOptions.TRANSLATE:
```javascript
facet = {
    code: 'cities',
    facets: [
        {
            value: 'london',
            label: i18n('london'),    // i18n of value
            count: 30        
        }
    ],
    // rest of facet
}
```

TranslationOptions.FACET_CODE_PREFIX:
```javascript
facet = {
    code: 'cities',
    facets: [
        {
            value: 'london',
            label: i18n('cities.london'),    // i18n of facet.code + '.' + value
            count: 30        
        }
    ],
    // rest of facet
}
```

arbitrary string ('abc.'):
```javascript
facet = {
    code: 'cities',
    facets: [
        {
            value: 'london',
            label: i18n('abc.london'),    // i18n of facet.code + '.' + value
            count: 30        
        }
    ],
    // rest of facet
}
```

## Mixins

The provided stores can be extended with custom mixin classes to add extra 
properties/mutations/actions. To do so, provide functions that return a new
mixin class inherited from the provided superclass. This pattern is described
at https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/

An example:

```javascript
import { Action, Mutation } from 'vuex-class-modules'

Vue.use(InvenioAPI, {
    store,
    apiURL: '/api',
    collectionListMixins: [
        (superclass) => class extends superclass {
            num = 1

            @Mutation
            setNumber(num) {
                this.num = num
            }

            @Action
            async numAction() {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        this.num = 3
                        resolve()
                    }, 10)
                })
            }        
        }
    ],
})
```

Now, ``num`` is defined as a getter on $oarepo.collectionList and mutations/actions
are added to the store module. 
