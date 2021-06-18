<!--
/*
 弹框的改进：2512
 任务描述 目前弹框不可移动，会遮挡页面内容不太方便。需要进行修改：
 1、弹框可移动。
 2、遮挡的页面支持鼠标滚轮上下移动。
 开发人员：李建敏
 日期：2020-3月-16日
 任务类型：2、复制修改代码 1行
*/
-->
<template>
  <el-dialog
    v-dialogDrag
    :lock-scroll="false"
    :title="id ? '编辑' : '新建'"
    width="1000px"
    :visible="visible"
    destroy-on-close
    @opened="refresh"
    @close="close"
  >
    <div id="process-edit">
      <el-form ref="form" label-positon="left" label-width="60px" :model="form" :rules="rules">
        <el-form-item label="名称" prop="processName">
          <el-input v-model="form.processName"></el-input>
        </el-form-item>
        <el-form-item label="分组" prop="processGroupId">
          <el-cascader v-model="form.processGroupId" :props="{ emitPath: false }" :options="treeData"></el-cascader>
        </el-form-item>
        <el-form-item label="抄送人" prop="carbonList">
          <SelectUser v-model="form.carbonList" style="width: 300px;"></SelectUser>
        </el-form-item>
        <el-form-item label="流程" prop="stages">
          <vxe-table
            ref="table"
            rowKey
            row-id="_XID"
            :edit-rules="tableRules"
            :data="form.stages"
            :edit-config="{ trigger: 'click', mode: 'row' }"
          >
            <vxe-table-column width="80px">
              <el-button class="my-handle" icon="el-icon-rank"></el-button>
            </vxe-table-column>
            <vxe-table-column title="阶段" width="60px" type="seq"></vxe-table-column>
            <vxe-table-column title="阶段名" field="stageName" :edit-render="{ name: 'ElInput' }"> </vxe-table-column>
            <vxe-table-column
              title="审批方式"
              field="passFlag"
              width="120px"
              :edit-render="{
                name: 'ElSelect',
                options: [
                  {
                    label: '全部同意',
                    value: 1
                  },
                  {
                    label: '单人同意',
                    value: 2
                  }
                ]
              }"
            >
            </vxe-table-column>
            <vxe-table-column title="审核人员" width="400px" field="auditorList">
              <SelectUser
                v-model="row.auditorList"
                slot-scope="{ row }"
                :options="{ id: 'userId', label: 'name' }"
                style="width: 100%;"
              ></SelectUser>
            </vxe-table-column>
            <vxe-table-column width="80px">
              <template slot-scope="{ rowIndex }">
                <el-button type="danger" icon="el-icon-close" @click="form.stages.splice(rowIndex, 1)"></el-button>
              </template>
            </vxe-table-column>
          </vxe-table>
          <el-button
            style="margin-top: 15px;"
            @click="() => form.stages.push({ uuid: new Date().getTime(), stageName: '', passFlag: 2, auditorList: [] })"
          >
            添加一行
          </el-button>
        </el-form-item>
      </el-form>
      <footer>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">{{ id ? '保存' : '新建' }}</el-button>
      </footer>
    </div>
  </el-dialog>
</template>

<script>
import Sortable from 'sortablejs'
export default {
  name: 'Edit',
  props: {
    id: String,
    visible: Boolean
  },
  data() {
    return {
      form: {
        stages: [{ uuid: 'one', stageName: '', passFlag: 2, auditorList: [] }],
        carbonList: []
      },
      rules: {
        processName: [{ required: true, message: '必填' }],
        processGroupId: [{ required: true, message: '必填' }]
      },
      tableRules: {
        stageName: [{ required: true, message: '必填' }],
        passFlag: [{ required: true, message: '必填' }],
        auditorList: [{ required: true, message: '必填' }]
      }
    }
  },
  computed: {
    treeData() {
      return this.$store.state.design.processGroupListTree
    }
  },
  created() {
    this.originForm = _.cloneDeep(this.form)
  },
  methods: {
    async refresh() {
      if (this.id) {
        await this.axios.design.get('process/template/get/' + this.id).then(res => {
          res.data.stages.forEach(f => {
            f.auditorList = (f.auditorList || []).map(g => {
              g.id = g.userId
              g.label = g.name
              return g
            })
          })
          res.data.carbonList = (res.data.carbonList || []).map(g => {
            g.id = g.userId
            g.label = g.name
            return g
          })
          this.form = res.data
        })
      }
      this.bindSortable()
    },
    async submit() {
      await this.$refs.form.validate()
      await this.$refs.table.validate()
      let form = _.cloneDeep(this.form)
      form.stages = form.stages.filter(e => !_.isEmpty(e))
      form.stages.forEach((e, index) => {
        e.stageSeq = index + 1
        e.auditorList = (e.auditorList || []).map(node => ({
          userId: node.id,
          name: node.name
        }))
      })
      form.carbonList = (form.carbonList || []).map(node => ({
        userId: node.id,
        name: node.name
      }))
      await this.axios.design.post('process/template/' + (this.id ? 'update' : 'add'), {
        projectId: localStorage.getItem('projectId'),
        ...form
      })
      this.$message.success(this.id ? '保存成功' : '创建成功')
      this.$parent.refresh()
      this.close()
    },
    bindSortable() {
      const table = this.$refs.table.$el.querySelector('.vxe-table--body tbody')
      Sortable.create(table, {
        handle: '.my-handle',
        onEnd: ({ newIndex, oldIndex }) => {
          const targetRow = this.form.stages.splice(oldIndex, 1)[0]
          this.form.stages.splice(newIndex, 0, targetRow)
        }
      })
    },
    close() {
      this.form = _.cloneDeep(this.originForm)
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped lang="less">
.vxe-table {
  /deep/ .vxe-table--body-wrapper {
    overflow: visible;
  }
}
</style>
