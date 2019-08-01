<template>
<div class="container" v-if="loaded">
    <template v-if="item && item.metadata">
    <slot  v-bind:collection="collection" v-bind:item="item">
        <router-view></router-view>
    </slot>
    </template>
</div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch, Emit } from 'vue-property-decorator';
import OARepoFacetList from './OARepoFacetList.vue';

export default @Component({
    props: {
        collectionCode: String,
        itemId: String,
        locale: String,
    },
    components: {
        'oarepo-facet-list': OARepoFacetList,
    },
    name: 'oarepo-item',
})
class OARepoItem extends Vue {
    // getters
    get loaded() {
        return this.oarepo$.collectionItemModule.loaded;
    }

    get collection() {
        return this.oarepo$.collectionItemModule.collectionListModule.collections.find(
            value => value.code === this.collectionCode,
        );
    }

    get item() {
        return this.oarepo$.collectionItemModule.item;
    }

    @Emit('dataLoaded')
    reloadData() {
        return new Promise((resolve) => {
            this.oarepo$.collectionItemModule.collectionListModule.loadCollections().then(
                () => {
                    this.oarepo$.collectionItemModule.load({
                        collectionDefinition: this.collection,
                        collectionCode: this.collectionCode,
                        itemId: this.itemId,
                    }).then(({ append }) => {
                        resolve({
                            append,
                        });
                    });
                },
            );
        });
    }

    mounted() {
        this.reloadData();
    }

    @Watch('locale')
    onLocaleChanged(locale) {
        this.oarepo$.collectionItemModule.collectionModule.changeLocale(locale);
    }

    @Watch('$route')
    onQueryChanged() {
        this.reloadData();
    }

    // modification operations
    async oarepoSubmitPatch(data) {
        return this.oarepo$.collectionItemModule.patch(data);
    }
}
</script>

<style>
</style>
