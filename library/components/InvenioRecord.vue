<template>
  <component :is="activeComponent" :loading="loading || startupLoading" :record="record"></component>
</template>
<script>
import { mapState } from 'vuex'

export default {
  props: {
    loadedComponent: {},
    loadingComponent: {},
    collectionId: String,
    recordId: String
  },
  computed: {
    ...mapState({
      loading: state => state.oarepoRecord.loading,
      record: state => state.oarepoRecord.record
    }),
    activeComponent () {
      if (this.loading && this.loadingComponent) {
        return this.loadingComponent
      } else {
        return this.loadedComponent
      }
    }
  },
  data: function() {
    return {
      startupLoading: true
    }
  },
  async beforeMount () {
    await this.$oarepo.indices.ensureLoaded()
    await this.reload()
    this.startupLoading = false
  },
  watch: {
    collectionId () {
      this.reload()
    },
    recordId () {
      this.reload()
    }
  },
  methods: {
    async reload () {
      return this.$oarepo.record.load({
        collectionId: this.collectionId,
        recordId: this.$route.params.recordId
      })
    }
  }
}
</script>
