<!--
 * @Description: 创建人、版本过滤
 * @Version: 
 * @Autor: 申豪强
 * @Date: 2020-05-08 13:59:49
 * @LastEditTime: 2020-05-25 16:05:00
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
  name: 'VersionFilter',
  props: {
    // 含有creatorName的数组
    dataList: {
      type: Array,
      default: () => []
    }
    // userList: {
    //   type: Array,
    //   default: () => {
    //     return []
    //   }
    // }
  },
  data() {
    return {
      version: '',
      creatUser: '',
      // 传进来数组的copy
      dataListCopy: [],
      // 用户数组
      userList: []
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
    },
    // 获取的数据发生变化，userList也变
    dataList: {
      immediate: true,
      handler: function() {
        // 复制一份数据备用
        this.dataListCopy = JSON.parse(JSON.stringify(this.dataList))
        let list = [...new Set(this.dataList.map(item => item.creatorName))].map((item, index) => {
          return {
            value: index,
            label: item
          }
        })
        list.unshift({ value: '', label: '全部' })
        this.userList = list
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
      let elementList = []
      if (!name || name === '全部') {
        elementList = JSON.parse(JSON.stringify(this.dataListCopy))
      } else {
        elementList = this.dataListCopy.filter(item => item.creatorName === name)
      }
      this.$emit('userChange', elementList)
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
