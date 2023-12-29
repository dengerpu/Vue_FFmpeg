<template>
  <div>
    <div class="bottom_operate_container">
      <div
        class="bottom_operate_area"
        :style="{ width: rulerSizeNumber * 100 + 'px' }"
      >
        <!-- 刻度尺 -->
        <div
          class="operate_ruler"
          :style="{ width: rulerSizeNumber * 100 + 'px' }"
          @click="ruler_click($event)"
        >
          <div
            class="ruler_scale"
            v-for="index in rulerSizeNumber"
            :key="index"
          >
            <i
              v-for="item in index < rulerSizeNumber ? 10 : 11"
              :key="item"
            ></i>
            <span class="item_scale_time">{{
              (index - 1) | filters_ItemTimezone(1)
            }}</span>
          </div>
        </div>

        <!-- 轨道区域 -->
        <div class="operate_track">
          <div class="operate_track_item video_track">视频轨道</div>
          <div class="operate_track_item">音频轨道</div>
          <div class="operate_track_item">字幕轨道</div>
          <div class="operate_track_item">图片轨道</div>
        </div>
      </div>
      <!-- 滚动的线 -->
      <vue-draggable-resizable
        :x="moveLine.x"
        :w="20"
        :h="400"
        axis="x"
        :parent="true"
        :handles="[]"
        class="run_line_content"
      >
        <div class="iconfont icon-arrow-b_fill"></div>
        <div class="run_line"></div>
      </vue-draggable-resizable>
    </div>
  </div>
</template>

<script>
const { getItemTimezoneValue } = require("../tools/getItemTimezoneValue");

export default {
  data() {
    return {
      rulerSizeNumber: 100,
      x: 15,
      y: 0,
      moveLine: {
        x: 10,
        currentTime: 0,
      },
    };
  },
  methods: {
    // 刻度尺点击事件
    ruler_click(e) {
      // 更新滚动线当前位置
      this.moveLine.x = e.x - 20;
    }
  },
  filters: {
    filters_ItemTimezone(val, currentItemTimezone) {
      return getItemTimezoneValue(val, currentItemTimezone);
    },
  },
};
</script>

<style lang="less">
.bottom_operate_container {
  position: relative;
  max-width: 1920px;
  overflow-y: auto;
  height: calc(100% - 500px);
  .run_line_content.vdr {
    border: none !important;
  }
  .run_line_content {
    z-index: 999;
    position: absolute;
    top: 0px;
    left: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    > div {
      width: 100%;
    }
    .icon-arrow-b_fill {
      color: #fff;
    }
    .run_line {
      width: 1px;
      background: #fff;
      height: 100%;
    }
  }
  .bottom_operate_area {
    // 刻度尺
    height: 100%;
    .operate_ruler {
      height: 50px;
      background: #34363b;
      box-sizing: border-box;
      padding: 10px 0 0 20px;
      display: flex;
      flex-wrap: nowrap;
      justify-content: left;
      overflow: hidden;
      .ruler_scale {
        height: 40px;
        position: relative;
        width: 200px;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-around;
        :nth-child(5n + 1) {
          height: 10px;
        }
        :nth-child(10n + 1) {
          height: 15px;
        }
        :nth-child(10) {
          height: 5px;
        }
        i {
          display: inline-block;
          width: 1px;
          background: #fafafa;
          height: 5px;
        }
        :first-child {
          margin-left: 0;
        }
        .item_scale_time {
          position: absolute;
          bottom: 0;
          left: 10px;
          color: #fafafa;
        }
      }
    }

    // 轨道
    .operate_track {
      overflow: hidden;
      height: calc(100% - 50px);
      background: #34363b;
      padding-left: 30px;
      .video_track {
        background: url("../assets/demo.png") repeat-x;
        background-size: 120px 60px;
      }
      .audio_track {
        background: url("../assets/audio-bg.png") repeat-x;
        background-size: 120px 60px;
      }
      .operate_track_item {
        background: #383a3f;
        height: 30px;
        margin: 30px 0;
        color: #ccc;
        display: flex;
        align-items: center;
        position: relative;
        .track_item_list {
          position: absolute;
          height: 100%;
          background: url("../assets/demo.png") repeat-x;
        }
      }
      .video_track {
        height: 60px;
      }

      .is_active {
        border: 2px solid orange;
      }
    }
  }
  .inputDel {
    border: none;
    position: fixed;
    left: 0;
    bottom: 20px;
    background: #34363b;
    &:focus {
      border: none;
      outline: none;
    }
  }
}
.small_operate_area {
  height: 40px;
  background: #34363b;
  border-bottom: 1px solid #1e1e1e;
  box-sizing: border-box;
  padding: 0 30px;
  color: #fff;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  padding: 0 30px;
  align-items: center;
  .operate_btn_right {
    display: flex;
    align-items: center;
    height: 100%;
    .block {
      width: 200px;
      padding-left: 20px;
    }
  }
  .playbtn {
    color: #fff;
    font-size: 30px;
    margin-right: 150px;
  }
}
</style>