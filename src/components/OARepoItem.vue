<template>
<div class="container" v-if="loaded">
    <template v-if="item && item.metadata">
    <slot v-bind:collection="collection" v-bind:item="item">
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
import { CollectionItemModule, CollectionModule } from '../store/collections_export';

export default @Component({
    props: {
        collectionCode: String,
        itemId: String,
        locale: String,
        isolated: Boolean,
    },
    components: {
        'oarepo-facet-list': OARepoFacetList,
    },
    name: 'oarepo-item',
})
class OARepoItem extends Vue {
    activeEditors = [];

    store = null;

    collectionStore = null;

    storeName = null;

    collectionStoreName = null;

    mounted() {
        if (this.isolated) {
            this.createIsolatedStore();
        } else {
            this.store = this.oarepo$.collectionItemModule;
        }
        this.reloadData();
    }

    createIsolatedStore() {
        this.storeName = `${this.collectionCode}${this.itemId}`;
        this.collectionStoreName = `collection-${this.collectionCode}${this.itemId}`;
        this.store = new CollectionItemModule({
            store: this.$store,
            name: this.storeName,
        });
        this.collectionStore = new CollectionModule({
            store: this.$store,
            name: this.collectionStoreName,
        });

        this.collectionStore.setCollectionListModule(this.oarepo$.collectionListModule);
        this.collectionStore.setCollectionDefinition(
            this.oarepo$.collectionListModule.collections.filter(x => x.code === this.collectionCode)[0],
        );
        this.store.setCollectionListModule(this.oarepo$.collectionListModule);
        this.store.setCollectionModule(this.collectionStore);
    }

    beforeDestroy() {
        if (this.isolated) {
            this.$store.unregisterModule(this.storeName);
            this.$store.unregisterModule(this.collectionStoreName);
        }
    }

    // getters
    get loaded() {
        return this.store && this.store.loaded;
    }

    get collection() {
        return this.store.collectionListModule.collections.find(
            value => value.code === this.collectionCode,
        );
    }

    get item() {
        return this.store.item;
    }

    @Emit('dataLoaded')
    reloadData() {
        return new Promise((resolve) => {
            this.store.collectionListModule.loadCollections().then(
                () => {
                    this.store.load({
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

    @Watch('locale')
    onLocaleChanged(locale) {
        this.store.collectionModule.changeLocale(locale);
    }

    @Watch('$route')
    onQueryChanged() {
        this.reloadData();
    }

    // modification operations
    async patch(data) {
        if (data === undefined) {
            // save all
            data = [];
            this.activeEditors.map(x => x.patchRepresentation()).filter(x => x !== undefined && x != null).forEach((x) => {
                data.push(...x);
            });
        }
        return this.store.patch(data);
    }

    registerEditor(editor) {
        this.activeEditors.push(editor);
    }

    unregisterEditor(editor) {
        this.activeEditors = this.activeEditors.filter(x => editor !== x);
    }
}
</script>

<style>
</style>
