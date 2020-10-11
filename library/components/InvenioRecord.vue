<template>
  <component :is="activeComponent" :loading="loading" :record="record"></component>
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
  mounted () {
    this.reload()
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
    reload () {
      this.$oarepo.record.load({
        collectionId: this.collectionId,
        recordId: this.$route.params.recordId
      })
    }
  }
}
</script>
