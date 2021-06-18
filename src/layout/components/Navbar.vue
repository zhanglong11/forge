<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <!-- 面包屑 -->
    <!-- <breadcrumb class="breadcrumb-container" /> -->
    <!-- 顶部菜单 -->
    <div class="menu-list">
      <el-menu
        :default-active="'/' + $route.path.split('/')[1]"
        class="el-menu-demo"
        mode="horizontal"
        active-text-color="#409eff"
        router
      >
        <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">{{ item.meta.title }}</el-menu-item>
      </el-menu>
    </div>
    <div class="right-menu clearfix">
      <el-badge :value="unreadNum" class="info">
        <i class="el-icon-bell" @click="goInfo"></i>
      </el-badge>
      <el-button type="primary" round icon="el-icon-suitcase" style="margin-right: 10px;" @click="goToSystem()">{{
        webTitle
      }}</el-button>
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <span class="user-name">{{ userName }}</span>
          <i class="el-icon-caret-bottom" />
          <img :src="avatar || '/img/avatar.jpg' + '?imageView2/1/w/80/h/80'" class="user-avatar" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>首页</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import api from '@/api/message'

export default {
  components: {
    // Breadcrumb,
    Hamburger
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar']),
    menuList() {
      return this.$store.state.app.menuList.filter(e => !e.hidden && e.meta)
    },
    userName() {
      return this.$store.state.user.name
    },
    unreadNum() {
      return this.$store.state.user.unreadNum
    },
    // 标题栏地址
    webTitle() {
      return this.$store.state.userPower.webTitle
    }
  },
  mounted() {
    console.log(111, this.$store.state.userPower)
    /*
     * @bug编号: 1446 | 更新未读
     * @开发人员:申豪强
     * @日期:2020-03-31
     * @bug类型：系统bug
     */
    this.$store.dispatch('user/upDateUndreadNum')
  },
  methods: {
    goInfo() {
      // 前往消息页面
      this.$router.push({ name: 'Message' })
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      if (process.env.NODE_ENV === 'development') {
        this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      } else {
        this.goToSystem('9002')
      }
    },
    // 回施工系统
    goToSystem(port = '9003') {
      const origin = location.origin
      if (origin.indexOf('172') >= 0) {
        if (origin.indexOf('41') >= 0) {
          location.href = `http://172.16.10.41:${port}/`
        } else {
          location.href = `http://${location.hostname}:9527/`
        }
      } else {
        location.href = 'http://ly.gim6d.com:8913/'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-name {
  cursor: pointer;
  padding-right: 6px;
}
.info {
  font-size: 20px;
  display: inline-block;
  margin-right: 30px;
  cursor: pointer;
}
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .menu-list {
    .el-menu-item {
      height: 50px;
      line-height: 50px;
    }
  }

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 50px;
    padding-top: 5px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        // margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          /* margin-top: 3px; */
          position: relative;
          top: 6px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          font-size: 12px;
          padding-right: 12px;
        }
      }
    }
  }
}
</style>
<style lang="less" scope>
.menu-list {
  float: left;
}
</style>
