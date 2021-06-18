<!--
 * @Description: 输入提取码，获取文件
 * @Author:申豪强
 * @Date: 2020-01-20 17:33:47
 * 改动：修复下载功能、添加分享功能（可以复制二维码、下载图片）
 -->
<!--
 * @任务编号:2526 || 设计模块功能调整
 * @开发人员:申豪强
 * @日期:2020-03-16
 * @任务类型: 新增代码
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
    <div v-if="bgShow" class="bg">
      <div class="form">
        <p class="label">请输入提取码：</p>
        <div class="flex">
          <p>
            <el-input v-model="code" />
          </p>
          <p>
            <el-button type="primary" @click="getFilder(null)">提取文件</el-button>
          </p>
        </div>
      </div>
    </div>
    <div v-else class="table-content">
      <div class="flex">
        <span>当前位置：</span>
        <el-breadcrumb>
          <el-breadcrumb-item v-for="(item, index) in list" :key="index">
            <span class="point" @click.capture="breadcrumbClick(item, index)">{{ item.name }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <p class="title">分享文件列表</p>
      <Table
        ref="table"
        v-loading="tableLoading"
        :tableData="tableData"
        :pageQuery="pageQuery"
        :total="total"
        rowId="id"
        :columns="tableColumn"
        @selectionChange="selectionChange"
        @pageChange="pageChange"
      />
    </div>
    <!-- 分享modal -->
    <el-dialog
      v-dialogDrag
      :lock-scroll="false"
      title="分享"
      :visible.sync="shareVisible"
      width="600px"
      @close="handleClose"
    >
      <div class="share-title">
        <el-row :gutter="6">
          <el-col :span="16">
            <el-input v-model="copyContent" style="display:block;width:100%"></el-input>
          </el-col>
          <el-col :span="8" style="text-align:right">
            <el-button v-copy="clipOptions" style="display:inline-block;" type="primary">复制</el-button>
          </el-col>
        </el-row>
      </div>
      <div class="qrCode">
        <div id="qrCode-img" class="qrCode-img"></div>
      </div>
      <div class="btn-box">
        <el-button type="primary" @click="downloadImg">下载</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import QRCode from 'qrcodejs2'
import filesize from 'filesize'
import api from '@/api/design/file'
import indexApi from '@/api/design/index'
import PageMixin from '@/mixins/pageMixin'
import treeFindPath from '@/utils/treeFindPath'
export default {
  mixins: [PageMixin],
  data() {
    return {
      // 拷贝链接
      copyContent: '',
      // 图片名字
      imgName: '',
      shareVisible: false,
      clipOptions: {
        copyContent: this,
        success: e => {
          this.$message.success('复制成功')
        },
        error: () => {
          this.$message.error('复制失败')
        }
      },
      tableDataAll: [],
      // 当前位置
      list: [
        {
          name: '首页',
          id: ''
        }
      ],
      code: sessionStorage.getItem('code') ? sessionStorage.getItem('code') : null,
      bgShow: true,
      requestFlag: false,
      // 表格表头
      tableColumn: [
        // { type: 'selection', width: 50 },
        {
          prop: 'title',
          label: '文件名称',
          render: (h, params) => {
            if (!params.row.fileSize) {
              return h(
                'a',
                {
                  props: {
                    type: 'text'
                  },
                  attrs: {
                    href: 'javascript:;'
                  },
                  on: {
                    click: e => {
                      e.stopPropagation()
                      // 更新当前位置
                      this.getHistoryPath(params.row.id)
                      // 更新table
                      this.updateTable(params.row.id)
                    }
                  }
                },
                params.row.title
              )
            } else {
              if (params.row.title.indexOf('.rvt') > -1 || params.row.title.indexOf('.dwg') > -1) {
                return h(
                  'a',
                  {
                    props: {
                      href: 'javascript:;'
                    },
                    on: {
                      click: e => {
                        e.stopPropagation()
                        this.lightWeight(params.row)
                      }
                    }
                  },
                  params.row.title
                )
              } else {
                return h('div', params.row.title)
              }
            }
          }
        },
        { prop: 'fileTag', label: '标签' },
        {
          prop: 'fileSize',
          label: '大小',
          render: (h, { row }) => {
            console.log(filesize(row.fileSize * 1024))
            if (!row.fileSize) {
              return h('div', {}, '-')
            } else {
              return h('div', {}, filesize(row.fileSize))
            }
          }
        },
        { prop: 'createName', label: '上传人' },
        { prop: 'createTime', label: '上传时间' },
        {
          prop: '',
          label: '操作',
          render: (h, params) => {
            let downLoad = h(
              'el-button',
              {
                props: {
                  type: 'text'
                },
                on: {
                  click: e => {
                    e.stopPropagation()
                    this.downLoad(params.row.id, params.row.title)
                  }
                }
              },
              '下载'
            )
            let copy = h(
              'el-button',
              {
                props: {
                  type: 'text'
                },
                on: {
                  click: e => {
                    e.stopPropagation()
                    this.shareShow(params.row)
                  }
                }
              },
              '分享'
            )
            return h('div', [params.row.fileSize ? downLoad : null, params.row.fileSize ? copy : null])
          }
        }
      ]
    }
  },
  methods: {
    /*
     * @任务编号:2526 || 设计模块功能调整
     * @开发人员:申豪强
     * @日期:2020-03-16
     * @任务类型: 新增代码
     */
    async shareShow(row) {
      // 轻量化链接
      if (row.title.indexOf('.rvt') > -1 || row.title.indexOf('.dwg') > -1) {
        if (row.dexpStatus === 0 || row.dexpStatus === 3 || _.isNull(row.dexpStatus)) {
          //尚未轻量化
          return this.$message.error('文件尚未轻量化或轻量化失败')
        } else if (row.dexpStatus === 1) {
          return this.$message.warning('轻量化处理中')
        } else {
          let res = await api.getConvertRecordByFileId(row.id)
          this.shareVisible = true
          // 等待地址
          this.copyContent = res.data.viewLink
          this.imgName = row.title.split('.')[0]
          this.$nextTick(() => {
            this.qrcode()
          })
        }
      } else {
        // 一般预览链接
        let res = await indexApi.previewOss(row.commonFileId)
        if (res.data) {
          const a = document.createElement('a')
          a.href = URL.createObjectURL(res.data)
          a.click()
        }
      }
    },
    // 轻量化
    async lightWeight(row) {
      if (row.dexpStatus === 0 || row.dexpStatus === 3 || _.isNull(row.dexpStatus)) {
        //尚未轻量化
        // let res = await api.changeConvertRecordByFileId(row.commonFileId, localStorage.getItem('projectId'))
        // this.reset()
        return this.$message.error('文件尚未轻量化或轻量化失败')
      } else if (row.dexpStatus === 1) {
        return this.$message.warning('轻量化处理中')
      } else {
        let res = await api.getConvertRecordByFileId(row.commonFileId)
        const a = document.createElement('a')
        a.href = res.data.viewLink
        a.target = '_blank'
        a.click()
      }
    },
    // base64下载
    downloadFile(content, fileName) {
      let base64ToBlob = function(code) {
        let parts = code.split(';base64,')
        let contentType = parts[0].split(':')[1]
        let raw = window.atob(parts[1])
        let rawLength = raw.length
        let uInt8Array = new Uint8Array(rawLength)
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i)
        }
        return new Blob([uInt8Array], {
          type: contentType
        })
      }
      let aLink = document.createElement('a')
      let blob = base64ToBlob(content)
      let evt = document.createEvent('HTMLEvents')
      evt.initEvent('click', true, true) //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
      aLink.download = fileName
      aLink.href = URL.createObjectURL(blob)
      aLink.click()
    },
    downloadImg() {
      let href = document.querySelector('#qrCode-img img').getAttribute('src')
      this.downloadFile(href, this.imgName)
    },
    // 生成二维码
    qrcode() {
      let that = this
      new QRCode('qrCode-img', {
        width: 400,
        height: 400, // 高度
        text: that.copyContent // 二维码内容
      })
    },
    handleClose() {
      this.shareVisible = false
    },
    findNode(tree, func) {
      if (!tree) return {}
      for (const data of tree) {
        console.log(data)
        if (func(data)) return data
        if (data.children) {
          const findChildren = treeFindPath(data.children, func)
          if (findChildren.length) return findChildren
        }
      }
      return {}
    },
    // 获取历史路径信息
    getHistoryPath(id) {
      let data = treeFindPath(this.tableDataAll, e => e.id === id)
      console.log(data)
      let obj = {
        name: '首页',
        id: ''
      }
      data.unshift(obj)
      if (data.length > 0) {
        this.list = data
      }
    },
    // 更新table
    updateTable(id, index) {
      if (index === 0) {
        let copy = JSON.parse(JSON.stringify(this.tableDataAll))
        this.tableData = copy.map(item => {
          delete item.children
          return item
        })
      } else {
        let res = this.findNode(this.tableDataAll, e => e.id === id)
        let data = res.children ? res.children : []
        this.tableData = data
      }
    },
    downLoad(id, name) {
      const a = document.createElement('a')
      api.download(id).then(res => {
        a.href = URL.createObjectURL(res.data)
        a.download = name
        a.click()
      })
    },
    pageChange(e) {
      this.pageQuery.page = e
      this.tableData = _.chunk(this.tableDataAll, this.pageQuery.rows)[e - 1]
    },
    breadcrumbClick(e, index) {
      this.updateTable(e.id, index)
      this.getHistoryPath(e.id)
    },
    async getFilder(pid) {
      let obj = {
        password: this.code,
        pid: pid ? pid : '0'
      }
      if (!this.code) return this.$message.error('提取码必填')
      let res = await api.selectExternalCollaborationFile(obj)
      console.log(res)
      if (res.code === 200) {
        // 存储在session中，关闭页面即清除
        sessionStorage.setItem('code', this.code)
        this.tableDataAll = res.data
        let copy = JSON.parse(JSON.stringify(this.tableDataAll))
        this.tableData = copy.map(item => {
          if (item.children || _.isNull(item.children)) {
            // 文件夹
            item.type = 1
          } else {
            // 文件
            item.type = 2
          }
          delete item.children
          return item
        })
        this.bgShow = false
      }
    }
  }
}
</script>
<style lang="less" scoped>
.dialog-footer {
  padding: 0;
}
.btn-box {
  text-align: center;
  padding-top: 20px;
}
.share-title {
  padding-bottom: 10px;
}
.qrCode {
  text-align: center;
  &-img {
    width: 400px;
    height: 400px;
    margin: auto;
    padding-top: 10px;
  }
}
.point {
  cursor: pointer;
  color: #409eff;
}
.title {
  text-align: center;
  font-size: 30px;
  padding: 20px;
}
.table-content {
  padding: 64px;
}
.flex {
  display: flex;
  // justify-content: space-between;
  align-items: center;
  p:nth-child(1) {
    width: 70%;
  }
  padding-top: 16px;
  padding-bottom: 20px;
}
.bg {
  width: 100%;
  height: 100%;
  background-color: lightblue;
  position: relative;
}
.form {
  width: 460px;
  position: absolute;
  left: 50%;
  top: 300px;
  transform: translateX(-50%);
  background-color: #fff;
  border-radius: 5px;
  padding: 30px 18px;
}
.label {
  font-size: 15px;
  padding-bottom: 8px;
}
.code {
  width: 200px;
  border: 1px solid #f2f2f2;
  padding: 8px 10px;
  height: 19px;
  line-height: 19px;
  border-radius: 4px;
}
</style>
