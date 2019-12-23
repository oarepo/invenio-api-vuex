import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import moxios from 'moxios'
import { ConfigModule, CollectionListModule } from '@oarepo/invenio-oarepo-ui-vue'
import { expect } from 'chai'

describe('CollectionListModule', () => {

    beforeEach(function () {
        // import and pass your custom axios instance to this method
        moxios.install()
    })

    afterEach(function () {
        // import and pass your custom axios instance to this method
        moxios.uninstall()
    })

    function makeStore () {
        const localVue = createLocalVue()
        localVue.use(Vuex)
        const store = new Vuex.Store({})
        const api = new ConfigModule({
            store,
            name: 'oarepo-api'
        })
        const collections = new CollectionListModule(
            api,
            {
                store,
                name: 'oarepo-collections'
            }
        )
        api.apiURL = '/api'
        return {
            localVue,
            store,
            api,
            collections
        }
    }

    it('Collection store exists', async () => {
        const { collections } = makeStore()
        expect(collections.loaded).to.equal(false)
        expect(collections.collections).to.eql([])
    })

    it('Collection list loading', async () => {
        const { collections } = makeStore()
        let expectedCollections = [{
            'code': 'restorations',
            'description': {
                'cs-cz': '\n                Datab\u00e1ze um\u011blecko\u0159emesln\u00fdch p\u0159edm\u011bt\u016f, kter\u00e9 byly konzervov\u00e1ny \u010di restaurov\u00e1ny v r\u00e1mci \u0159e\u0161en\u00ed\n                semestr\u00e1ln\u00edch a bakal\u00e1\u0159sk\u00fdch prac\u00ed studenty obor\u016f Konzervov\u00e1n\u00ed a restaurov\u00e1n\u00ed um\u011blecko\u0159emesln\u00fdch\n                d\u011bl ze skla a keramiky, z kov\u016f a z textiln\u00edch materi\u00e1l\u016f.\n                ',
                'en-us': '\n                Database of art & craftwork restoration projects that were done as a part of Bachelor theses and\n                Semestral projects by the students of the Conservation & Restoration of Art and Craftwork from Glass\n                and Ceramic, from Metal and Textile materials study programmes.\n                '
            },
            'facet_filters': ['creator', 'category', 'archeologic', 'title', 'keywords', 'creationPeriod', 'restorationRequestor.title.value.keyword', 'stylePeriod.title.value.keyword', 'itemType.title.value.keyword', 'works.metadata.restorationPeriod.until', 'parts.materialType.title.value.keyword', 'parts.fabricationTechnology.title.value.keyword', 'parts.color.title.value.keyword', 'parts.restorationMethods.title.value.keyword'],
            'rest': '/api/drafts/restorations/objects/',
            'title': { 'cs-cz': 'Restaurovan\u00e9 p\u0159edm\u011bty', 'en-us': 'Item Restorations' }
        }, {
            'code': 'works',
            'description': {
                'cs-cz': '\n                Model restaur\u00e1torsk\u00fdch z\u00e1sah\u016f\n                ',
                'en-us': '\n                Database of restoration works.\n                '
            },
            'facet_filters': [],
            'rest': '/api/drafts/restorations/works/',
            'title': { 'cs-cz': 'Restaur\u00e1torsk\u00e9 z\u00e1sahy', 'en-us': 'Restoration works' }
        }]
        moxios.stubRequest('/api/1.0/oarepo/collections', {
            status: 200,
            responseText: JSON.stringify(
                expectedCollections
            ),
            contentType: 'application/json'
        })

        await collections.load()
        expect(collections.collections).to.be.an('array')
        expect(collections.collections).to.have.length(2)
        expect(collections.collections).to.eql(expectedCollections)
        expect(collections.loaded).to.equal(true)
    })

    it('Collections list reloading', async () => {
        const { collections } = makeStore()
        const expectedCollections = [
            {
                'code': 'restorations'
            }
        ]
        moxios.stubOnce('GET', '/api/1.0/oarepo/collections', {
            status: 200,
            responseText: JSON.stringify(
                expectedCollections
            ),
            contentType: 'application/json'
        })

        await collections.load()
        expect(collections.collections).to.eql(expectedCollections)

        const newExpectedCollections = [
            {
                'code': 'restorations - new'
            }
        ]
        moxios.stubs.reset()
        moxios.stubOnce('GET', '/api/1.0/oarepo/collections', {
            status: 200,
            responseText: JSON.stringify(
                newExpectedCollections
            ),
            contentType: 'application/json'
        })

        await collections.load()
        expect(collections.collections).to.eql(newExpectedCollections)

    })
})
