<template>
  <div id="app">
    <!-- <router-view></router-view> -->
    <WbfcAdminMonitoring contextId='wbfc-admin-monitoring-id'/>
  </div>
</template>

<script>
import WbfcAdminMonitoring from './views/wbfc-admin-monitoring'
export default {
  name: 'App',
  components: {
  	WbfcAdminMonitoring
  }
}
</script>

<style>

</style>
