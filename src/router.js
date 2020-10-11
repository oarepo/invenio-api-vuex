import { collection, record } from '@oarepo/invenio-api-vuex'

import Collections from './components/Collections'
import Record from './components/Record'
import Collection from './components/Collection'

export default [
    {
        path: '/',
        redirect: '/collections'
    },
    {
        path: '/collections',
        component: Collections
    },
    record('/objects', 'restorations/all-objects', Record),
    collection('/objects', 'restorations/all-objects', Collection)
]
