<!--
 * @Description: 创建人、版本过滤:为视点漫游、视觉效果等提供，这些模块的特点是，多个模块在一个页面
 * @Version: 
 * @Autor: 申豪强
 * @Date: 2020-05-08 13:59:49
 * @LastEditTime: 2020-05-25 16:19:16
 -->
<template>
  <div class="select-content">
    <el-select v-model="version" placeholder="请选择版本" class="w-48" @change="selectChange">
      <el-option
        v-for="(item, index) in versionList"
        :key="item.id"
        :label="index === 0 ? item.fileName : 'v' + item.version + '--' + item.fileName"
        :value="item.id"
      >
      </el-option>
    </el-select>
    <!-- <el-input v-model="creatUser" class="w-48" @change="selectChange"></el-input> -->
    <el-select v-model="creatUser" filterable placeholder="请选择创建人" class="w-48" @change="userChange">
      <el-option v-for="item in userList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'VersionFilterSelf',
  props: {
    userList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      version: '',
      creatUser: ''
    }
  },
  computed: {
    versionList: {
      get() {
        let list = [
          {
            id: '',
            fileName: '全部'
          },
          ...this.$store.state.bim.versionList
        ]
        return list
      }
    },
    versionNumber() {
      return this.$store.state.bim.version
    }
  },
  watch: {
    versionNumber: {
      immediate: true,
      handler: function() {
        this.version = this.versionNumber
        this.selectChange()
      }
    }
  },
  methods: {
    selectChange() {
      let target = this.versionList.filter(item => item.id === this.version)[0]
      if (!target) {
        return
      }
      let obj = {
        version: target.version,
        versionId: target.id,
        creatUser: this.creatUser,
        projectFileId: target.projectFileId,
        projectId: target.projectId
      }
      this.$emit('selectChange', obj)
    },
    userChange(e, f) {
      let name = this.userList.filter((item, index) => e === item.value)[0].label
      this.$emit('userChange', name)
    }
  }
}
</script>

<style lang="less" scoped>
.select-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  .w-48 {
    width: 48%;
  }
}
</style>
