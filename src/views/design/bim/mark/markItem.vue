<!--
 * @Description:
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-04-28 09:41:14
 * @LastEditTime: 2020-05-26 18:01:50
 -->
<!--
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-24
@任务类型: 全新代码，添加标注列表组件
-->
<template>
  <div class="mark-item">
    <el-tooltip effect="light" :content="item.name" placement="top" :disabled="item.name.length > 4 ? false : true">
      <div>
        {{ item.name }}
      </div>
    </el-tooltip>
    <el-tooltip
      effect="light"
      :content="item.creatorName"
      placement="top"
      :disabled="item.creatorName.length > 4 ? false : true"
    >
      <div>{{ item.creatorName }}</div>
    </el-tooltip>

    <div>{{ moment(item.createTime).format('YYYY-MM-DD') }}</div>

    <div class="handle">
      <div>
        <el-switch v-model="item.toggle" @change="toggleChange"> </el-switch>
      </div>
      <el-button type="text" @click="deleteBimLabel">删除</el-button>
    </div>
  </div>
</template>

<script>
import api from '@/api/bim/label'
export default {
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      visibleHandle: false,
      tableData: []
    }
  },
  created() {},
  methods: {
    toggleChange(e) {
      if (!this.item.id) return
      api.detailBimLabel(this.item.id).then(res => {
        res.data.forEach((item, index) => {
          if (item.type === 1 || item.type === 2) {
            this.$emit('showMarkSnap', item, e)
          } else {
            this.$emit('showMarkPoint', item, e)
          }
        })
      })
    },
    deleteBimLabel() {
      this.$confirm('是否删除此标注', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteSure()
        })
        .catch(() => {
          console.log('取消')
        })
    },
    async deleteSure() {
      let res = await api.deleteBimLabel(this.item.id)
      this.$message.success('删除成功')
      this.$emit('updateLabelList')
    },
    handleMouseenter() {
      this.visibleHandle = true
    },
    handleMouseleave() {
      this.visibleHandle = false
    }
  }
}
</script>

<style lang="less" scoped>
.mark-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  background: #fff;
  height: 38px;
  line-height: 38px;
  border-radius: 4px;
  cursor: default;
  margin-bottom: 8px;

  > div:nth-child(1) {
    padding-left: 10px;
    width: 30%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  > div:nth-child(2) {
    width: 20%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  > div:nth-child(3) {
    /*padding-right: 10px;*/
    width: 25%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .handle {
    display: flex;
    justify-content: space-between;
    .el-switch {
      margin-right: 10px;
    }
    .el-button {
      padding-right: 10px;
    }
  }
}
</style>
