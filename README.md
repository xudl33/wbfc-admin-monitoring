# wbfc-admin-monitoring

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


引入babel是为了支持async的transform，也就是为了支持async / await对异步的处理

# 安装 (Install)
```shell
npm install wbfc-admin-monitoring
```
# 引用
```html
<template>
	<div>
		<WbfcAdminMonitoring :context-id="monitoringId"/>
	</div>
</template>
<script type="text/javascript">
import Vue from 'vue';
import WbfcAdminMonitoring from 'wbfc-admin-monitoring/src/views/wbfc-admin-monitoring';
export default {
	components: {
		WbfcAdminMonitoring
	},
	data(){
		return {
			monitoringId: 'myMonitoringId'
		};
	}
}
</script>
```


# 关于本项目
本项目是一个静态SpringBoot服务健康监控项目。通过改造Spring Boot Admin UI 并增加Webpack打包的Vue项目。

虽然 [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin) 是一个很优秀的健康监控项目，但是因为其依赖Eureka，它通过DiscorveyClient向其AdminServer注册客户端信息。若不使用Client项目，则需要在AdminServer中填写静态的配置。第一种方式虽然能够自动发现服务，但是如果缺少eureka就会报错。而第二种方式需要修改配置文件，无法动态配置服务器(我在尝试的时候同样发现会报无法连接eureka的错误，这是它的一个bug)，而我们需要的只是一个可以动态添加并监控SpringBoot服务的功能，如果再去修改Java端的AdminServer有些得不偿失。那何必呢，我们已经有了UI，所以这才有了本项目。

另外，虽然登录这个功能看起来很好，但实际应用中往往我们已经有了自己的登录认证服务器，这里还需要一个登录，更显得有些麻烦了，并且也不好进行拓展。还不如根据我们的实际需要去增加相应的功能。所以本项目是没有登录功能的。

# 新增或修改功能

- 默认的 [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin) 还会包含journal功能，它会显示Application的离线和在线的时间列表，我认为这个功能有些鸡肋，而它是spring-boot-admin特有的功能，于是就把它屏蔽了。

- 默认的功能还缺少`conditions`节点模块，本项目也进行了增加。
- `details`模块增加了若干模块的描述功能(用于中文显示)。
- `metrics`模块增加了百分比`percent`模式的显示。

# Tips
虽然 [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin) 在本项目中被改造成了一个Vue组件，但因为其引用了全局样式例如:bulma、generic等样式，如果在某个父组件内引用容易造成样式污染。所以这里建议重新打开一个新Tab页面来使用。



## Versions
版本|更新时间|更新说明
---|---|---
1.0.0 | 2019/03/22 | 1.0.0版本上传
1.0.1 | 2019/03/27 | 1.0.1版本上传
1.0.2 | 2019/03/29 | 测试代码删除
1.0.3 | 2019/03/29 | 修正applicationContext获取health时发生503错误的问题
1.0.4 | 2019/04/02 | 修正导入的全局样式污染的问题(虽然改了命名空间，但由于引入了bulma，其全局样式依旧会产生污染，我没有解决这个问题)