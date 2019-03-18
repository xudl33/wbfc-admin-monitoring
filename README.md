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

# 关于本项目
本项目是一个静态SpringBoot服务健康监控项目。通过改造Spring Boot Admin UI 并增加Webpack打包的Vue项目。

虽然 [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin) 是一个很优秀的健康监控项目，但是因为其依赖Eureka，它通过DiscorveyClient向其AdminServer注册客户端信息。若不使用Client项目，则需要在AdminServer中填写静态的配置。第一种方式虽然能够自动发现服务，但是如果缺少eureka就会报错。而第二种方式需要修改配置文件，无法动态配置服务器(我在尝试的时候同样发现会报无法连接eureka的错误，这是它的一个bug)，而我们需要的只是一个可以动态添加并监控SpringBoot服务的功能，如果再去修改Java端的AdminServer有些得不偿失。那何必呢，我们已经有了UI，所以这才有了本项目。


默认的 [Spring Boot Admin](https://github.com/codecentric/spring-boot-admin) 还会包含journal功能，它会显示Application的离线和在线的时间列表，我认为这个功能有些鸡肋，而它是spring-boot-admin特有的功能，于是就把它屏蔽了。

另外，虽然登录这个功能看起来很好，但实际应用中往往我们已经有了自己的登录认证服务器，这里还需要一个登录，更显得有些麻烦了，并且也不好进行拓展。还不如根据我们的实际需要去增加相应的功能。所以本项目是没有登录功能的。