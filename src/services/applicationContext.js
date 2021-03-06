import myAxios from '../utils/axios';

export default {
	name: 'Application-Context',
	install(Vue, getContextIdFunc){
		if(!Vue.$applicationContext){
			this.getContextIdFunc = getContextIdFunc;
			Vue.$applicationContext = this;
		}
	},
	getContextId(){
		if(this.getContextIdFunc){
			return this.getContextIdFunc.call();
		}
	},
	checkStore(){
		if(!window.localStorage){
			this.$alert('您的浏览器版本太低，请使用最新版的Chrome', '提示', {
	            confirmButtonText: '确定'
	        });
	        return false;
		}
		return true;
	},
	getContext(){
		if(this.checkStore()){
			var contextId = this.getContextId();
          	var context = JSON.parse(window.localStorage.getItem(contextId) || '{}');
			return context;
		}
	},
	setContext(context){
		if(this.checkStore() && context){
			var contextId = this.getContextId();
			window.localStorage.setItem(contextId, JSON.stringify(context));
		}
	},
	addApplication(application){
		if(this.checkStore() && application){
			var context = this.getContext();
			if(!context.applications){
				context.applications = [];
			}
			context.applications.push(application);
			this.setContext(context);
		}
	},
	existsApplications(applications){
		if(this.checkStore() && Array.isArray(applications) && applications.length > 0){
			var context = this.getContext();
			var localApps = context.applications || [];
			var extRes = [];
			for(var j in applications){
				var checkApp = applications[j];
				for(var i in localApps){
					var localApp = localApps[i];
					// id和名称相同就说明存在
					if((checkApp.id && checkApp.id === localApp.id) || (checkApp.name && checkApp.name === localApp.name)){
						var extApp = Object.assign({}, checkApp);
						if(checkApp.id){
							extApp.name = extApp.name + '(' + checkApp.id + ')';
						}
						
						extRes.push(extApp);
					}
				}
			}
			return extRes;
		}
		return [];
	},
	getApplication(id){
		if(this.checkStore()){
			var context = this.getContext();
			var localApps = context.applications || [];
				for(var i in localApps){
					var localApp = localApps[i];
					// id和名称相同就说明存在
					if(localApp && localApp.id && localApp.id === id){
						return {
							"index": i,
							"application": localApp
						}
					}
				}
			return null;
		}
		return null;
	},
	importApplications(applications, isOverwrite){
		if(this.checkStore() && Array.isArray(applications) && applications.length > 0){
			var context = this.getContext();
			// 修正importApplications第一次进入时没有applications导致无法生成id的问题
			if(!context.applications){
				context.applications = [];
			}
			for(var j in applications){
				var overwrite = false;
				for(var i in context.applications){
					var localApp = context.applications[i];
					// id和名称相同就覆盖
					if((applications[j].id && localApp.id === applications[j].id) || (applications[j].name && (localApp.name === applications[j].name)) || ( applications[j].url && (localApp.url === applications[j].url))){
						if(!applications[j].id){
							// 如果有本地id就用本地的
							if(localApp.id){
								applications[j].id = localApp.id;
							} else {
								applications[j].id = this.generateId();
							}
						}
						overwrite = true;
						// 如果设置了导入时不覆盖就跳过
						if(!isOverwrite){
							continue;
						}
						context.applications.splice(i, 1, applications[j]);
						break;
					}
				}
				// 不覆盖的话就添加
				if(!overwrite){
					if(!applications[j].id){
						// 如果有本地id就用本地的
						if(localApp && localApp.id){
							applications[j].id = localApp.id;
						} else {
							applications[j].id = this.generateId();
						}
					}
					context.applications.push(applications[j]);
				}
			}
			this.setContext(context);
		}
	},
	updateApplication(appIndex, application){
		if(this.checkStore() && application){
			var context = this.getContext();
			if(!context.applications){
				context.applications = [];
			}
			context.applications.splice(appIndex, 1, application);
			this.setContext(context);
		}
	},
	deleteApplication(appIndex){
		if(this.checkStore() && (appIndex != null || appIndex != undefined)){
			var context = this.getContext();
			context.applications.splice(appIndex, 1);
			this.setContext(context);
		}
	},
	generateId(len) {
		if (!len) {
			// 默认12位
			len = 12;
		} else if (typeof(Number(len)) != 'number') {
			return null;
		}
	    var ar = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
	    var hs = [];
	    var hl = Number(len);
	    var al = ar.length;
	    for (var i = 0; i < hl; i ++) {
	        hs.push(ar[Math.floor(Math.random() * al)]);
	    }
	     
	    return hs.join('');
	},
	newApplicationInfo(applicationForm){
		var now = new Date();
		return {
				"name": applicationForm.name,
				"status": "DOWN", // 默认的状态有多种UNKNOW/OFFLINE等 这里只保留 UP和DOWN
				"statusTimestamp": now,
				"instances": [{
					"bootAdmin": applicationForm,
					"id": applicationForm.id,
					"registration": {
						"name": applicationForm.name,
						"managementUrl": applicationForm.url + applicationForm.actuatorPath,
						"healthUrl": "", // 设置为actuator中的health
						"serviceUrl": applicationForm.url,
						"source": "discovery",
						"metadata": {
							"management.context-path": applicationForm.actuatorPath
						}
					},
					"registered": true,
					"statusInfo": { // 从health中读取
						/*"status": "UP",
						"details": {
							"diskSpace": {
								"status": "UP",
								"details": {
									"total": 333447163904,
									"free": 164081586176,
									"threshold": 10485760
								}
							},
							"db": {
								"status": "UP",
								"details": {
									"database": "MySQL",
									"hello": 1
								}
							}
						}*/
					},
					"statusTimestamp": now,
					"info": {}, // 从info中读取
					"endpoints": [], // 从actuator读取并转换
					/*[{
						"id": "sessions",
						"url": "http://localhost:5200/actuator/sessions"
					}, {
						"id": "httptrace",
						"url": "http://localhost:5200/actuator/httptrace"
					}, {
						"id": "caches",
						"url": "http://localhost:5200/actuator/caches"
					}, {
						"id": "loggers",
						"url": "http://localhost:5200/actuator/loggers"
					}, {
						"id": "health",
						"url": "http://localhost:5200/actuator/health"
					}, {
						"id": "env",
						"url": "http://localhost:5200/actuator/env"
					}, {
						"id": "heapdump",
						"url": "http://localhost:5200/actuator/heapdump"
					}, {
						"id": "features",
						"url": "http://localhost:5200/actuator/features"
					}, {
						"id": "scheduledtasks",
						"url": "http://localhost:5200/actuator/scheduledtasks"
					}, {
						"id": "mappings",
						"url": "http://localhost:5200/actuator/mappings"
					}, {
						"id": "beans",
						"url": "http://localhost:5200/actuator/beans"
					}, {
						"id": "configprops",
						"url": "http://localhost:5200/actuator/configprops"
					}, {
						"id": "threaddump",
						"url": "http://localhost:5200/actuator/threaddump"
					}, {
						"id": "metrics",
						"url": "http://localhost:5200/actuator/metrics"
					}, {
						"id": "conditions",
						"url": "http://localhost:5200/actuator/conditions"
					}, {
						"id": "auditevents",
						"url": "http://localhost:5200/actuator/auditevents"
					}, {
						"id": "info",
						"url": "http://localhost:5200/actuator/info"
					}, {
						"id": "jolokia",
						"url": "http://localhost:5200/actuator/jolokia"
					}],*/
					"tags": {}
				}]
			};
	},
	getApplicationActuatorList(callback){
		if(this.checkStore()) {
			return getHealthList.call(this, callback);
		}
	},
	setContainerVue(vueElement){
		this.containVue = vueElement;
	},
	getApplications(){
		if(this.containVue){
			this.containVue.getApplications();
		}
	},
	async getApplicationInfo(app){
		var actResult = await getActuatorResult.call(this, app);
		var appInfo = this.newApplicationInfo(app);
		if(actResult){
			// 转成字符串
			var actResultStr = JSON.stringify(actResult);
			var actSelf = actResult._links.self;
			// 替换为当前服务器(因为可能通过了nginx、zuul等代理服务器，如果这里的href不是设置的地址，则不正确)
			if(actSelf){
				var repHref = actSelf.href;
				// 保存真实服务器地址 websocket需要直连
				appInfo.realServerUrl = repHref;
				var tarHref = app.url + app.actuatorPath;
				if(repHref !== tarHref){
					// 替换全部的url
					actResultStr = actResultStr.replace(new RegExp(repHref,"gm"), tarHref);
				}
				// 再转回JSON
				actResult = JSON.parse(actResultStr);
			}
			appInfo.status = 'UP';
			for(var j in actResult._links){
				// templated属性要为false才是监控节点接口
				if(!actResult._links[j].templated){
					// 添加到endpoints属性
					appInfo.instances[0].endpoints.push({
						id: j,
						url: actResult._links[j].href
					});
					// 如果有health节点就设置到statusInfo
					if(j === 'health'){
						appInfo.instances[0].registration.healthUrl = actResult._links[j].href;
						var healthRes = await getHealthResult(actResult._links[j].href);
						appInfo.instances[0].statusInfo = healthRes;
						appInfo.status = healthRes.status;
					}
				}
			}
		}
		return appInfo;
	}

}
async function getHealthList(callback){
	var _this = this;
	return new Promise(async (reslove, reject) => {
		var resultList = [];
		var applicationList = _this.getContext().applications || [];
		if(applicationList.length > 0){
			for(var i in applicationList){
				var app = applicationList[i];
				var appInfo = await _this.getApplicationInfo(app);
				resultList.push(appInfo);
			}
		}
		reslove(callback.call(this, JSON.stringify(resultList)));
	});
}


function getActuatorResult(application) {
	return myAxios({
  		method: 'get',
  		url: application.url + application.actuatorPath
  	}).then(r => {
  		return r.data;
  	}).catch(e => {
  		console.log('get actuator with error = %o', e);
  		return null;
  	});
}

function getHealthResult(healthUrl) {
	return myAxios({
  		method: 'get',
  		url: healthUrl
  	}).then(r => {
  		return r.data;
  	}).catch(e => {
  		if(e.response.data){
  			return e.response.data;
  		} else {
	  		console.log('get health with error = %o', e);
  			return Promise.reject(e);
  		}
  	});
}