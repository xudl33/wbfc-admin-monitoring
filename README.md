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

# Props
属性名|默认值|说明
---|---|---
title|WBFC-Admin-Monitoring:String|左上角标题文字
context-id|wbfc-admin-monitoring-id:String|上下文ID，用于区分多个不同组件
userAuth|userAuth:JSON|用户认证信息{"tokenType":"bearer/basic","accessToken":"JWT/base64(username:password)"}
defaultApplications|[]:Array|默认的application信息[{"name":"名称", "url":"地址", "actuatorPath":"监控接口路径"}]



# 关于本项目
本项目是一个静态SpringBoot服务健康监控项目。通过改造Spring Boot Admin UI 并增加Webpack打包的Vue项目。

虽然 [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin) 是一个很优秀的健康监控项目，但是因为其依赖Eureka，它通过DiscorveyClient向其AdminServer注册客户端信息。若不使用Client项目，则需要在AdminServer中填写静态的配置。第一种方式虽然能够自动发现服务，但是如果缺少eureka就会报错。而第二种方式需要修改配置文件，无法动态配置服务器(我在尝试的时候同样发现会报无法连接eureka的错误，这是它的一个bug)，而我们需要的只是一个可以动态添加并监控SpringBoot服务的功能，如果再去修改Java端的AdminServer有些得不偿失。那何必呢，我们已经有了UI，所以这才有了本项目。

另外，虽然登录这个功能看起来很好，但实际应用中往往我们已经有了自己的登录认证服务器，这里还需要一个登录，更显得有些麻烦了，并且也不好进行拓展。还不如根据我们的实际需要去增加相应的功能。所以本项目是没有登录功能的。

# 新增或修改功能

- 默认的 [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin) 还会包含journal功能，它会显示Application的离线和在线的时间列表，我认为这个功能有些鸡肋，而它是spring-boot-admin特有的功能，于是就把它屏蔽了。
- 默认的功能还缺少`conditions`、`features`节点模块，本项目也进行了增加。
- `details`模块增加了若干模块的描述功能(用于中文显示)。
- `metrics`模块增加了百分比`percent`模式的显示。
- `auditevents`,`httptrace`,`session`模块修正了时间戳显示不正确的问题。`Spring-Boot-Admin-Server`处理时间戳，但我们直接连到服务器接口的话就会有问题了。
- 修正httptrace每次获取数量太大，导致无法在定时器循环时间内执行完毕过滤器操作，从而导致死循环的问题
- httptrace增加了自定义定时器时间的功能
- 增加`database`数据库监控(mysql)功能,包括表数据统计、数据、索引、表空间统计和进程列表

---更多的修改可以参考下面的更新说明


# Tips
虽然 [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin) 在本项目中被改造成了一个Vue组件，但因为其引用了全局样式例如:bulma、generic等样式，如果在某个父组件内引用容易造成样式污染。所以这里建议重新打开一个新Tab页面来使用。并且需要确认是否样式被污染。如果仍然有冲突，可以通过手动增加以`.wbfc-admin-monitoring-html`或`.wbfc-admin-monitoring-body`内的样式表进行覆盖操作。

## Versions
版本|更新时间|更新说明
---|---|---
1.0.0 | 2019/03/22 | 1.0.0版本上传
1.0.1 | 2019/03/27 | 1.0.1版本上传
1.0.2 | 2019/03/29 | 测试代码删除
1.0.3 | 2019/03/29 | 修正applicationContext获取health时发生503错误的问题
1.0.4 | 2019/04/02 | 修正导入的全局样式污染的问题(虽然改了命名空间，但由于引入了bulma，其全局样式依旧会产生污染，我没有解决这个问题)
1.0.5 | 2019/04/04 | 增加defaultApplications属性，用于初始化时导入默认的application信息;增加README的Props说明信息
1.0.6 | 2019/04/04 | 修正导入的application缺少instanceId的BUG
1.0.7 | 2019/04/09 | 修正全局样式font-size为16px
1.0.8 | 2019/04/12 | 修正auditevents、httptrace时间戳不正确的问题；修正httptrace每次获取数量太大，导致无法在定时器循环时间内执行完毕过滤器操作，从而导致死循环的问题；httptrace增加了自定义定时器时间的功能；修正application返回的href直连了服务器，导致绕过路由或代理服务器的问题；增加`features`模块;
1.0.9 | 2019/05/10 | 增加`database`数据库监控(mysql)功能;修正了addSlef=true时import会覆盖掉修改过的application信息的问题；
1.1.0 | 2019/05/13 | 修正importApplications第一次进入时没有applications导致无法生成id的问题
1.1.1 | 2019/05/16 | 增加logViewer显示服务器实时日志的功能
1.1.2 | 2019/05/18 | 修正axios全局过滤器失效导致无法访问带有权限的接口问题修正；logViewer修正socket连接直连到服务器(由于socket无法穿透zuul，导致无法访问springboot的websocket服务器)；logViewer增加权限判断和异常处理、优化了debug日志的颜色；修正所有页面error message超长导致样式不正确的问题；element-ui版本升级为2.8.2；
1.1.3 | 2019/05/21 | 修正headdump无法通过带有权限的接口下载的BUG；修正audit log、sessions和http trace 时间戳不显示毫秒的问题；