<template>
  <section class="hero is-fullheight">
    <div class="hero-body">
        <div class="container has-text-centered">
            <div class="column is-4 is-offset-4">
                <div class="box">
                    <figure class="image is-128x128 login--logo">
                        <img src="/static/img/icon-spring-boot-admin.svg">
                    </figure>
                    <h1 class="title has-text-primary">Spring Boot Admin</h1>
                    <form method="post">
                        <div class="field">
                            <div class="control">
                                <input class="input is-medium" type="input" name="username" placeholder="Username"
                                       autofocus th:classappend="${param.error != null} ? is-danger">
                            </div>
                        </div>
                        <div class="field">
                            <div class="control">
                                <input class="input is-medium" type="password" name="password"
                                       placeholder="Password" th:classappend="${param.error != null} ? is-danger">
                            </div>
                        </div>
                        <div class="field">
                            <div class="control">
                                <input type="submit" class="button is-block is-primary is-medium is-fullwidth"
                                       value="Login">
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>
</template>
<script type="text/javascript">
import '../assets/css/base.scss';
export default {
}
</script>
