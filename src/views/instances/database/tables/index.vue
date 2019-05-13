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
  <section class="section database-tables-section">
    <div v-if="error" class="message is-danger" >
      <div class="message-body">
        <strong>
          <font-awesome-icon
            class="has-text-danger"
            icon="exclamation-triangle"
          />
          Fetching InformationSchema.Tables failed.
        </strong>
        <p v-text="error.message" />
      </div>
    </div>
    <el-collapse v-model="activeNames">
	    <el-collapse-item title="表元信息" name="1">
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
			    <el-table :data="filteredContexts" height="600" v-loading="isLoading">
			        <el-table-column type="expand">
			          <template slot-scope="props">
			            <pre class="features-value">{{ JSON.stringify(props.row, null, 1) }}</pre>
			          </template>
			        </el-table-column>
			        <el-table-column prop="tableName" label="表名" sortable>      	
			        </el-table-column>
			        <el-table-column prop="tableComment" label="备注">      	
			        </el-table-column>
			        <el-table-column prop="tableRows" label="数据行数" sortable>
			        </el-table-column>
			        <el-table-column prop="indexLength" label="索引" sortable>
                <template slot-scope="props">
                  {{ prettyBytes(parseInt(props.row.indexLength)) }}</pre>
                </template>     	
			        </el-table-column>
              <el-table-column label="表空间" sortable>
                <template slot-scope="props">
                  {{ prettyBytes(parseInt(props.row.dataLength)) }}</pre>
                </template>
              </el-table-column>
			        <el-table-column label="空间碎片" sortable>
                <template slot-scope="props">
                  {{ prettyBytes(parseInt(props.row.dataFree)) }}</pre>
                </template> 	
			        </el-table-column>
			        <el-table-column label="操作" align="center">
			        	<template slot-scope="scope">
    							<el-button type="text" size="small" @click="getAttrs(scope.row)">属性列表</el-button>
    						</template>
			        </el-table-column>
			    </el-table>
	      </div>
  		</el-collapse-item>
  		<el-collapse-item title="统计" name="2">
  			<total-count :instance="instance"></total-count>
  		</el-collapse-item>
    </el-collapse>
    <!-- 属性列表 -->
    <el-dialog title="属性列表" :visible.sync="showAttrs" :append-to-body="true" @close="showAttrsClosed">
        <div slot="title">
          <span class="wbfc-admin-monitoring-body-database-tables-section-el-dialog__title">{{ tableDetail.tableName }}</span>
        </div>
        <el-tabs v-model="tableDetail.activeName" v-loading="detailLoading">
          <el-tab-pane label="列信息" name="1">
            <el-table :data="tableDetail.columns" >
              <el-table-column type="expand">
                <template slot-scope="props">
                  <pre class="features-value">{{ JSON.stringify(props.row, null, 1) }}</pre>
                </template>
              </el-table-column>
              <el-table-column prop="columnName" label="列名" width="200">
              </el-table-column>
              <el-table-column prop="dataType" label="类型" width="100">        
              </el-table-column>
              <el-table-column label="长度">
                <template slot-scope="props">
                  {{ props.row.characterMaximumLength || props.row.numericPrecision || props.row.datetimePrecision}}
                </template>   
              </el-table-column>
              <el-table-column prop="numericScale" label="小数点"> 
              </el-table-column>
              <el-table-column prop="isNullable" label="非空">        
              </el-table-column>
              <el-table-column prop="columnComment" label="备注" width="300">       
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="索引" name="2">
            <el-table :data="tableDetail.statistics" >
              <el-table-column type="expand">
                <template slot-scope="props">
                  <pre class="features-value">{{ JSON.stringify(props.row, null, 1) }}</pre>
                </template>
              </el-table-column>
              <el-table-column prop="indexName" label="名称">
              </el-table-column>
              <el-table-column prop="columnName" label="列名">
              </el-table-column>
              <el-table-column prop="indexType" label="索引类型">        
              </el-table-column>
              <el-table-column prop="comment" label="索引备注">       
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="外键" name="3">
            <el-table :data="tableDetail.constraints" >
              <el-table-column type="expand">
                <template slot-scope="props">
                  <pre class="features-value">{{ JSON.stringify(props.row, null, 1) }}</pre>
                </template>
              </el-table-column>
              <el-table-column prop="constraintName" label="名称">
              </el-table-column>
              <el-table-column prop="columnName" label="列名">
              </el-table-column>
              <el-table-column prop="referencedTableSchema" label="参考数据库">        
              </el-table-column>
              <el-table-column prop="referencedTableName" label="参考表">        
              </el-table-column>
              <el-table-column prop="referencedColumnName" label="参考列">        
              </el-table-column>
              <el-table-column prop="updateRule" label="更新时约束">       
              </el-table-column>
              <el-table-column prop="deleteRule" label="删除时约束">       
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showAttrs = false">关 闭</el-button>
        </div>
    </el-dialog>
  </section>
