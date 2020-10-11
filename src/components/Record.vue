<template>
  <div class="record">
    Record metadata (created {{ record.created }}, updated {{ record.updated }}):
    <pre>
{{ record.metadata }}
    </pre>
    Links:
    <pre>
{{ record.links }}
    </pre>
  </div>
</template>

<script>

export default {
  name: 'Record',
  props: {
    record: Object
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
