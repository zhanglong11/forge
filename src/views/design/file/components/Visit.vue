<!--
 * @Description: 授权管理
 * @Author:
 * @Date: 2020-01-22 15:34:26
 -->
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
  <div>
    <el-dialog
      v-dialogDrag
      :lock-scroll="false"
      title="授权管理"
      :visible.sync="visitFlag"
      width="800px"
      @close="close"
    >
      <div class="content-body">
        <el-table
          :data="tableData"
          style="width: 100%;margin-bottom: 20px;"
          row-key="id"
          border
          default-expand-all
          :tree-props="{ children: 'userList' }"
        >
          <el-table-column prop="name" label="参与人员" header-align="center" width="140px"></el-table-column>
          <!-- 这里写权限列表 -->
          <el-table-column label="操作权限" header-align="center">
            <template slot-scope="scope">
              <el-checkbox-group v-model="scope.row.list" :disabled="scope.row.disabledFlag">
                <el-checkbox
                  v-for="(item, index) in privilegeList"
                  :key="item.id"
                  :label="item.id"
                  @change="
                    val => {
                      checkChange(val, index, scope.row)
                    }
                  "
                  >{{ item.name }}</el-checkbox
                >
              </el-checkbox-group>
            </template>
            <!-- <template slot-scope="scope">{{ scope.row }}</template> -->
          </el-table-column>
        </el-table>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="visitFlag = false">取 消</el-button>
        <!-- 
           * @任务编号: 2795 | 非超管且不拥有权限，不能选择只能取消
           * @开发人员:申豪强
           * @日期:2020-04-09
           * @代码类型：功能调整
            -->
        <el-button
          v-show="userInfo.companyAdminFlag || (accessList && accessList.some(item => item === 'access'))"
          type="primary"
          @click="submitJudge"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import api from '@/api/design/file'
export default {
  props: {
    // table数据：copy一份
    userList: {},
    // 文件夹所属模块
    module: {},
    // 里程碑id
    taskUniqueId: {},
    // 一级部门id
    departmentId: {}
  },
  data() {
    return {
      // 当前用户关于此文件夹的权限，用来限制是否可点击
      accessList: [],
      visitFlag: false,
      tableData: [],
      // 权限list
      /*
       * @任务编号: 2795 | 后面包含前面权限：浏览（访问、预览）、下载、创建（上传、新建文件夹）、重命名、删除、授权
       * @开发人员:申豪强
       * @日期:2020-04-02
       * @代码类型：功能调整
       */
      privilegeList: [
        {
          name: '浏览',
          id: 'select'
        },
        {
          name: '下载',
          id: 'download'
        },
        {
          name: '创建',
          id: 'upload'
        },
        {
          name: '重命名',
          id: 'rename'
        },
        {
          name: '删除',
          id: 'delete'
        },
        {
          name: '授权',
          id: 'access'
        }
      ],
      copy: [],
      folderId: ''
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    }
  },
  watch: {
    userInfo(val) {
      console.log('userInfo', val)
    },
    visitFlag(val) {
      console.log('userInfo', this.userInfo)
      if (val) {
        let copy = JSON.parse(JSON.stringify(this.userList))
        if (this.userInfo.companyAdminFlag) {
          //超管
          this.copy = copy
        } else {
          /*
           * @任务编号: 2795 | 本人不能修改自己的权限，非超管且不拥有权限，不能选择只能取消
           * @开发人员:申豪强
           * @日期:2020-04-09
           * @代码类型：功能调整
           */
          // 非超管：显示此单位底下的
          let arr = copy.filter(item => item.id === this.departmentId)
          if (arr.length === 1) {
            let accessFlag = false
            if (this.accessList) {
              accessFlag = this.accessList.some(item => item === 'access')
            }
            // 如果不拥有此权限
            if (!accessFlag) {
              arr[0].userList.forEach(item => {
                item.disabledFlag = true
              })
            }
            let index = arr[0].userList.findIndex(item => item.id === this.userInfo.id)
            if (index > -1) {
              // 不让当前用户设置自己的权限
              arr[0].userList[index].disabledFlag = true
              // 这是前端自己设置全部权限，这是不对的，但后台返回对应权限bug未修复，只能前端先改着。 申豪强 2020-04-23
              arr[0].userList[index].list = ['select', 'download', 'upload', 'rename', 'delete', 'access']
            }
          }
          this.copy = arr
        }
        this.getAccess()
      }
    }
  },
  methods: {
    /*
     * @任务编号: 2795 | 后面包含前面权限，前面取消，后边也取消
     * @开发人员:申豪强
     * @日期:2020-04-02
     * @代码类型：功能调整
     */
    checkChange(flag, index, item) {
      let list = []
      for (let i = 0; i < this.privilegeList.length; i++) {
        if (flag) {
          // 选中的
          if (i <= index) {
            list.push(this.privilegeList[i].id)
          } else {
            break
          }
        } else {
          // 取消的
          if (i < index) {
            list.push(this.privilegeList[i].id)
          } else {
            break
          }
        }
      }
      item.list = list
      this.$set(item, 'list', list)
    },
    async getAccess() {
      let res = await api.getAccess(this.folderId)
      let accessObj = res.data
      console.log(_.cloneDeep(this.copy))
      if (!_.isEmpty(accessObj)) {
        this.copy.forEach(item => {
          item.userList.forEach(userItem => {
            userItem.list = accessObj[userItem.id] ? accessObj[userItem.id] : []
          })
        })
      }
      this.tableData = this.copy
      console.log('tableData', this.tableData)
    },
    async submitJudge() {
      // let obj = {
      //   accessType: '', //权限
      //   departmentId: '', //一级部门id
      //   folderId: '', //文件夹id
      //   module: '', //unit自定义，pigeonhole归档，share分享，collaboration外部协作
      //   projectId: '', //项目id
      //   taskUniqueId: '', //里程碑id
      //   userId: ''
      // }
      // 聚集所有用户
      let userList = this.tableData.map(item => {
        return item.userList.map(userItem => {
          userItem.folderId = this.folderId
          userItem.module = this.module
          userItem.departmentId = this.departmentId
          userItem.taskUniqueId = this.taskUniqueId
          userItem.projectId = localStorage.getItem('projectId')
          userItem.userId = userItem.id
          userItem.accessType = userItem.list.join(',')
          return userItem
        })
      })
      let list = [].concat.apply([], userList)
      let res = await api.setAccess(list)
      this.$message.success('设置成功')
      this.close()
    },
    show(id, accessList) {
      this.folderId = id
      this.visitFlag = true
      this.accessList = accessList
    },
    async getUserList() {
      let obj = {
        prokectId: localStorage.getItem('projectId')
      }
      let res = await api.getUserList(obj)
      console.log(res)
      this.tableData = res.data
    },
    close() {
      this.visitFlag = false
    }
  }
}
</script>
<style lang="less" scoped>
.content-body {
  max-height: 400px;
  overflow-y: auto;
}
</style>