</template>
<style type="text/css">
.wbfc-admin-monitoring-body .database-tables-section .el-collapse-item__header{
	font-size: 20px;
    font-weight: bold;
}
.wbfc-admin-monitoring-body-database-tables-section-el-dialog__title {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
}
</style>
<script>
  import Instance from '../../../../services/instance';
  import {compareBy} from '../../../../utils/collections';
  import totalCount from './total-count';
  import prettyBytes from 'pretty-bytes';
  import 'element-ui/lib/theme-chalk/index.css'

  export default {

    props: {
      instance: {
        type: Instance,
        required: true
      }
    },
    components: {totalCount},
    data: () => ({
      activeNames: ['1', '2'],
      isLoading: false,
      detailLoading: false,
      error: null,
      tables: [],
      filter: '',
      showAttrs: false, // 显示属性列表
      tableDetail: {
        activeName: '1', // 当前激活标签页
        columns: [], // 列信息
        statistics: [], // 索引信息
        constraints: [] // 外键
      }, // 表详情数据
    }),
    computed: {
      filteredContexts() {
          const filterFn = this.getFilterFn();
          return this.tables.filter(filterFn).sort(compareBy(bean => bean.name));
      }
    },
    methods: {
      prettyBytes,
      getFilterFn() {
        if (!this.filter) {
          return () => true;
        }
        const regex = new RegExp(this.filter, 'i');
        return bean => (bean.tableName.match(regex) || bean.tableComment.match(regex));
      },
    	async getinformationSchemaTables() {
	        this.error = null;
	        this.isLoading = true;
	        try {
	          const res = await this.instance.fetchDatabaseInformationSchemaTables();
	          this.tables = res.data?res.data:[];
	        } catch (error) {
	          console.warn('Fetching InformationSchema.Tables failed:', error);
	          this.error = error;
	        }
	        this.isLoading = false;
        },
    	async getAttrs(tableInfo){
        Object.assign(this.tableDetail, tableInfo);
        this.showAttrs = true;
        this.detailLoading = true;
        try {
            const res = await this.instance.fetchDatabaseInformationSchemaColumns(tableInfo.tableName);
            Object.assign(this.tableDetail, res.data?res.data:{});
        } catch (error) {
          console.warn('Fetching tableDetail failed:', error);
          this.error = error;
        }
        this.detailLoading = false;
    	},
      showAttrsClosed(){
        this.showAttrs = false;
        this.tableDetail = this.$options.data().tableDetail;
      }
    },
    mounted(){

    },
    created() {
      this.getinformationSchemaTables();
    },
    install({viewRegistry}) {
      viewRegistry.addView({
        name: 'instances/informationSchemaTable',
        parent: 'instances',
        path: 'informationSchemaTable',
        group: 'Database',
        component: this,
        label: 'Tables',
        order: 980,
        isEnabled: ({instance}) => instance.hasEndpoint('database')
      });
    }
  }
</script>

