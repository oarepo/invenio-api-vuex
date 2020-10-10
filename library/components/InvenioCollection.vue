<template>
  <component :is="activeComponent" :loading="loading" :records="records"
             :pages="pages" :facets="facets" :filters="filters"></component>
</template>
<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    loadedComponent: {},
    loadingComponent: {},
    collectionId: String
  },
  computed: {
    ...mapState({
      loading: state => state.oarepoCollection.loading,
      pages: state => state.oarepoCollection.totalPages || 20
    }),
    ...mapGetters('oarepoCollection', [
      'records',
      'facets',
      'filters'
    ]),
    ...mapGetters('oarepoIndices', [
      'byEndpoint'
    ]),
    activeComponent () {
      if (this.loading && this.loadingComponent) {
        return this.loadingComponent
      } else {
        return this.loadedComponent
      }
    },
    query () {
      return this.$route.query
    }
  },
  data: function () {
    return {
      stop: null
    }
  },
  mounted () {
    this.$oarepo.collection.load({
      collectionId: this.collectionId,
      query: this.query
    })
  },
  watch: {
    query () {
      this.$oarepo.collection.load({
        collectionId: this.collectionId,
        query: this.$route.query
      })
    }
  }
}
</script>
