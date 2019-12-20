import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import { loaderAfterEach } from '../../../src/index'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        meta: {
            update: {
                store: 'collections',
                parameters: {},
                action: 'load'
            }
        },
        component: Home,
        children: [
            {
                path: '/about/:collectionId',
                meta: {
                    update: {
                        store: 'collection',
                        parameters: { collectionId: 'collectionId' }
                    }
                },
                name: 'about',
                component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
            }
        ]
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

router.afterEach(loaderAfterEach)

export default router
