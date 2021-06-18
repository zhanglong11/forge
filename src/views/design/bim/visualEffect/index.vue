<!--
 * @Description: 视觉效果
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-04-29 10:50:45
 * @LastEditTime: 2020-05-26 17:00:56
 -->
<template>
  <div class="right-content">
    <Drag title="视觉效果">
      <VersionFilter ref="versionFilter" :userList="userList" @selectChange="selectChange" @userChange="userChange" />
      <el-radio-group v-model="tabPosition" class="radio-group">
        <el-radio-button label="view">视觉方案</el-radio-button>
        <el-radio-button label="componentManage">构件管理</el-radio-button>
        <el-radio-button label="animation">动画方案</el-radio-button>
      </el-radio-group>
      <!-- 视觉方案 -->
      <Optesthesia
        v-if="tabPosition === 'view'"
        :version="version"
        :creatUser="creatUser"
        :projectFileId="projectFileId"
        :projectId="projectId"
        @updateUser="updateUser"
      />
      <!-- 构件管理 -->
      <ComponentManage
        v-if="tabPosition === 'componentManage'"
        :version="version"
        :creatUser="creatUser"
        :projectFileId="projectFileId"
        :projectId="projectId"
        @updateUser="updateUser"
      />
      <!-- 动画方案 -->
      <Animation
        v-if="tabPosition === 'animation'"
        :version="version"
        :creatUser="creatUser"
        :projectFileId="projectFileId"
        :projectId="projectId"
        @updateUser="updateUser"
      />
    </Drag>
  </div>
</template>

<script>
import VersionFilter from '../component/versionFilterSelf'
import Optesthesia from './optesthesia/optesthesia'
import Drag from '../component/Drag'
import ComponentManage from './componentManage/componentManage'
import Animation from './animation/animation'
export default {
  components: {
    Drag,
    Optesthesia,
    VersionFilter,
    ComponentManage,
    Animation
  },
  data() {
    return {
      tabPosition: 'view',
      userList: [],
      version: null,
      creatUser: null,
      projectFileId: null,
      projectId: null
    }
  },
  watch: {
    version(e) {}
  },
  methods: {
    updateUser(arr) {
      this.$refs.versionFilter.creatUser = ''
      this.creatUser = ''
      this.userList = arr
    },
    userChange(e) {
      this.creatUser = e
    },
    selectChange(v) {
      this.version = v.version
      this.projectFileId = v.projectFileId
      this.projectId = v.projectId
    },
    close() {
      this.$emit('navigationChange')
    }
  }
}
</script>

<style lang="less" scoped>
.radio-group {
  width: 100%;
  text-align: center;
  padding-top: 10px;
  /*padding-bottom: 10px;*/
  /deep/ label {
    width: 33%;
  }
  /deep/ .el-radio-button__inner {
    width: 100%;
  }
  /deep/ .el-radio-button__inner,
  /deep/ .el-radio-group {
    line-height: 2;
  }
}
</style>
