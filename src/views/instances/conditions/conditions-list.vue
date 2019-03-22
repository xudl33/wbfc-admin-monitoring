<!--
  - Copyright 2014-2018 the original author or authors.
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -     http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
  <div>
    <div class="condition-row">
      <h4 class="condition-title">积极匹配(PositiveMatches)</h4>
      <el-table :data="beans.positiveMatches" style="width: 100%" :show-header="false">
        <el-table-column type="expand">
          <template slot-scope="props">
            <pre class="condition-value">{{ JSON.stringify(props.row.value, null, 1) }}</pre>
          </template>
        </el-table-column>
        <el-table-column label="name" prop="name">
        </el-table-column>
      </el-table>      
    </div>
    <div class="condition-row">
      <h4 class="condition-title">消极匹配(NegativeMatches)</h4>
      <el-table :data="beans.negativeMatches" style="width: 100%" :show-header="false">
        <el-table-column type="expand">
          <template slot-scope="props">
            <pre>{{ JSON.stringify(props.row.value, null, 1) }}</pre>
          </template>
        </el-table-column>
        <el-table-column label="name" prop="name">
        </el-table-column>
      </el-table>  
    </div>
    <div class="condition-row">
      <h4 class="condition-title">排除(Exclusions)</h4>
      <el-table :data="beans.exclusions" style="width: 100%" :show-header="false">
        <el-table-column label="name" prop="name">
        </el-table-column>
      </el-table>  
    </div>
    <div class="condition-row">
      <h4 class="condition-title">无条件(UnconditionalClasses)</h4>
      <el-table :data="beans.unconditionalClasses" style="width: 100%" :show-header="false">
        <el-table-column label="name" prop="name">
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
<style>
.condition-row {
  margin-bottom: 20px;
  padding-left: 20px;
}
.condition-title {
  font-weight: bold;
}
.condition-value {
    font-size: 15px;
    line-height: 1.2;
    white-space: pre-wrap;
    max-height: 300px;
    font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
}
</style>
