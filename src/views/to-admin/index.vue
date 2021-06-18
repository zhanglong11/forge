<template>
  <div></div>
</template>

<script>
import { getToken, setToken, removeToken } from '@/utils/auth'
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      token: this.$route.query.token,
      projectInfo: {
        id: this.$route.query.id || '',
        type: this.$route.query.type || '',
        name: this.$route.query.name || '',
        title: this.$route.query.title || ''
      }
    }
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.init()
  },
  //方法集合
  methods: {
    // 初始化
    init() {
      if (!this.token) {
        return
      }
      setToken(this.token)
      this.$store.commit('setWebTitle', {
        serviceCode: this.projectInfo.type,
        webTitle: this.projectInfo.title
      })
      this.$store.commit('user/SET_TOKEN', this.token)
      localStorage.setItem('projectId', this.projectInfo.id)
      localStorage.setItem('projectType', this.projectInfo.type)
      localStorage.setItem('projectName', this.projectInfo.name)
      this.$router.push({ path: '/' })
    }
  }
}
</script>
