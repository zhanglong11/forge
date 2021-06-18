<!--
 * @Description: 头部右侧导航栏
 * @Version:
 * @Autor: 席阳冰星
 * @Date: 2020-04-22 09:32:49
 * @LastEditTime: 2020-05-25 10:17:25
 -->
<!--
  @任务名称: 3006/版本管理，二三维对比；合并模型，版本对比
  @开发人员: 席阳冰星
  @修改日期: 2020-04-23
-->
<template>
  <div class="navigation-content-box">
    <ul class="navigation-ul">
      <li v-for="item in ulOne" :key="item.content" @click="navigationChange(item)">
        <el-tooltip class="item" effect="dark" :content="item.content" placement="top">
          <img :src="item.url" alt="" />
        </el-tooltip>
      </li>
    </ul>
    <ul class="navigation-ul">
      <li v-for="item in ulTwo" :key="item.content" @click="navigationChange(item)">
        <el-tooltip class="item" effect="dark" :content="item.content" placement="top">
          <img :src="item.url" alt="" />
        </el-tooltip>
      </li>
    </ul>
    <ul class="navigation-ul">
      <li v-for="item in ulThree" :key="item.content" @click="navigationChange(item)">
        <el-tooltip class="item" effect="dark" :content="item.content" placement="top">
          <img :src="item.url" alt="" />
        </el-tooltip>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Navigation',
  data() {
    return {
      ulOne: [
        {
          content: '版本管理',
          key: 'versionManage',
          class: 'el-icon-info',
          url: '/static/bim/nav/version.png'
        },
        {
          content: '过滤器',
          key: 'strainer',
          class: 'el-icon-eleme',
          url: '/static/bim/nav/filter.png'
        },
        {
          content: '数据管理',
          key: 'dataManagement',
          class: 'el-icon-setting',
          url: '/static/bim/nav/data.png'
        },
        {
          content: '视点管理',
          key: 'viewpoint',
          class: 'el-icon-setting',
          url: '/static/bim/nav/viewpoint.png'
        },
        {
          content: '视觉效果',
          key: 'visualEffect',
          class: 'el-icon-warning',
          url: '/static/bim/nav/vision.png'
        }
      ],
      ulTwo: [
        {
          content: '标注',
          key: 'mark',
          class: 'el-icon-info',
          url: '/static/bim/nav/label.png'
        },
        {
          content: '批注',
          key: 'annotation',
          class: 'el-icon-eleme',
          url: '/static/bim/nav/postil.png'
        },
        {
          content: '标记',
          key: 'sign',
          class: 'el-icon-setting',
          url: '/static/bim/nav/mark.png'
        }
      ],
      ulThree: [
        {
          content: '辅助视图',
          key: 'auxiliary',
          class: 'el-icon-info',
          url: '/static/bim/nav/assist.png'
        },
        {
          content: '合模',
          key: 'compoundDie',
          class: 'el-icon-folder-add',
          url: '/static/bim/nav/merge.png'
        },
        {
          content: '对比',
          key: 'compare',
          class: 'el-icon-document-copy',
          url: '/static/bim/nav/compare.png'
        },
        {
          content: '构件编辑',
          key: 'componentEdit',
          class: 'el-icon-setting',
          url: '/static/bim/nav/edit.png'
        },
        {
          content: '碰撞分析',
          key: 'crash',
          class: 'el-icon-eleme',
          url: '/static/bim/nav/crash.png'
        },
        {
          content: '统计分析',
          key: 'statistics',
          class: 'el-icon-warning',
          url: '/static/bim/nav/chart.png'
        }
      ]
    }
  },
  computed: {
    bimfishApp3D() {
      return this.$store.state.bim.bimfishApp
    }
  },
  methods: {
    navigationChange(e) {
      this.bimfishApp3D.viewer.disableSelection(true) //切换tab场景默认关闭
      this.$emit('navigationChange', e)
    }
  }
}
</script>

<style lang="less" scoped>
.navigation-content-box {
  position: absolute;
  right: 58px;
  top: calc(50% - 13px);
}
.navigation-ul {
  float: left;
  img {
    height: 26px;
    width: 26px;
  }
  li {
    height: 26px;
    float: left;
    padding: 0 10px;
    cursor: pointer;
  }
}
</style>
