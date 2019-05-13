<!--
  - Copyright 2014-2019 the original author or authors.
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
  <section class="section">
    <div v-if="error" class="message is-danger" >
      <div class="message-body">
        <strong>
          <font-awesome-icon
            class="has-text-danger"
            icon="exclamation-triangle"
          />
          Fetching InformationSchema.Processlist failed.
        </strong>
        <p v-text="error.message" />
      </div>
    </div>
    <div class="field-body">
      <div class="field">
        <p class="control is-expanded has-icons-left">
          <input class="input" type="search" v-model="filter" >
          <span class="icon is-small is-left">
            <font-awesome-icon icon="filter" />
          </span>
        </p>
      </div>
    </div>
    <div class="field-body">
      <div class="field has-addons has-icons-left">
        <el-table :data="filteredContexts" v-loading="isLoading">
          <el-table-column type="expand">
            <template slot-scope="props">
              <pre class="features-value">{{ JSON.stringify(props.row, null, 1) }}</pre>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="线程ID">        
          </el-table-column>
          <el-table-column prop="user" label="用户" sortable>        
          </el-table-column>
          <el-table-column prop="host" label="主机" sortable>
          </el-table-column>
          <el-table-column prop="command" label="执行命令" sortable>
          </el-table-column>
          <el-table-column prop="state" label="状态" sortable>
          </el-table-column>
          <el-table-column prop="timeMs" label="状态时间" :formatter="prettyTimes" sortable>
          </el-table-column>
          <el-table-column prop="info" label="SQL" :show-overflow-tooltip="true" width="220">
          </el-table-column>
          <el-table-column prop="stage" label="阶段" sortable>
          </el-table-column>
          <el-table-column label="占用内存" sortable>
            <template slot-scope="props">
              {{ prettyBytes(parseInt(props.row.memoryUsed)) }}</pre>
            </template>   
          </el-table-column>
        </el-table>
      </div>
    </div>
  </section>
</template>

<script>
  import Instance from '../../../../services/instance';
  import {compareBy} from '../../../../utils/collections';
  import prettyBytes from 'pretty-bytes';

  export default {

    props: {
      instance: {
        type: Instance,
        required: true
      }
    },
    data: () => ({
      isLoading: false,
      error: null,
      filter: '',
      contexts: [],
    }),
    computed: {
      filteredContexts() {
        const filterFn = this.getFilterFn();

        return this.contexts.filter(filterFn).sort(compareBy(bean => bean.name));
      }
    },
    methods: {
      prettyBytes,
      prettyTimes(row, column, cellValue, index){
        // 把毫秒转换成字符串
        var preTimeFloat = parseFloat(cellValue);
        if(preTimeFloat < 1000){
          return cellValue + ' 毫秒';
        } else if (cellValue < 60000){
          return (cellValue/1000).toFixed(2) + ' 秒';
        } else if (preTimeFloat < 3600000){
          return (cellValue/60000).toFixed(2) + ' 分';
        } else if (preTimeFloat < 86400000){
          return (cellValue/3600000).toFixed(2) + ' 小时';
        } else if (preTimeFloat < 2592000000){
          return (cellValue/86400000).toFixed(2) + ' 天';
        } else if (preTimeFloat < 31104000000){
          return (cellValue/2592000000).toFixed(2) + ' 月';
        } else {
          return (cellValue/31104000000).toFixed(2) + ' 年';
        }
      },
      getFilterFn() {
        if (!this.filter) {
          return () => true;
        }
        const regex = new RegExp(this.filter, 'i');
        return bean => {
          for(var i in bean){
            if(new String(bean[i]).match(regex)){
              return true;
            }
          }
          return false;
        };
      },
      async fetchProcessList() {
        this.error = null;
        this.isLoading = true;
        try {
          const res = await this.instance.fetchDatabaseInformationSchemaProcesslist();
          this.contexts = res.data;
        } catch (error) {
          console.warn('Fetching InformationSchema.Processlist failed:', error);
          this.error = error;
        }
        this.isLoading = false;
      },
    },
    created() {
      this.fetchProcessList();
    },
    install({viewRegistry}) {
      viewRegistry.addView({
        name: 'instances/InformationSchemaProcesslist',
        parent: 'instances',
        path: 'onformationSchemaProcesslist',
        group: 'Database',
        component: this,
        label: 'Process',
        order: 990,
        isEnabled: ({instance}) => instance.hasEndpoint('database')
      });
    }
  }
</script>

