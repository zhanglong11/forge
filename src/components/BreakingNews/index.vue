<!--
 * @Description: 大事记
 * @Author:
 * @Date: 2020-01-14 15:16:27
 -->

/** 弹框的改进：2512 任务描述 目前弹框不可移动，会遮挡页面内容不太方便。需要进行修改： 1、弹框可移动。
2、遮挡的页面支持鼠标滚轮上下移动。 开发人员：李建敏 日期：2020-3月-16日 任务类型：2、复制修改代码 **/

<template>
  <div>
    <!-- 大事记插件 -->
    <el-timeline class="breaking-news">
      <el-timeline-item v-for="(item, index) in list" :key="item.id" placement="top">
        <div slot="dot">
          <div class="time-btn">
            {{ timeFilter(item.occurTime) }}
          </div>
        </div>
        <el-card
          :class="{ 'timeline-content': true, 'timeline-left': index % 2 !== 0 }"
          @click.native="watchDetails(item)"
        >
          <header class="title">{{ item.title }}</header>
          <p class="time">
            <i class="el-icon-time"></i><span>{{ item.createTime }}</span>
          </p>
          <div class="html-content" v-html="item.content"></div>
        </el-card>
        <el-dialog v-dialogDrag :lock-scroll="false" :visible.sync="newsVisible" width="60%">
          <p class="news-title">{{ newsContent.title }}</p>
          <div class="news-content" v-html="newsContent.content"></div>
        </el-dialog>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>
<script>
import api from '@/api/design/dynamic'
export default {
  name: 'BreakingNews',
  props: {
    list: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      newsVisible: false,
      newsContent: {}
    }
  },
  methods: {
    timeFilter(date) {
      return moment(date).format('YYYY-MM-DD')
    },
    async watchDetails(item) {
      let res = await api.breakingNewsDetails(item.id)
      this.newsContent = res.data
      this.newsVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.news-title {
  text-align: center;
  font-size: 23px;
  font-weight: 800;
}
.news-content {
  max-height: 400px;
  overflow: auto;
}
.html-content {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.time {
  span {
    padding-left: 4px;
  }
}
.title {
  font-size: 24px;
  color: rgb(193, 92, 54);
}
.timeline-content {
  max-height: 400px;
  overflow-y: hidden;
  width: 400px;
  margin-top: 50px;
}
.timeline-left {
  position: relative;
  left: -447px;
}
.breaking-news {
  width: 600px;
  position: relative;
  left: 50%;
}
.time-btn {
  width: 110px;
  text-align: center;
  background: #409eff;
  color: #fff;
  position: relative;
  padding: 6px;
  left: -52px;
  border-radius: 4px;
}
</style>
