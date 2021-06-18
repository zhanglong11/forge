<!--/**
任务名称：2868/添加3月注释
开发人员：李建敏
日期：2020-3月-11日
任务类型：2、复制修改代码 （20行）
**/-->
<template>
  <div :class="classObj" class="app-wrapper">
    <!--    必须加载了权限之后再渲染页面，否则v-access指令会删除有权限的元素-->
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar />
      </div>
      <app-main />
      <RightPanel @close="clearForm">
        <chat ref="chat" />
      </RightPanel>
    </div>
  </div>
  <!-- <div v-else v-show="getAccessListDone" class="no-permission">
    <img src="/img/no-permission.webp" alt="" />
    <p>你在本项目没有任何权限，请联系管理员或 <a @click="logout">退出登录</a></p>
  </div> -->
</template>

<script>
import RightPanel from '_c/RightPanel/index'
import { Navbar, Sidebar, AppMain, Chat } from './components'
import ResizeMixin from './mixin/ResizeHandler'
export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
    Chat,
    RightPanel
  },
  mixins: [ResizeMixin],
  data() {
    return {
      getAccessListDone: false
    }
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    accessList() {
      return this.$store.state.app.accessList
    }
  },
  created() {
    this.$store.dispatch('app/getPermissionList').then(res => {
      this.getAccessListDone = true
    })
    this.$store.dispatch('design/getProjectDetail')
    this.$store.dispatch('user/getInfo')
    this.$store.dispatch('setSystemConfigStorage')
  },
  methods: {
    clearForm() {
      this.$refs.chat.clearForm()
    },
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
@import '~@/styles/variables.scss';

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}

.no-permission {
  background-color: #020239;
  height: 100vh;
  width: 100%;
  justify-content: center;
  img {
    margin: 0 auto;
    display: block;
    width: 800px;
  }
  p {
    color: #fff;
    font-size: 28px;
    text-align: center;
    margin-top: 30px;
  }
}
</style>
