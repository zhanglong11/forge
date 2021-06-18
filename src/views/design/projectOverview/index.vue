<!--
 * @Description: 项目概况
 * @Author:申豪强
 * @Date: 2020-01-14 09:38:48
 * 修改：替换地址字段
 -->
<!--
 * @任务编号: 1170||添加地址组件，地址码转码为中文地址
 * @开发人员:申豪强
 * @日期:2020-03-16
 * @任务类型: 其它人修改代码引起的BUG
 -->
<template>
  <div>
    <section>
      <Flow idSelect="projectOverview" :height="350" title="项目标题" />
    </section>
    <section class="project">
      <div class="left">
        <p class="project-title">{{ detail.name }}</p>
        <div class="project-desc">
          <el-row :gutter="4">
            <el-col :span="12">
              <span class="project-desc-label">项目编号：</span>
              <span>{{ detail.code }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">项目类型：</span>
              <span>{{ type }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">项目负责人：</span>
              <span>{{ detail.principalName }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">项目日期：</span>
              <span>{{ detail.projectDate }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">项目地址：</span>
              <span
                >{{ renderAddress(detail.address) + ' ' + (detail.detailAddress ? detail.detailAddress : '') }}
              </span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">联系电话：</span>
              <span>{{ detail.telephone }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">项目规模：</span>
              <span>{{ scale }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">勘察单位：</span>
              <span>{{
                PartiesList['construction_participantType-3'] &&
                  PartiesList['construction_participantType-3'].length &&
                  PartiesList['construction_participantType-3'][0].participateCompanyName
              }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">建设单位：</span>
              <span>{{
                PartiesList['qdhdsb'] && PartiesList['qdhdsb'].length && PartiesList['qdhdsb'][0].participateCompanyName
              }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">监理单位：</span>
              <span>{{
                PartiesList['construction_participantType-2'] &&
                  PartiesList['construction_participantType-2'].length &&
                  PartiesList['construction_participantType-2'][0].participateCompanyName
              }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">施工单位：</span>
              <span>{{
                PartiesList['construction_participantType-4'] &&
                  PartiesList['construction_participantType-4'].length &&
                  PartiesList['construction_participantType-4'][0].participateCompanyName
              }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">设计单位：</span>
              <span>{{
                PartiesList['construction_participantType-5'] &&
                  PartiesList['construction_participantType-5'].length &&
                  PartiesList['construction_participantType-5'][0].participateCompanyName
              }}</span>
            </el-col>
            <!-- <el-col :span="12">
              <span class="project-desc-label">建筑层数：</span>
              <span>{{ extInfo.buildingFloorNum }} </span>
            </el-col> -->
            <el-col :span="12">
              <span class="project-desc-label">建筑高度：</span>
              <span>{{ detail.buildingHeight }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">建筑面积（平方米）：</span>
              <span>{{ detail.buildingArea }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">结构形式：</span>
              <span>{{ detail.structuralStyle }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">工程造价（万元）：</span>
              <span>{{ detail.constructionCosts }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">抗震等级：</span>
              <span>{{ seismicLevel }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">合同开工日期：</span>
              <span>{{ detail.startTime }}</span>
            </el-col>
            <el-col :span="12">
              <span class="project-desc-label">合同竣工日期：</span>
              <span>{{ detail.endTime }}</span>
            </el-col>
            <el-col :span="24">
              <span class="project-desc-label">备注：</span>
              <span>{{ detail.remark }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="right">
        <!-- onerror方法：需要img标签src必须有值，否则加载不了 -->
        <img
          :src="detail.thumb ? detail.thumb : '/img/project-default.jpg' + '?imageView2/1/w/200/h/200'"
          class="project-img"
          :onerror="imgError"
        />
        <div class="project-status">{{ projectStatus }}</div>
      </div>
    </section>
    <div v-if="detail.projectStatus === 'projectStatus-1' && $access('ProjectStart')" class="project-btn">
      <el-button type="primary" size="medium" style="margin-right:20px" @click="projectStart">项目启动</el-button>
    </div>
  </div>
</template>
<script>
import Flow from '@/views/design/components/Flow'
import api from '@/api/design/projectOverview'
// import projectType from '@/lib/projectType'
import mapList from '_c/AddressSelect/addressList.json'
export default {
  name: 'ProjectOverview',
  components: {
    Flow
  },
  data() {
    return {
      PartiesList: {}, //参详单位
      imgError: 'this.src="' + require('../../../assets/404_images/404.png') + '"'
    }
  },
  computed: {
    detail() {
      return this.$store.state.design.projectDetail
    },
    // extInfo() {
    //   return this.$store.state.design.projectDetail.extInfo || {}
    // },
    seismicLevel() {
      //抗震等级
      return this.$getLabelFromArg('seismicLevel', this.detail.seismicLevel)
    },
    type() {
      //项目类型
      return this.$getLabelFromArg('projectType', this.detail.type)
    },
    scale() {
      //项目规模
      return this.$getLabelFromArg('projectScale', this.detail.scale)
    },
    projectStatus() {
      //  项目状态
      return this.$getLabelFromArg('projectStatus', this.detail.projectStatus)
    }
  },
  created() {
    this.getPartiesRecordList()
  },
  methods: {
    renderAddress(code) {
      let str = '-'
      if (code) {
        str = ''
        let addressArray = code.split('_')
        for (let i = 0; i < addressArray.length; i++) {
          str = str + ',' + this.getAddressNode(mapList, addressArray[i])
        }
        str = str.substr(1)
      }
      return str
    },
    getAddressNode(pca, value) {
      for (let i = 0; i < pca.length; i++) {
        if (pca[i].value === value) {
          return pca[i].label
        } else if (pca[i].children) {
          let result = this.getAddressNode(pca[i].children, value)
          if (result) {
            return result
          }
        }
      }
    },
    async projectStart() {
      let res = await api.projectStart(localStorage.getItem('projectId'))
      // 更新状态
      this.$store.dispatch('design/getProjectDetail')

      return this.$message.success('项目启动成功')
    },
    // projectFilter(type, val, timeFlag = false) {
    //   if (type === 'status') {
    //     return _.get(
    //       projectStatus.find(item => item.value === val),
    //       'label',
    //       '-'
    //     )
    //   } else if (type === 'type') {
    //     return _.get(
    //       projectType.find(item => item.value === val),
    //       'label',
    //       '-'
    //     )
    //   }
    // },
    async getProjectDetails() {
      await this.$store.dispatch('design/getProjectDetail')
    },
    async getPartiesRecordList() {
      const res = await this.axios.post('/projectParticipant/listAll', { projectId: localStorage.getItem('projectId') })
      this.PartiesList = _.groupBy(res.data || [], 'type')
    }
  }
}
</script>
<style lang="less" scoped>
.project {
  display: flex;
  justify-content: space-between;
  margin-bottom: 120px;
  &-title {
    font-size: 22px;
    font-weight: 900;
  }
  .left {
    width: 52%;
  }
  .right {
    width: 46%;
  }
  &-img {
    width: 100%;
    max-height: 350px;
  }
  &-status {
    font-size: 30px;
    color: red;
    text-align: right;
  }
  &-desc-label {
    color: rgb(153, 153, 153);
  }
  &-btn {
    position: fixed;
    bottom: 0;
    height: 70px;
    background: #fff;
    -webkit-box-shadow: 0 10px 10px lightgrey;
    box-shadow: 0 10px 10px 10px lightgrey;
    width: 100%;
    right: 0;
    text-align: right;
    line-height: 70px;
    &-button {
      margin-right: 30px;
    }
  }
  &-desc {
    /deep/ .el-col {
      padding-top: 14px;
    }
  }
}
</style>
