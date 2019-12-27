import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import moxios from 'moxios'
import { ConfigModule, CollectionModule, TranslationOptions } from '@oarepo/invenio-api-vuex'
import { expect } from 'chai'
import { FacetOptions } from '../../library/store/config'
import { RecordModule } from '../../library/store/record'

describe('CollectionModule', () => {

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
        api.defaultFacetOptions = new FacetOptions({
            translateValues: {
                'archeologic': TranslationOptions.TRANSLATE
            }
        })
        api.i18n = (key) => {
            return {
                'true': 'ano',
                'false': 'ne'
            }[key] || key
        }

        const collection = new CollectionModule(
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
            collection
        }
    }

    it('Collection module exists', async () => {
        const { collection } = makeStore()
        expect(collection.loaded).to.equal(false)
        expect(collection.facets).to.eql([])
        expect(collection.records).to.eql([])
    })

    it('Collection facets loading', async () => {
        const { collection } = makeStore()
        let expectedResponse = {
            aggregations: {
                archeologic: {
                    buckets: [
                        {
                            doc_count: 33,
                            key: 1,
                            key_as_string: 'true'
                        },
                        {
                            doc_count: 161,
                            key: 0,
                            key_as_string: 'false'
                        }
                    ],
                    doc_count_error_upper_bound: 0,
                    sum_other_doc_count: 0
                },
                category: {
                    buckets: [
                        {
                            doc_count: 73,
                            key: 'textil'
                        },
                        {
                            doc_count: 11,
                            key: 'sklo'
                        },
                        {
                            doc_count: 92,
                            key: 'kovy'
                        },
                        {
                            doc_count: 18,
                            key: 'keramika'
                        }
                    ],
                    doc_count_error_upper_bound: 0,
                    sum_other_doc_count: 0
                }
            },
            hits: {
                hits: [],
                total: 0
            },
            links: {
                next: 'https://localhost/api/records/?page=2&sort=alphabet&size=1',
                self: 'https://localhost/api/records/?page=1&sort=alphabet&size=1'
            }
        }
        moxios.stubRequest('/api/records', {
            status: 200,
            responseText: JSON.stringify(
                expectedResponse
            ),
            contentType: 'application/json'
        })

        await collection.load({ query: {}, collectionId: 'records' })
        expect(collection.loaded).to.equal(true)
        expect(collection.records).to.be.an('array')
        expect(collection.records).to.have.length(0)
        expect(collection.facets).to.eql([
                {
                    'element': {
                        'buckets': [
                            {
                                'doc_count': 33,
                                'key': 1,
                                'key_as_string': 'true'
                            },
                            {
                                'doc_count': 161,
                                'key': 0,
                                'key_as_string': 'false'
                            }
                        ],
                        'doc_count_error_upper_bound': 0,
                        'sum_other_doc_count': 0
                    },
                    'facets': [
                        {
                            'count': 33,
                            'label': 'ano',
                            'value': 1
                        },
                        {
                            'count': 161,
                            'label': 'ne',
                            'value': 0
                        }
                    ],
                    'label': 'archeologic',
                    'code': 'archeologic',
                    'type': 'buckets'
                },
                {
                    'element': {
                        'buckets': [
                            {
                                'doc_count': 73,
                                'key': 'textil'
                            },
                            {
                                'doc_count': 11,
                                'key': 'sklo'
                            },
                            {
                                'doc_count': 92,
                                'key': 'kovy'
                            },
                            {
                                'doc_count': 18,
                                'key': 'keramika'
                            }
                        ],
                        'doc_count_error_upper_bound': 0,
                        'sum_other_doc_count': 0
                    },
                    'facets': [
                        {
                            'count': 73,
                            'label': 'textil',
                            'value': 'textil'
                        },
                        {
                            'count': 11,
                            'label': 'sklo',
                            'value': 'sklo'
                        },
                        {
                            'count': 92,
                            'label': 'kovy',
                            'value': 'kovy'
                        },
                        {
                            'count': 18,
                            'label': 'keramika',
                            'value': 'keramika'
                        }
                    ],
                    'label': 'category',
                    'code': 'category',
                    'type': 'buckets'
                }
            ]
        )
    })


    it('Collection records loading', async () => {
        const { collection } = makeStore()
        let expectedResponse = {
            aggregations: {},
            hits: {
                hits: [
                    {
                        'created': '2019-12-01T23:48:10.851166+00:00',
                        'id': '32861b6d-1655-4c61-9914-80c5f9a19838',
                        'links': {
                            'attachments': 'https://restaurovani.vscht.cz/api/drafts/restorations/objects/32861b6d-1655-4c61-9914-80c5f9a19838/attachments',
                            'self': 'https://restaurovani.vscht.cz/api/drafts/restorations/objects/32861b6d-1655-4c61-9914-80c5f9a19838',
                            'works': 'https://restaurovani.vscht.cz/api/drafts/restorations/objects/32861b6d-1655-4c61-9914-80c5f9a19838/works'
                        },
                        'metadata': {
                            '$schema': 'https://restaurovani.vscht.cz/schemas/draft/krokd/restoration-object-v1.0.0.json',
                            '_bucket': '5c1bd15b-9a2b-4804-afc7-52f039ea3c15',
                            'archeologic': false,
                            'category': 'sklo',
                            'created': '2019-12-02',
                            'creationPeriod': { 'since': 1, 'until': 200 },
                            'creator': 'rychnovl@vscht.cz',
                            'description': [{
                                'lang': 'cs',
                                'value': 'Rytá číška pochází z Lannovy sbírky antického skla. Jde o jednodílnou nálevkovitou nádobu s nevýrazným oblým profilem, konickým tělem, rovnou podstavou se zaoblenou hranou a plynule nasazeným rovným dnem. Číška má kruhové ústí s\njednoduchým oblým okrajem a její povrch je dekorován ve třech úrovních vícenásobnými\nmělkými rýhami sdruženými v pásech širokých 2 - 3 m.  '
                            }],
                            'dimensions': [{
                                'dimension': {
                                    'id': 107,
                                    'level': 1,
                                    'links': {
                                        'parent': 'https://restaurovani.vscht.cz/api/taxonomies/dimension/',
                                        'parent_tree': 'https://restaurovani.vscht.cz/api/taxonomies/dimension/?drilldown=True',
                                        'self': 'https://restaurovani.vscht.cz/api/taxonomies/dimension/vyska/',
                                        'tree': 'https://restaurovani.vscht.cz/api/taxonomies/dimension/vyska/?drilldown=True'
                                    },
                                    'path': '/vyska',
                                    'slug': 'vyska',
                                    'title': [{ 'lang': 'cs', 'value': 'výška' }],
                                    'tooltip': ''
                                }, 'unit': 'mm', 'value': 96
                            }],
                            'id': '32861b6d-1655-4c61-9914-80c5f9a19838',
                            'identifier': '32861b6d-1655-4c61-9914-80c5f9a19838',
                            'itemType': [{
                                'ancestors': [{ 'level': 1, 'slug': 'sklo' }],
                                'id': 19,
                                'level': 2,
                                'links': {
                                    'parent': 'https://restaurovani.vscht.cz/api/taxonomies/item-type/sklo/',
                                    'parent_tree': 'https://restaurovani.vscht.cz/api/taxonomies/item-type/sklo/?drilldown=True',
                                    'self': 'https://restaurovani.vscht.cz/api/taxonomies/item-type/sklo/sklo-ke-stolovani/',
                                    'tree': 'https://restaurovani.vscht.cz/api/taxonomies/item-type/sklo/sklo-ke-stolovani/?drilldown=True'
                                },
                                'path': '/sklo/sklo-ke-stolovani',
                                'slug': 'sklo-ke-stolovani',
                                'title': [{ 'lang': 'cs', 'value': 'sklo ke stolování' }],
                                'tooltip': 'zahrnuje sklo nápojové, servírovací i užitkové. Těmto kategoriím typově odpovídá např. pohár, číše, korbel, šálek, miska, talíř, džbán, konvice, kutrolf apod.'
                            }],
                            'keywords': ['Lannova sbírka ', 'Vojtěch Lanna ml.', 'antické sklo', 'římské sklo'],
                            'modified': '2019-12-12',
                            'parts': [{
                                'color': [{
                                    'ancestors': [{ 'level': 1, 'slug': 'sklo' }, {
                                        'level': 2,
                                        'slug': 'cire'
                                    }],
                                    'id': 113,
                                    'level': 3,
                                    'links': {
                                        'parent': 'https://restaurovani.vscht.cz/api/taxonomies/color/sklo/cire/',
                                        'parent_tree': 'https://restaurovani.vscht.cz/api/taxonomies/color/sklo/cire/?drilldown=True',
                                        'self': 'https://restaurovani.vscht.cz/api/taxonomies/color/sklo/cire/bezbarve/',
                                        'tree': 'https://restaurovani.vscht.cz/api/taxonomies/color/sklo/cire/bezbarve/?drilldown=True'
                                    },
                                    'path': '/sklo/cire/bezbarve',
                                    'slug': 'bezbarve',
                                    'title': [{ 'lang': 'cs', 'value': 'bezbarvé sklo' }],
                                    'tooltip': ''
                                }],
                                'fabricationTechnology': [{
                                    'ancestors': [{ 'level': 1, 'slug': 'sklo' }, {
                                        'level': 2,
                                        'slug': 'dekorativni-techniky-skla'
                                    }],
                                    'id': 339,
                                    'level': 3,
                                    'links': {
                                        'parent': 'https://restaurovani.vscht.cz/api/taxonomies/fabrication-technology/sklo/dekorativni-techniky-skla/',
                                        'parent_tree': 'https://restaurovani.vscht.cz/api/taxonomies/fabrication-technology/sklo/dekorativni-techniky-skla/?drilldown=True',
                                        'self': 'https://restaurovani.vscht.cz/api/taxonomies/fabrication-technology/sklo/dekorativni-techniky-skla/ryte/',
                                        'tree': 'https://restaurovani.vscht.cz/api/taxonomies/fabrication-technology/sklo/dekorativni-techniky-skla/ryte/?drilldown=True'
                                    },
                                    'path': '/sklo/dekorativni-techniky-skla/ryte',
                                    'slug': 'ryte',
                                    'title': [{ 'lang': 'cs', 'value': 'ryté sklo' }],
                                    'tooltip': ''
                                }, {
                                    'ancestors': [{ 'level': 1, 'slug': 'sklo' }, {
                                        'level': 2,
                                        'slug': 'technologie-vyroby-skla'
                                    }],
                                    'id': 331,
                                    'level': 3,
                                    'links': {
                                        'parent': 'https://restaurovani.vscht.cz/api/taxonomies/fabrication-technology/sklo/technologie-vyroby-skla/',
                                        'parent_tree': 'https://restaurovani.vscht.cz/api/taxonomies/fabrication-technology/sklo/technologie-vyroby-skla/?drilldown=True',
                                        'self': 'https://restaurovani.vscht.cz/api/taxonomies/fabrication-technology/sklo/technologie-vyroby-skla/foukane/',
                                        'tree': 'https://restaurovani.vscht.cz/api/taxonomies/fabrication-technology/sklo/technologie-vyroby-skla/foukane/?drilldown=True'
                                    },
                                    'path': '/sklo/technologie-vyroby-skla/foukane',
                                    'slug': 'foukane',
                                    'title': [{ 'lang': 'cs', 'value': 'foukané sklo' }],
                                    'tooltip': 'z volné ruky i do formy'
                                }],
                                'main': true,
                                'materialType': {
                                    'ancestors': [{ 'level': 1, 'slug': 'sklo' }],
                                    'id': 74,
                                    'level': 2,
                                    'links': {
                                        'parent': 'https://restaurovani.vscht.cz/api/taxonomies/material-type/sklo/',
                                        'parent_tree': 'https://restaurovani.vscht.cz/api/taxonomies/material-type/sklo/?drilldown=True',
                                        'self': 'https://restaurovani.vscht.cz/api/taxonomies/material-type/sklo/sodno-vapenate/',
                                        'tree': 'https://restaurovani.vscht.cz/api/taxonomies/material-type/sklo/sodno-vapenate/?drilldown=True'
                                    },
                                    'path': '/sklo/sodno-vapenate',
                                    'slug': 'sodno-vapenate',
                                    'title': [{ 'lang': 'cs', 'value': 'sodno-vápenaté sklo' }],
                                    'tooltip': 'natronové sklo nebo sodno-popelové sklo; Benátské sklo (dělení dle Verità): common glass, vitrum blanchum, cristallo; sklo v benátské stylo: façon de Venice'
                                },
                                'name': [{ 'lang': 'cs', 'value': '__base__' }]
                            }],
                            'public': false,
                            'restorationRequestor': {
                                'address': '',
                                'contact': '',
                                'id': 491,
                                'level': 1,
                                'links': {
                                    'parent': 'https://restaurovani.vscht.cz/api/taxonomies/requestors/',
                                    'parent_tree': 'https://restaurovani.vscht.cz/api/taxonomies/requestors/?drilldown=True',
                                    'self': 'https://restaurovani.vscht.cz/api/taxonomies/requestors/umeleckoprumyslove-muzeum-v-praze/',
                                    'tree': 'https://restaurovani.vscht.cz/api/taxonomies/requestors/umeleckoprumyslove-muzeum-v-praze/?drilldown=True'
                                },
                                'path': '/umeleckoprumyslove-muzeum-v-praze',
                                'slug': 'umeleckoprumyslove-muzeum-v-praze',
                                'title': [{ 'lang': 'cs', 'value': 'Uměleckoprůmyslové muzeum v Praze' }],
                                'tooltip': ''
                            },
                            'stylePeriod': {
                                'descendants_count': 4,
                                'endYear': 476,
                                'id': 186,
                                'level': 2,
                                'links': {
                                    'self': 'https://restaurovani.vscht.cz/api/taxonomies/period/antika/rimska-antika/',
                                    'tree': 'https://restaurovani.vscht.cz/api/taxonomies/period/antika/rimska-antika/?drilldown=True'
                                },
                                'path': '/antika/rimska-antika',
                                'slug': 'rimska-antika',
                                'startYear': -753,
                                'title': [{ 'lang': 'cs', 'value': 'římská antika' }],
                                'tooltip': ''
                            },
                            'thumbnail': {
                                'bucket': '5c1bd15b-9a2b-4804-afc7-52f039ea3c15',
                                'caption': 'Číška po restaurování, kontrastní podklad',
                                'checksum': 'md5:f2f4da4fc5eff3a78161ece71002d0ff',
                                'featured_image': true,
                                'file_id': '8b91a7b6-1d3c-4d9f-bf8b-4bb3e7500259',
                                'generated-image': true,
                                'iiif': '/api/iiif/v2/5c1bd15b-9a2b-4804-afc7-52f039ea3c15:96644e15-8376-49e4-9f3f-cca1f91cfd57:sp5-balikova-anticke-sklo-42.jpg/',
                                'image_height': 591,
                                'image_width': 608,
                                'key': 'sp5-balikova-anticke-sklo-42.jpg',
                                'mime_type': 'image/jpeg',
                                'original_url': '/api/drafts/restorations/works/96e02d5f-8fd8-429f-b35d-4f9ddb68ab04/attachments/sp5-balikova-anticke-sklo-42.jpg',
                                'selected': true,
                                'size': 33695,
                                'version_id': '96644e15-8376-49e4-9f3f-cca1f91cfd57',
                                'work_bucket_id': 'ae745399-037a-4d0a-856e-d61370fe6fa5'
                            },
                            'title': [{ 'lang': 'cs', 'value': 'Antická rytá číška' }],
                            'works': [{
                                'created': '2019-12-01T23:48:12.782517+00:00',
                                'id': '96e02d5f-8fd8-429f-b35d-4f9ddb68ab04',
                                'links': {
                                    'attachments': 'https://restaurovani.vscht.cz/api/drafts/restorations/works/96e02d5f-8fd8-429f-b35d-4f9ddb68ab04/attachments',
                                    'publish': 'https://restaurovani.vscht.cz/api/drafts/restorations/works/96e02d5f-8fd8-429f-b35d-4f9ddb68ab04/publish',
                                    'self': 'https://restaurovani.vscht.cz/api/drafts/restorations/works/96e02d5f-8fd8-429f-b35d-4f9ddb68ab04'
                                },
                                'metadata': {
                                    '$schema': 'https://restaurovani.vscht.cz/schemas/draft/krokd/restoration-work-v1.0.0.json',
                                    '_bucket': 'ae745399-037a-4d0a-856e-d61370fe6fa5',
                                    '_restoration': '2ee7a65f-1ff9-4d15-b4d1-12ff9c1a0763',
                                    'abstract': [{
                                        'lang': 'cs',
                                        'value': 'Soubor předmětů, jehož součástí jje také rytá číška,\nbyl zdokumentován. Předměty byly očištěny, slepeny, nápisy tuší budou obnoveny\nv budoucnu. S výjimkou nepatrných úlomků (menší než 2 x 3 mm) byly\numístěny všechny fragmenty. Výztuž nebyla prováděna, stejně jako doplňování\npředmětů jinými materiály. K zrestaurovaným předmětům byly přiloženy i\nzrestaurované evidenční štítky, odebrané vzorky nánosů, nečistot.\nByla provedena rešerše, pokus o bližší zařazení předmětů. Stav předmětů je\nstabilizován, je možné je bezpečně uložit do depozitáře, popřípadě je vystavit\nza dodržení příslušných opatření.'
                                    }],
                                    'creator': 'Marta Balíková',
                                    'id': '96e02d5f-8fd8-429f-b35d-4f9ddb68ab04',
                                    'public': false,
                                    'restorationPeriod': { 'since': '2017-09-01', 'until': '2017-12-01' },
                                    'supervisor': [{
                                        'code': '10710',
                                        'comment': '',
                                        'institution': { 'name': 'Ústav skla a keramiky, VŠCHT Praha' },
                                        'name': 'Rohanová Dana, doc. Dr. Ing. '
                                    }, {
                                        'code': '60727',
                                        'comment': '',
                                        'institution': { 'name': 'Uměleckoprůmyslové museum' },
                                        'name': 'Brožková Zita, MgA. '
                                    }],
                                    'workType': {
                                        'id': 387,
                                        'level': 1,
                                        'links': {
                                            'parent': 'https://restaurovani.vscht.cz/api/taxonomies/work-type/',
                                            'parent_tree': 'https://restaurovani.vscht.cz/api/taxonomies/work-type/?drilldown=True',
                                            'self': 'https://restaurovani.vscht.cz/api/taxonomies/work-type/semestralni-projekt-5/',
                                            'tree': 'https://restaurovani.vscht.cz/api/taxonomies/work-type/semestralni-projekt-5/?drilldown=True'
                                        },
                                        'path': '/semestralni-projekt-5',
                                        'slug': 'semestralni-projekt-5',
                                        'title': [{ 'lang': 'cs', 'value': 'Semestrální práce 5' }],
                                        'tooltip': ''
                                    }
                                },
                                'revision': 9,
                                'updated': '2019-12-09T10:45:50.524443+00:00'
                            }]
                        },
                        'revision': 31,
                        'updated': '2019-12-12T12:38:25.138961+00:00'
                    }
                ],
                total: 1
            },
            links: {
                next: 'https://localhost/api/records/?page=2&sort=alphabet&size=1',
                self: 'https://localhost/api/records/?page=1&sort=alphabet&size=1'
            }
        }
        moxios.stubRequest('/api/records', {
            status: 200,
            responseText: JSON.stringify(
                expectedResponse
            ),
            contentType: 'application/json'
        })

        await collection.load({ query: {}, collectionId: 'records' })
        expect(collection.loaded).to.equal(true)
        expect(collection.records).to.be.an('array')
        expect(collection.records).to.have.length(1)
        expect(collection.records).to.eql(expectedResponse.hits.hits)
    })

    it('Create record', async () => {
        const { collection } = makeStore()
        collection.collectionId = 'records'
        const expectedResponse = {
            created: 'cr',
            updated: 'up',
            metadata: {
                title: 'aaa',
                id: 1,
            },
            links: {
                self: 'slf'
            }
        }
        moxios.stubOnce('POST', '/api/records', {
            status: 200,
            responseText: JSON.stringify(
                expectedResponse
            ),
            contentType: 'application/json'
        })
        const resp = await collection.create({ metadata: { title: 'aaa' } })
        expect(resp).to.eql(expectedResponse)
        const request = moxios.requests.mostRecent()
        expect(request.config.data).to.eql(JSON.stringify({title: 'aaa'}))
    })

    it('Create and store record', async () => {
        const { collection, store, api } = makeStore()
        const record = new RecordModule(
            api,
            {
                store,
                name: 'oarepo-record'
            }
        )

        collection.collectionId = 'records'
        const expectedResponse = {
            created: 'cr',
            updated: 'up',
            metadata: {
                title: 'aaa',
                id: 1
            },
            links: {
                self: 'slf'
            }
        }
        moxios.stubOnce('POST', '/api/records', {
            status: 200,
            responseText: JSON.stringify(
                expectedResponse
            ),
            contentType: 'application/json'
        })
        const resp = await collection.create({ metadata: { title: 'aaa' }, storeModule: record })
        expect(resp).to.eql(expectedResponse)
        expect(record.metadata).to.eql(expectedResponse.metadata)
        // expect(record.created).to.eql(expectedResponse.created)
        // expect(record.updated).to.eql(expectedResponse.updated)
        expect(record.links).to.eql(expectedResponse.links)
    })
})
