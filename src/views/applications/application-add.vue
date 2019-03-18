<template>
	<div class="application-add-body">
		<el-row>
		  <el-col :span="24">
		  	<el-collapse v-model="activeName" accordion>
			  <el-collapse-item title="添加|编辑 Application信息" name="1">
			  	<div style="margin-bottom: 10px;">
			  		<el-button type="primary"><i class="el-icon-plus"></i><span>添加</span></el-button>
			  	</div>
			    <el-table
				    :data="applicationList"
				    style="width: 100%" border>
				    <el-table-column type="expand">
				      <template slot-scope="props">
				        <el-form label-position="left" inline class="demo-table-expand">
				          <el-form-item label="名称">
				            <span>{{ props.row.name }}</span>
				          </el-form-item>
				          <el-form-item label="URL">
				            <span>{{ props.row.url }}</span>
				          </el-form-item>
				          <el-form-item label="描述">
				            <span>{{ props.row.desc }}</span>
				          </el-form-item>
				        </el-form>
				      </template>
				    </el-table-column>
				    <el-table-column
				      label="名称"
				      prop="name">
				    </el-table-column>
				    <el-table-column
				      label="URL"
				      prop="url">
				    </el-table-column>
				    <el-table-column
				      label="描述"
				      prop="desc">
				    </el-table-column>
				    <el-table-column prop="" label="操作" align="center" width="55">
		              <template slot-scope="scope">
		                <el-button type="text" size="medium" @click="deleteApplication(scope.$index)"><i class="el-icon-close"></i></el-button>
		              </template>
		            </el-table-column>
				  </el-table>
			  </el-collapse-item>
			</el-collapse>
		  </el-col>
		</el-row>
	</div>
</template>
<script type="text/javascript">
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI);

export default {
	name: 'application-add',
	data(){
		return {
			activeName: '',
			applicationList: [],
		};
	},
	methods: {
		checkStore(){
			if(!window.localStorage){
				this.$alert('您的浏览器版本太低，请使用最新版的Chrome', '提示', {
		            confirmButtonText: '确定'
		        });
		        return false;
			}
			return true;
		},
		deleteStore(appIndex){
			if(this.checkStore()){
				var appList = JSON.parse(localStorage.getItem("applications") || '[]');
				appList.splice(appIndex, 1);
				localStorage.setItem("applications", JSON.stringify(appList));
			}
		},
		getStorage(){
			if(this.checkStore()){
				var appList = JSON.parse(localStorage.getItem("applications") || '[]');
				return appList;
			}
		},
		setStorage(appInfo){
			if(this.checkStore() && appInfo){
				var appList = JSON.parse(localStorage.getItem("applications") || '[]');
				appList.push(appInfo);
				localStorage.setItem("applications", JSON.stringify(appList));
			}
		},
		deleteApplication(appIndex){
			if(this.checkStore()){
				this.deleteStore(deleteStore);
				this.applicationList.splice(appIndex, 1);
			}
		}
	},
	mounted(){
		this.applicationList = this.getStorage();
	}
}
</script>
<style type="text/css">
.application-add-body{
	padding: 10px 0px;
}
.el-message-box__wrapper{
    display: block;
}
</style>