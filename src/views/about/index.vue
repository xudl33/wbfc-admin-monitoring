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
  <div class="section">
    <div class="container">
      <h1 class="title">
        About Spring Boot Admin
      </h1>
      <h2 class="subtitle" v-if="version" v-text="`Version ${version}`" />
      <div class="content">
        <p>
          This is an administration UI for Spring Boot applications.
        </p>
        <p>
          To monitor applications, they must be registered at this server. This is either done by including the
          <a
            :href="`${documentationBaseUrl}/#register-clients-via-spring-boot-admin`"
          >
            Spring Boot Admin Client
          </a>
          or using a
          <a
            :href="`${documentationBaseUrl}/#discover-clients-via-spring-cloud-discovery`"
          >
            Spring Cloud Discovery Client
          </a> implementation.
        </p>
        <p>
          If you have any question please consult the
          <a :href="`${documentationBaseUrl}`">
            Reference Guide
          </a>, ask
          on <a href="https://stackoverflow.com/questions/tagged/spring-boot-admin">
            Stack Overflow
          </a> or
          have a chat on the <a href="https://gitter.im/codecentric/spring-boot-admin">
            Gitter
          </a> channel.
        </p>
        <p>
          If you found a bug, want to propose a feature or submit a pull request please use the
          <a href="https://github.com/codecentric/spring-boot-admin/issues">
            issue tracker
          </a>.
        </p>
        <div class="about-links">
          <a class="button is-primary is-outlined"
             :href="`${documentationBaseUrl}`"
          >
            <font-awesome-icon size="lg" icon="book" />&nbsp;Reference Guide
          </a>
          <a class="button is-black is-outlined" href="https://github.com/codecentric/spring-boot-admin">
            <font-awesome-icon size="lg" :icon="['fab', 'github']" />&nbsp;Sources
          </a>
          <a class="button is-stackoverflow is-outlined"
             href="https://stackoverflow.com/questions/tagged/spring-boot-admin"
          >
            <font-awesome-icon size="lg" :icon="['fab', 'stack-overflow']" />&nbsp;Stack Overflow
          </a>
          <a class="button is-gitter is-outlined" href="https://gitter.im/codecentric/spring-boot-admin">
            <font-awesome-icon size="lg" :icon="['fab', 'gitter']" />&nbsp;Gitter
          </a>
        </div>
      </div>
      <h1 class="title is-5">
        Trademarks and Licenses
      </h1>
      <div class="content">
        <p>
          The source code of Spring Boot Admin is licensed under <a
            href="https://www.apache.org/licenses/LICENSE-2.0"
          >
            Apache License 2.0
          </a>.
        </p>
        <p>
          Spring, Spring Boot and Spring Cloud are trademarks of <a href="https://pivotal.io/">
            Pivotal
            Software, Inc.
          </a> in the U.S. and other countries.
        </p>
      </div>
      <h1 class="title is-5">
        关于本项目
      </h1>
      <div class="content">
        <p>
          本项目是一个静态SpringBoot服务健康监控项目。通过改造Spring Boot Admin UI 并增加Webpack打包的Vue项目。
        </p>
        <p>
          虽然 <a href="https://github.com/codecentric/spring-boot-admin">Spring Boot Admin </a> 是一个很优秀的健康监控项目，但是因为其依赖Eureka，它通过DiscorveyClient向其AdminServer注册客户端信息。若不使用Client项目，则需要在AdminServer中填写静态的配置。第一种方式虽然能够自动发现服务，但是如果缺少eureka就会报错。而第二种方式需要修改配置文件，无法动态配置服务器(我在尝试的时候同样发现会报无法连接eureka的错误，这是它的一个bug)，而我们需要的只是一个可以动态添加并监控SpringBoot服务的功能，如果再去修改Java端的AdminServer有些得不偿失。那何必呢，我们已经有了UI，所以这才有了本项目。
        </p>
        <p>
          默认的 <a href="https://github.com/codecentric/spring-boot-admin">Spring Boot Admin </a> 还会包含journal功能，它会显示Application的离线和在线的时间列表，我认为这个功能有些鸡肋，而它是spring-boot-admin特有的功能，于是就把它屏蔽了。
          <br/>
          另外，虽然登录这个功能看起来很好，但实际应用中往往我们已经有了自己的登录认证服务器，这里还需要一个登录，更显得有些麻烦了，并且也不好进行拓展。还不如根据我们的实际需要去增加相应的功能。所以本项目是没有登录功能的。
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data: () => ({
      // eslint-disable-next-line no-undef
      version: global.__PROJECT_VERSION__
    }),
    computed: {
      documentationBaseUrl() {
        return `https://codecentric.github.io/spring-boot-admin/${this.version || 'current'}`;
      }
    },
    install({viewRegistry}) {
      viewRegistry.addView({
        path: '/about',
        name: 'about',
        label: 'About',
        order: 200,
        component: this
      });
    }
  };
</script>

<style lang="scss">
  .about-links {
    display: flex;
    align-items: center;

    & > * {
      margin-right: 0.5rem;
    }
  }

  $stackoverflow: #f48024;
  .button.is-stackoverflow.is-outlined {
    background-color: transparent;
    border-color: $stackoverflow;
    color: $stackoverflow;

    &:hover,
    &:focus {
      background-color: $stackoverflow;
      border-color: $stackoverflow;
      color: white;
    }
  }

  $gitter: #ed1965;
  .button.is-gitter.is-outlined {
    background-color: transparent;
    border-color: $gitter;
    color: $gitter;

    &:hover,
    &:focus {
      background-color: $gitter;
      border-color: $gitter;
      color: white;
    }
  }
</style>
