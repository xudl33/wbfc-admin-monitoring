<template>
  <div>
    <div class="features-row">
      <h3 class="features-title">可用的(enabled)</h3>
      <el-table :data="beans.enabled" style="width: 100%" :show-header="false">
        <el-table-column type="expand">
          <template slot-scope="props">
            <pre class="features-value">{{ JSON.stringify(props.row, null, 1) }}</pre>
          </template>
        </el-table-column>
        <el-table-column>
        	<template slot-scope="props">
	            <span v-text="props.row.name" class="features-span-title"
	            />
	            <br>
	            <small
	              class="is-muted features-span-desc"
	              v-text="props.row.type"
	              :title="props.row.type"
	            />
	        </template>
        </el-table-column>
		<el-table-column width="150">
			<template slot-scope="props">
				<div class="features-version">
					<span v-if="props.row.version" v-text="props.row.version" class="tag"/>
					<span v-if="!props.row.version" v-text="'-'" />
				</div>
			</template>
		</el-table-column>
      </el-table>      
    </div>
    <div class="features-row">
      <h3 class="features-title">禁用的(disabled)</h3>
      <el-table :data="beans.disabled" style="width: 100%" :show-header="false">
        <el-table-column type="expand">
          <template slot-scope="props">
            <pre>{{ JSON.stringify(props.row, null, 1) }}</pre>
          </template>
        </el-table-column>
        <el-table-column>
        	<template slot-scope="props">
	            <span v-text="props.row.name" class="features-span-title"
	            />
	            <br>
	            <small
	              class="is-muted features-span-desc"
	              v-text="props.row.type"
	              :title="props.row.type"
	            />
	        </template>
        </el-table-column>
		<el-table-column width="150">
			<template slot-scope="props">
				<div class="features-version">
					<span v-if="props.row.version" v-text="props.row.version" class="tag"/>
					<span v-if="!props.row.version" v-text="'-'" />
				</div>
			</template>
		</el-table-column>
      </el-table>  
    </div>
  </div>
</template>
<script>
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
export default {
  props: {
    beans: {
      type: Object,
      default: () => {}
    }
  },
  data: () => ({
    showDetails: {}
  })
}
</script>
<style scoped>
.features-row {
  margin-bottom: 20px;
  padding-left: 20px;
}
.features-title {
  font-weight: bold;
}
.features-value {
    font-size: 15px;
    line-height: 1.2;
    white-space: pre-wrap;
    max-height: 300px;
    font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
}
.features-span-title {
	font-size: 16px;
}
.features-span-desc {
	font-size: 14px;
}
.features-version{
	text-align: center;
}
</style>
