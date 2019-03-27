<template>
	<div class="container application-add-body">
		<el-row>
		  <el-col :span="24">
		  	<el-collapse v-model="activeName" accordion>
			  <el-collapse-item title="添加|编辑 Application信息" name="1">
			  	<div style="margin-bottom: 10px;">
			  		<el-button type="primary" @click="showAppDialog()"><i class="el-icon-plus"></i><span>添加</span></el-button>
			  		<el-button type="success" @click="showResource()"><i class="el-icon-upload2"></i><span>导出</span></el-button>
			  		<el-button type="info" @click="showImportDialog = true"><i class="el-icon-download"></i><span>导入</span></el-button>
			  	</div>
			    <el-table
				    :data="applicationList"
				    style="width: 100%" border>
				    <el-table-column type="expand">
				      <template slot-scope="props">
				        <el-form label-position="left" inline class="demo-table-expand">
				          <el-form-item label="名称:">
				            <span>{{ props.row.name }}</span>
				          </el-form-item>
				          <el-form-item label="服务器地址:">
				            <span>{{ props.row.url }}</span>
				          </el-form-item>
				          <el-form-item label="监控地址:">
				            <span>{{ props.row.actuatorPath }}</span>
				          </el-form-item>
				          <el-form-item label="描述:">
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
				      label="服务器地址"
				      prop="url">
				    </el-table-column>
				    <el-table-column
				      label="描述"
				      prop="desc">
				    </el-table-column>
				    <el-table-column prop="" label="操作" align="center" width="100">
		              <template slot-scope="scope">
		              	<el-button type="text" size="medium" @click="editApplication(scope.$index, scope.row)"><i class="el-icon-edit"></i></el-button>
		                <el-button type="text" size="medium" @click="removeApplication(scope.$index)"><i class="el-icon-close"></i></el-button>
		              </template>
		            </el-table-column>
				  </el-table>
			  </el-collapse-item>
			</el-collapse>
		  </el-col>
		</el-row>
		<!-- 新增 Application -->
	    <el-dialog title="新增 Application" :visible.sync="addAppDialog" :before-close="closeAddAppDialog">
	        <el-form :model="applicationForm" :rules="applicationRules" ref="applicationForm" label-width="160px" class="clearfix">
	        	<el-form-item label="名称：" prop="name" class="">
		          <el-input v-model="applicationForm.name" placeholder="请输入"></el-input>
		        </el-form-item>
		        <el-form-item label="服务器地址：" prop="url" class="">
		          <el-input v-model="applicationForm.url" placeholder="http://192.168.1.1"></el-input>
		        </el-form-item>
		        <el-form-item label="监控地址：" prop="actuatorPath" class="">
		          <el-input v-model="applicationForm.actuatorPath" placeholder="/actuator"></el-input>
		        </el-form-item>
		        <el-form-item label="描述：" prop="desc" class="">
		          <el-input v-model="applicationForm.desc" placeholder="请输入"></el-input>
		        </el-form-item>
      		</el-form>
	        <div slot="footer" class="dialog-footer toolBtn">
	          <el-button type="primary" @click="saveApplication()" v-if="updateIndex == null">保存</el-button>
	          <el-button type="primary" @click="saveUpdateApplication()" v-if="updateIndex != null">更新</el-button>
	          <el-button @click="resetAddAppDialog()">取消</el-button>
	        </div>
	    </el-dialog>
	    <!-- 新增 Application -->
	    <!-- 导出对话框 -->
	    <el-dialog title="导出 Application" :visible.sync="showResourceDialog" :before-close="closeResourceDialog">
	    	<span style="font-size:16px;">请复制(Ctrl + C)以下源码，可用于导入Application </span>
	    	<pre class="resource" v-html="applicationResource"></pre>
	    	<div slot="footer" class="dialog-footer toolBtn">
	    		<el-button @click="showResourceDialog = false;applicationResource = '';">关闭</el-button>
	    	</div>
	    </el-dialog>
	    <!-- 导出对话框 -->
	    <!-- 导入对话框 -->
	    <el-dialog title="导入 Application" :visible.sync="showImportDialog" :before-close="closeImportDialog">
	    	<span style="font-size:16px;">请粘贴(Ctrl + V)或输入Application JSON </span>
	    	<el-form :model="importForm" :rules="importRules" ref="importForm"  class="clearfix">
	        	<el-form-item label="" prop="value" class="">
		           <el-input type="textarea" v-model="importForm.value" rows="5"></el-input>
		        </el-form-item>
      		</el-form>
	    	<div slot="footer" class="dialog-footer toolBtn">
	    		<el-button type="primary" @click="importApplication()">确定</el-button>
	    		<el-button @click="resetImportDialog()">取消</el-button>
	    	</div>
	    </el-dialog>
	    <!-- 导入对话框 -->
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
			addAppDialog: false,
			applicationForm: {
				id: '',
				name: '',
				url: 'http://',
				actuatorPath: '/actuator',
				desc: ''
			},
			applicationRules:{
				name: [
		          { required: true, message: '必填', trigger: 'blur' },
		        ],
		        url: [
		          { required: true, message: '必填', trigger: 'blur' },
		        ],
		        actuatorPath: [
		          { required: true, message: '必填', trigger: 'blur' },
		        ],
			},
			updateIndex: null,
			showResourceDialog: false,
			applicationResource: '',
			showImportDialog: false,
			importForm: {
				value: '[]'
			},
			importRules:{
				value: [
		          { required: true, message: '必填', trigger: 'blur' },
		          { validator: this.applicationCheck, trigger: 'blur'}
		        ]
			}
		};
	},
	methods: {
		showAppDialog(){
			this.addAppDialog = true;
		},
		closeAddAppDialog(done){
			// 关闭
			done()
			this.resetAddAppDialog();
		},
		showResource(){
			this.showResourceDialog = true;
			var context = Vue.$applicationContext.getContext();
			this.applicationResource = JSON.stringify(context.applications || {}, null, 1);
		},
		closeResourceDialog(done){
			done();
			this.applicationResource = '';
		},
		applicationCheck(rule, value, callback){
			if(!value){
				callback();
				return;
			}
			var mess = null;
			var valJson = null;
			try {
				valJson = JSON.parse(value);
			} catch(e) {
				mess = '必须为JSON格式';
			}
			if(valJson){
				if(!Array.isArray(valJson)){
					mess = '必须为数组';
				} else {
					if(valJson.length > 0){
						for(var i in valJson){
							var tempApp = valJson[i];
							if(!tempApp.name){
								mess = '[' + i + '].name不能为空';
								isError = true;
								break;
							}
							if(!tempApp.url){
								mess = '[' + i + '].url不能为空';
								isError = true;
								break;
							}
							if(!tempApp.actuatorPath){
								mess = '[' + i + '].actuatorPath不能为空';
								isError = true;
								break;
							}
						}
					} else {
						mess = '数组中的数据不能为空';
					}
				}
			}
			
			if(mess){
				callback(new Error(mess));
			} else {
				callback();
			}
		},
		importApplication(){
			this.$refs.importForm.validate((valid) => {
	          if (valid) {
	          	var appArray = JSON.parse(this.importForm.value);
	          	// 校验是否有重复
	          	var extArray = Vue.$applicationContext.existsApplications(appArray);
	          	if(extArray.length > 0){
	          		// 连接成字符串
	          		var extNames = extArray.map(e => e.name).join(',');
	          		this.$confirm('【'+ extNames +'】已经存在，导入会覆盖数据，是否确认?', '提示', {
						confirmButtonText: '确定',
						type: 'warning',
						cancelButtonText: '取消',
						closeOnClickModal:false
					}).then((r) => {
						this.doImport(appArray);
					}).catch((e) => {
		            });
	          	} else {
	          		this.doImport(appArray);
	          	}
	          } else {
	            return false;
	          }
	        });
		},
		doImport(appArray){
			for(var i in appArray){
          		var app = appArray[i];
          		if(!app.id){
          			app.id = Vue.$applicationContext.generateId();
	          	}
	          	if(!app.desc){
	          		app.desc = '';
	          	}
          	}
          	Vue.$applicationContext.importApplications(appArray);
          	this.resetImportDialog();
          	this.getApplicationList();
          	Vue.$applicationContext.getApplications();
		},
		closeImportDialog(done){
			done();
			this.resetImportDialog();
		},
		resetImportDialog(){
			this.showImportDialog = false;
			this.$refs.importForm.resetFields();
		},
		saveApplication(){
			this.$refs.applicationForm.validate((valid) => {
	          if (valid) {
	          	var app = Object.assign({}, this.applicationForm);
	          	app.id = Vue.$applicationContext.generateId();
	          	Vue.$applicationContext.addApplication(app);
	          	this.applicationList.push(app);
	          	this.resetAddAppDialog();
	          	Vue.$applicationContext.getApplications();
	          } else {
	            return false;
	          }
	        });
		},
		resetAddAppDialog(){
			this.addAppDialog = false;
			this.$refs.applicationForm.resetFields();
		},
		editApplication(appIndex, application){
			this.updateIndex = appIndex;
			this.applicationForm = Object.assign({}, application);
			this.showAppDialog();
		},
		saveUpdateApplication(){
			var app = Object.assign({}, this.applicationForm);
			Vue.$applicationContext.updateApplication(this.updateIndex, app);
			this.resetAddAppDialog();
			this.applicationList.splice(this.updateIndex, 1, app);
			this.updateIndex = null;
			Vue.$applicationContext.getApplications();
		},
		removeApplication(appIndex){
			if(appIndex != null || appIndex != undefined){
				this.$confirm('您确定删除吗?', '提示', {
					confirmButtonText: '确定',
					type: 'warning',
					cancelButtonText: '取消',
					closeOnClickModal:false
				}).then((r) => {
					Vue.$applicationContext.deleteApplication(appIndex);
					this.applicationList.splice(appIndex, 1);
					Vue.$applicationContext.getApplications();
				}).catch(() => {
	            });
			}
		},
		getApplicationList(){
			this.applicationList = Vue.$applicationContext.getContext().applications || [];
		}
	},
	mounted(){
		this.getApplicationList();
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
.resource{
	font-size: 15px;
  	line-height: 1.2;
  	white-space: pre-wrap;
  	max-height: 300px;
    font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
}
</style>