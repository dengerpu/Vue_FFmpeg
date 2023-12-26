<template>
  <div class="video-cut" crossorigin="“anonymous”">
    <!--    <span v-tip="123">2222</span>
        <i class="iconfont icon-lkingboxiaojianzi"></i>-->
    <template v-if="!options.sources[0].src">
      <input
        v-show="false"
        id="pop_video"
        type="file"
        accept="video/mp4"
        @change="getVideo"
        name="fileTrans"
        ref="file"
        value=""
      />
    </template>
    <input
      v-show="false"
      id="pop_pic"
      type="file"
      accept="image/*"
      @change="getPic"
      name="filePic"
      ref="filePic"
      value=""
    />
    <input
      v-show="false"
      id="pop_audio"
      type="file"
      accept="audio/mpeg"
      @change="getAudio"
      name="fileAudio"
      ref="fileAudio"
      value=""
    />
    <div style="padding: 30px 40px">
      <div class="content">
        <!--头部菜单-->
        <div v-if="options.sources[0].src" class="block-top">
          <div class="toolbar">
            <div
              class="tool-item"
              @click="changeCurrentType('cut')"
              :class="{ active: currentType == 'cut' }"
              v-tip.top.dark.hover="'裁剪视频'"
            >
              <i class="iconfont icon-cut"></i><span class="i-name">裁剪</span>
            </div>
            <div
              class="tool-item"
              @click="changeCurrentType('snapshot')"
              :class="{ active: currentType == 'snapshot' }"
              v-tip.top.dark.hover="'屏幕快照'"
            >
              <i class="iconfont icon-post_pic"></i>
            </div>
            <div
              class="tool-item"
              @click="changeCurrentType('addimg')"
              :class="{ active: currentType == 'addimg' }"
              v-tip.top.dark.hover="'上传水印图片'"
            >
              <i class="iconfont icon-ai-up-img"></i>
            </div>
            <div
              class="tool-item"
              @click="changeCurrentType('audio')"
              :class="{ active: currentType == 'audio' }"
              v-tip.top.dark.hover="'音频'"
            >
              <i class="iconfont icon-yinpinbofang"></i>
            </div>
          </div>
          <div class="toolbar-right">
            <div
              class="reset tool-item"
              v-tip.top.dark.hover="'回到初始状态'"
              @click="reset"
            >
              <i class="iconfont icon-chexiao" style="margin-right: 5px"></i>重置
            </div>
            <div
              class="tool-item"
              v-tip.top.dark.hover="'关闭项目'"
              @click="closeProject"
            >
              <i class="iconfont icon-guanbi111"></i>
            </div>
          </div>
        </div>
        <!--视频部分-->
        <div v-if="options.sources[0].src" class="video-content">
          <div class="video_box">
            <div class="video-name">{{ videoInfo.baseInfo.name }}</div>
            <div style="position: relative">
              <video ref="videoPlayer" class="video-js"></video>
              <!--因为视频大小是动态的，所以dragable-area的大小也是不断变化的-->
              <div
                class="dragable-area"
                :style="{
                  width: videoInfo.baseInfo.width + 'px',
                  left: 'calc((100% - ' + videoInfo.baseInfo.width + 'px)/2)',
                }"
              >
                <!--判断是不是需要展示可编辑水印部分内容-->
                <template>
                  <vue-draggable-resizable
                    v-if="waterPicInfo.source"
                    :draggable="currentType === 'addimg'"
                    :resizable="currentType === 'addimg'"
                    style="position: absolute"
                    :w="waterPicWidth"
                    :h="50"
                    :x="10"
                    :y="10"
                    :min-width="50"
                    :min-height="50"
                    :grid="[10, 10]"
                    :parent="true"
                    @dragging="onDrag"
                    @resizing="onResize"
                  >
                    <i
                      v-if="currentType === 'addimg'"
                      class="iconfont icon-guanbi111 clear-water"
                      @click="
                        waterPicInfo = {
                          source: null,
                          x: 10,
                          y: 10,
                          width: null,
                          height: 50,
                        }
                      "
                    ></i>
                    <img
                      :src="waterPicInfo.source"
                      style="width: 100%; height: 100%"
                      :style="{
                        opacity: waterPicInfo.opacity ? waterPicInfo.opacity / 100 : 1,
                      }"
                    />
                  </vue-draggable-resizable>
                </template>
                <div></div>
              </div>
            </div>
          </div>
        </div>
        <!--底部变化的菜单-->
        <div v-show="options.sources[0].src">
          <!--轨道区域-->
          <div class="track-wrap">
            <div class="components_video-navigation navigation">
              <div class="component_storyboard storyboard">
                <!--视频的帧数组-->
                <div class="frames">
                  <div
                    class="frame loaded"
                    style="width: 80px; height: 50px"
                    v-for="(item, index) in 13"
                    :key="index"
                  >
                    <img
                      :src="videoInfo.waterFrames[index]"
                      v-if="videoInfo.waterFrames[index]"
                      class="loaded"
                    />
                  </div>
                </div>
              </div>
              <div class="drag-frames">
                <ul class="box" ref="box">
                  <li class="left" ref="left"></li>
                  <li class="mid" ref="mid">
                    <div class="resize" ref="resize"></div>
                    <div
                      class="youbiao"
                      ref="youbiao"
                      :style="{ left: youbiaoLeft }"
                      style="height: 50px; border-left: 1px solid #ffffff"
                    ></div>
                    <div
                      class="youbiao-time"
                      ref="youbiaotime"
                      :style="{ left: youbiaoLeft }"
                      v-if="player"
                    >
                      {{ transTimeCom }}
                    </div>
                    <div class="resize2" ref="resize2"></div>
                  </li>
                  <li class="right" ref="right"></li>
                </ul>
              </div>
            </div>
          </div>
          <!--底部操作菜单-->
          <div class="bottom-nav">
            <div style="display: flex">
              <!--控制视频播放的菜单-->
              <div
                class="play-btn bottom-nav-item"
                @click="!playStatus ? player.play() : player.pause()"
              >
                <i class="iconfont icon-bofang" v-if="!playStatus"></i>
                <i class="iconfont icon-weibiaoti519" v-else></i>
              </div>
              <!--cut视频的部分-->
              <template v-if="currentType === 'cut'">
                <div class="bottom-nav-item" style="padding: 0 20px; display: flex">
                  <step
                    @addSecond="addSecond"
                    :type="'start'"
                    @delSecond="delSecond"
                    :initval="videoInfo.controlInfo.start"
                    style="margin-right: 10px"
                    :min="0"
                    :max="videoInfo.controlInfo.end"
                  ></step>
                  <step
                    @addSecond="addSecond"
                    :type="'end'"
                    @delSecond="delSecond"
                    :initval="videoInfo.controlInfo.end"
                    :min="videoInfo.controlInfo.start"
                    :max="videoInfo.baseInfo.duration"
                  ></step>
                </div>
              </template>
              <!--屏幕快照部分-->
              <template v-if="currentType === 'snapshot'">
                <div class="bottom-nav-item" @click="makePhoto">
                  <i class="iconfont icon-post_pic" style="margin-right: 10px"></i>
                  下载快照
                </div>
              </template>
              <!--添加水印图片部分-->
              <template v-if="currentType === 'addimg'">
                <div class="bottom-nav-item" @click="selectPic">
                  <i class="iconfont icon-ai-up-img" style="margin-right: 10px"></i>
                  添加图片
                </div>
                <div class="bottom-nav-item">
                  <label style="display: inline-block">透明度</label>
                  <div
                    style="
                      position: relative;
                      display: inline-block;
                      min-width: 160px;
                      transform: translateY(-5px);
                    "
                  >
                    <vue-range-slider
                      width="160"
                      class="range-slide"
                      ref="slider"
                      v-model="waterPicInfo.opacity"
                    ></vue-range-slider>
                  </div>
                </div>
              </template>
              <!--视频声音相关-->
              <template v-if="currentType === 'audio'">
                <div
                  class="bottom-nav-item"
                  @click="downloadAudio"
                  v-tip.top.dark.hover="'下载视频的音频'"
                >
                  <i class="iconfont icon-xiazai" style="margin-right: 10px"></i> 下载音频
                </div>
                <div
                  class="bottom-nav-item"
                  @click="selectAudio"
                  v-tip.top.dark.hover="'添加背景音'"
                >
                  <i class="iconfont icon-yinpinbofang" style="margin-right: 10px"></i>
                  {{ videoInfo.audio.name ? "替换" : "添加" }}背景音
                  <span style="font-size: 12px" v-if="videoInfo.audio.name"
                    >(已添加：{{ videoInfo.audio.name }})</span
                  >
                </div>
              </template>
            </div>
            <!--靠右的设置、保存输出-->
            <template v-if="videoInfo.baseInfo.originHeight">
              <div style="float: right">
                <!--输出选项进行设置-->
                <div
                  class="setting-box"
                  v-if="showSetting"
                  @mouseleave="showSetting = false"
                >
                  <div v-for="key in Object.keys(resolvingPower)" :key="key">
                    <template v-if="!key || key <= videoInfo.baseInfo.originHeight">
                      <label>
                        <input
                          type="radio"
                          name="rdSpeed"
                          :value="key"
                          v-model="videoInfo.controlInfo.resolvingPower"
                        />
                        {{ resolvingPower[key] }}
                      </label>
                    </template>
                  </div>
                </div>
                <div
                  class="bottom-nav-item"
                  v-tip.top.dark.hover="'输出设置'"
                  @click="showSetting = !showSetting"
                >
                  <i class="iconfont icon-shezhi"></i>
                </div>
                <div
                  class="bottom-nav-item"
                  v-tip.top.dark.hover="'保存'"
                  @click="saveFinally"
                >
                  保存
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!--选择视频-->
      <div class="select-video-box" v-if="!options.sources[0].src">
        <div class="title">简易剪辑视频</div>
        <div class="tips" @click="initFfmpeg">Trim or cut video</div>
        <div class="select-type" v-if="initFfmpegBool">
          <div class="select-type-inner">
            <div style="display: inline-block" class="open-file" @click="selectFile">
              打开文件
            </div>
            <div
              style="display: inline-block"
              class="arrow"
              @click="showSelectDrop ? (showSelectDrop = false) : (showSelectDrop = true)"
            >
              <i class="iconfont icon-xia"></i>
            </div>
          </div>
          <div
            class="select-drop"
            v-if="showSelectDrop"
            @mouseleave="showSelectDrop = false"
          >
            <div class="select-item">本地视频</div>
            <div class="select-item">平台视频</div>
            <div class="select-item" @click="inputFileUrl">通过视频URL</div>
          </div>
        </div>
        <div v-else style="color: white">
          <div class="loading">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div style="margin-top: 20px">环境准备中...</div>
        </div>
      </div>
    </div>
    <!--加载视频中，请稍等的过程-->
    <div class="full-loading" v-show="showFullLoading">
      <div
        style="
          color: white;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "
      >
        <div class="loading" style="margin-top: 0px">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div style="margin-top: 20px">{{ showFullLoadingText }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
// import { mapActions } from 'vuex'
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import step from "./Step";
import "vue-range-component/dist/vue-range-slider.css";
import VueRangeSlider from "vue-range-component";
// const ffmpeg = createFFmpeg({ log: true })
// eslint-disable-next-line no-undef
// const { createFFmpeg, fetchFile } = FFmpeg
const ffmpeg = createFFmpeg({
  log: true,
  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
});
export default {
  name: "Home",
  components: { step, VueRangeSlider },
  props: ["videoinfo_parent"],
  data() {
    return {
      maxSize: 1024 * 1024 * 1024,
      showFullLoading: false,
      showFullLoadingText: "",
      showSetting: false,
      resolvingPower: {
        360: "流畅360P", // '640:-1': '360P'
        480: "标清480P", // '720:-1': '480P',
        720: "高清720P", // '1280:-1'
        1080: "超清1080P", // '1920:-1'
        "": "原视频输出",
      },
      playStatus: false,
      currentType: "cut", // 当前默认操作项，cut 裁剪,addimg 添加水印图片，snapshot 屏幕快照，crop 裁剪划选区,audio视频声音
      initFfmpegBool: false, // 是否已经初始化ffmpeg环境
      videoInfo: {
        // 操作视频的基本信息
        baseInfo: {
          name: "新编辑视频",
          resolvingPower: null, // 原始视频的分辨率
          width: null,
          height: 360,
          duration: 0,
          originWidth: null, // 原视频的宽
          originHeight: null, // 原视频的高
        },
        currentTime: 0,
        controlInfo: {
          start: 0, // 开始时间
          end: null, // 结束时间
          resolvingPower: null, // 输出的码率
        },
        audio: {
          src: null,
          name: null,
        },
        waterFrames: [], // 获得对应帧数的图片数组，保留10张图片
      },
      waterPicWidth: 50,
      waterPicInfo: {
        // 水印图片的相关信息
        source: null,
        x: 10,
        y: 10,
        width: null,
        height: 50,
        opacity: 100,
      },
      percent: 0,
      showSelectDrop: false,
      fileObj: null,
      player: null,
      options: {
        controls: false, // 是否显示底部控制栏
        preload: "auto", // 加载<video>标签后是否加载视频
        autoplay: true, // 静音播放
        // playbackRates: [0.5, 1, 1.5, 2],// 倍速播放
        width: "800px",
        height: "360px",
        controlBar: {
          // 自定义按钮的位置
          children: [],
        },
        sources: [
          {
            src: "",
            // src: 'https://stream7.iqilu.com/10339/upload_transcode/202002/18/20200218114723HDu3hhxqIT.mp4',
            type: "video/mp4",
          },
        ],
      },
    };
  },
  mounted() {
    this.initFfmpeg();
  },
  filters: {},
  computed: {
    // 动态计算时间游标的值显示
    youbiaoLeft() {
      if (!this.videoInfo.currentTime) {
        return "0px";
      }
      let left = 0;
      const percent = (
        Math.floor(this.videoInfo.currentTime) / this.videoInfo.baseInfo.duration
      ).toFixed(2);
      // 计算总长100的百分之几，并减去左边的宽度
      left = percent * 1000 - this.$refs.left.offsetWidth;
      return left + "px";
    },
    transTimeCom() {
      if (!this.videoInfo.currentTime) {
        return "00:00";
      }
      const secondsT = this.videoInfo.currentTime;
      const time = moment.duration(secondsT, "milliseconds");
      const hours = time.hours();
      const minutes = time.minutes();
      const seconds = time.seconds();
      const milliseconds = time.milliseconds();
      // return moment({ h: hours, m: minutes, s: seconds, ms: milliseconds }).format('HH:mm:ss.SSS')
      return moment({ h: hours, m: minutes, s: seconds, ms: milliseconds }).format(
        "HH:mm:ss.S"
      );
    },
  },
  methods: {
    // ...mapActions({
    //   up: 'up'
    // }),
    closeProject() {
      this.options.sources[0].src = "";
      this.videoInfo.waterFrames = [];
      this.waterPicInfo.source = null;
    },
    reset() {
      try {
        // 重置到最初始的状态
        // 1 清除水印设置
        this.waterPicInfo = {
          source: null,
          x: 10,
          y: 10,
          width: null,
          height: 50,
          opacity: 100,
        };
        // 重置begin、end time
        this.videoInfo.controlInfo.start = 0;
        this.videoInfo.controlInfo.end = this.videoInfo.baseInfo.duration;
        // 重置视轨左右调节部分
        this.calLeftRightYouBiao();
        this.$message.success("重置成功！");
      } catch (e) {
        this.$message.error("重置失败！");
      }
    },
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          resolve(e.target.result);
        };
        // readAsDataURL
        fileReader.readAsDataURL(blob);
        fileReader.onerror = () => {
          reject(new Error("blobToBase64 error"));
        };
      });
    },
    dataURLtoBlob(dataurl) {
      var arr = dataurl.split(",");
      var mime = arr[0].match(/:(.*?);/)[1];
      var bstr = atob(arr[1]);
      var n = bstr.length;
      var u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },
    async loadFileToBase64(fileObj) {
      return new Promise((resolve) => {
        const files = new window.File([fileObj], "source.mp4", { type: "video/mp4" });
        var reader = new FileReader();
        reader.readAsDataURL(files);
        reader.onload = function (e) {
          // console.info(this.result)
          resolve(this.result);
        };
      });
    },
    // 组装命令进行保存输出
    async saveFinally() {
      this.setFullLoading(true, "处理中...");
      try {
        /**
         * 整体过程
         * 1、获得水印，计算水印大小
         * 2、获得裁剪视频的时间起始点
         * 3、设置分辨率
         * 4、设置背景音频输出
         * **/
        // 添加水印并设置水印透明度的命令
        // ffmpeg -y -i input.mp4 -i water1.png -filter_complex  "[1]lut=a=val*0.3[a];[0][a]overlay=0:0"  -c:v libx264 -an output.mp4
        // 获得源
        this.showFullLoadingText = "获得视频源...";
        // ffmpeg.FS('writeFile', 'source.mp4', await fetchFile(await this.loadFileToBase64(this.fileObj)))
        // 判断有无水印，有的话添加水印
        let waterArray = [];
        if (this.waterPicInfo.source) {
          // 有水印资源
          // 1 获得水印原始大小
          this.showFullLoadingText = "准备水印配置...";
          ffmpeg.FS(
            "writeFile",
            "overlay.png",
            await fetchFile(this.waterPicInfo.source)
          );
          console.info(this.waterPicInfo.width);
          console.info(this.videoInfo.baseInfo.originWidth);
          console.info(this.videoInfo.baseInfo.width);
          await ffmpeg.run(
            "-i",
            "overlay.png",
            "-y",
            "-v",
            "quiet",
            "-vf",
            "scale=" +
              parseInt(
                (this.waterPicInfo.width * this.videoInfo.baseInfo.originWidth) /
                  this.videoInfo.baseInfo.width
              ) +
              ":" +
              parseInt(
                (this.waterPicInfo.height * this.videoInfo.baseInfo.originHeight) /
                  this.videoInfo.baseInfo.height
              ),
            "scaled.png"
          );
          // 计算相对于原视频的位置
          const x = parseInt(
            (this.waterPicInfo.x * this.videoInfo.baseInfo.originWidth) /
              this.videoInfo.baseInfo.width
          );
          const y = parseInt(
            (this.waterPicInfo.y * this.videoInfo.baseInfo.originHeight) /
              this.videoInfo.baseInfo.height
          );
          // 2、设置一个指定大小的水印
          // ffmpeg -i watermark.png -y -v quiet -vf scale=1280*0.15:-1 scaled.png
          // -vf "movie=scaled.png, scale=50:50, lut=a=val*0.5[watermark];[in][watermark] overlay=10:10[out]"
          const scaleWater =
            "scale=" +
            parseInt(
              (this.waterPicInfo.width * this.videoInfo.baseInfo.originWidth) /
                this.videoInfo.baseInfo.width
            ) +
            ":" +
            parseInt(
              (this.waterPicInfo.height * this.videoInfo.baseInfo.originHeight) /
                this.videoInfo.baseInfo.height
            );
          const overlay = x + ":" + y;
          const waterOpcity = this.waterPicInfo.opacity * 0.01;
          waterArray = [
            "-vf",
            "movie=overlay.png, " +
              scaleWater +
              ", lut=a=val*" +
              waterOpcity +
              "[watermark];[in][watermark] overlay=" +
              overlay +
              "[out]",
          ];
        }
        const start = ["-i", "source.mp4"];
        // const lineTime = ['-ss', this.videoInfo.controlInfo.start * 0.001, '-to', this.videoInfo.controlInfo.end * 0.001] // 时间线的begin/end
        // beigin time 和 end time
        const beginTime = this.videoInfo.controlInfo.start * (0.001).toFixed(3) + "";
        const endTime = this.videoInfo.controlInfo.end * (0.001).toFixed(3) + "";
        const lineTime = ["-ss", beginTime, "-to", endTime]; // 时间线的begin/end
        // 设置分辨率,保证不变形  ffmpeg -i 1.mp4 -strict -2 -vf scale=-1:480 4.mp4
        let resolvingPower = [];
        // console.info(this.videoInfo.controlInfo.resolvingPower)
        // console.info(this.videoInfo.baseInfo.originHeight)
        let tempHeight = parseInt(this.videoInfo.controlInfo.resolvingPower);
        let tempWidth = parseInt(
          (this.videoInfo.baseInfo.originWidth * tempHeight) /
            this.videoInfo.baseInfo.originHeight
        );
        if (tempWidth % 2 !== 0) {
          tempWidth = tempWidth + 1;
        }
        if (tempHeight % 2 !== 0) {
          tempHeight = tempHeight + 1;
        }
        console.info(tempWidth);
        console.info(tempHeight);
        if (
          this.videoInfo.controlInfo.resolvingPower &&
          tempHeight !== this.videoInfo.baseInfo.originHeight
        ) {
          // resolvingPower = ['-s', tempWidth + ':' + tempHeight]
          if (waterArray.length === 0) {
            resolvingPower = ["-vf", "scale=" + tempWidth + ":" + tempHeight];
          } else {
            resolvingPower = ["-s", tempWidth + ":" + tempHeight];
          }
        }
        // 动态计算视频的宽
        // const resolvingPower = ['-strict', '-2', '-vf', 'scale=' + parseInt(this.videoInfo.baseInfo.width * this.videoInfo.controlInfo.resolvingPower / this.videoInfo.baseInfo.height) + ':' + this.videoInfo.controlInfo.resolvingPower]
        // 设置背景音频
        let audio = [];
        if (this.videoInfo.audio.src) {
          // ffmpeg -i b.mp4 -i audio.mp3 -c:v copy -c:a aac -strict experimental -map 0:v:0 -map 1:a:0 output.mp4
          // ffmpeg  -stream_loop 10000 -i  11582.mp3  -ss 00:00:00.0 -t 00:02:00 output.mp3
          ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(this.videoInfo.audio.src));
          await ffmpeg.run(
            "-stream_loop",
            "-1",
            "-i",
            "audio.mp3",
            "-ss",
            beginTime,
            "-t",
            endTime,
            "audioloop.mp3"
          );
          audio = [
            "-i",
            "audioloop.mp3",
            "-c:a",
            "aac",
            "-strict",
            "experimental",
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
          ];
        }
        const end = ["download.mp4"];
        this.showFullLoadingText = "视频处理中，请稍后...";
        ffmpeg.setProgress(({ ratio }) => {
          console.log(ratio);
          /*
           * ratio is a float number between 0 to 1.
           */
          if (ratio !== 1) {
            this.showFullLoadingText =
              "视频处理中，请稍后..." + (ratio * 100).toFixed(2) + "%";
          } else {
            this.showFullLoading = false;
            this.showFullLoadingText = "";
          }
        });
        await ffmpeg.run(
          ...start,
          ...audio,
          ...lineTime,
          ...waterArray,
          ...resolvingPower,
          ...end
        );
        // 下载到本地
        this.fileDownloadLocal("download.mp4");
        // 保存至Vod平台
        // this.saveFileToVod('download.mp4')
        this.setFullLoading(false);
      } catch (e) {
        this.$message.error("导出出问题了，请重新试试吧！");
        this.setFullLoading(false);
      }
      this.setFullLoading(false);
    },
    // 下载视频的背景音频
    async downloadAudio() {
      this.setFullLoading(true, "视频处理中，请稍后...");
      // 参考命令
      // ffmpeg -i 人生若只如初见.flv -vn r.mp3
      // ffmpeg.FS('writeFile', 'source.mp4', await fetchFile(this.fileObj))
      // ffmpeg.FS('writeFile', 'source.mp4', await fetchFile(await this.loadFileToBase64(this.fileObj)))
      await ffmpeg.run("-i", "source.mp4", "-vn", "audio.mp4");
      this.fileDownloadLocal("audio.mp4");
      this.setFullLoading(false);
    },
    // 保存当前帧的快照
    async makePhoto() {
      this.setFullLoading(true, "视频处理中，请稍后...");
      // 参考ffmpeg命令
      // ffmpeg -i 2.mp4 -y -f image2 -ss 01.010 -t 0.001  b.jpg
      // 执行命令
      // ffmpeg.FS('writeFile', 'source.mp4', await fetchFile(this.fileObj))
      // console.info(await this.blobToBase64(this.dataURLtoBlob(this.fileObj)))
      // const files = new window.File([this.fileObj], 'a.mp4', { type: 'video/mp4' })
      // ffmpeg.FS('writeFile', 'source.mp4', await fetchFile(this.fileObj))
      const timestamp = new Date().getTime();
      await ffmpeg.run(
        "-i",
        "source.mp4",
        "-y",
        "-f",
        "image2",
        "-ss",
        this.player.currentTime() + "",
        "-t",
        "0.001",
        timestamp + ".png"
      );
      this.fileDownloadLocal(timestamp + ".png");
      this.setFullLoading(false);
    },
    // 重新计算左右游标的显示位置
    calLeftRightYouBiao() {
      // 重新计算左右两侧的时间显示和left、right位置
      const leftPercent = (
        this.videoInfo.controlInfo.start / this.videoInfo.baseInfo.duration
      ).toFixed(2);
      const rightPercent =
        1 -
        (this.videoInfo.controlInfo.end / this.videoInfo.baseInfo.duration).toFixed(2);
      const leftWidth = parseInt(leftPercent * 1000);
      const rightWidth = parseInt(rightPercent * 1000);
      this.$refs.left.style.width = leftWidth + "px";
      this.$refs.right.style.width = rightWidth + "px";
      const minWidth = 1000 - leftWidth - rightWidth;
      this.$refs.mid.style.width = minWidth + "px";
      this.$refs.resize.setAttribute(
        "data-before",
        this.transTime(this.videoInfo.controlInfo.start) + "s"
      );
      this.$refs.resize2.setAttribute(
        "data-after",
        this.transTime(this.videoInfo.controlInfo.end) + "s"
      );
    },
    // 增加秒数
    addSecond(type) {
      if (type === "start") {
        if (this.videoInfo.controlInfo.start + 100 < this.videoInfo.controlInfo.end) {
          this.videoInfo.controlInfo.start = this.videoInfo.controlInfo.start + 100;
        }
        // 重新定位播放的游标
        this.videoInfo.currentTime = this.videoInfo.controlInfo.start;
        if (this.player) {
          this.player.currentTime(this.videoInfo.currentTime / 1000);
        }
      } else {
        if (this.videoInfo.controlInfo.end + 100 <= this.videoInfo.baseInfo.duration) {
          this.videoInfo.controlInfo.end = this.videoInfo.controlInfo.end + 100;
        } else {
          this.videoInfo.controlInfo.end = this.videoInfo.baseInfo.duration;
          this.$message.warning("值已经最大了！");
        }
      }
      this.calLeftRightYouBiao();
    },
    // 减少秒数
    delSecond(type) {
      if (type === "start") {
        if (this.videoInfo.controlInfo.start - 100 >= 0) {
          this.videoInfo.controlInfo.start = this.videoInfo.controlInfo.start - 100;
          // 重新定位播放的游标
          this.videoInfo.currentTime = this.videoInfo.controlInfo.start;
          if (this.player) {
            this.player.currentTime(this.videoInfo.currentTime / 1000);
          }
        } else {
          this.videoInfo.controlInfo.start = 0;
          this.$message.warning("已经最小值了！");
        }
      } else {
        if (this.videoInfo.controlInfo.end - 100 > this.videoInfo.controlInfo.start) {
          this.videoInfo.controlInfo.end = this.videoInfo.controlInfo.end - 100;
        }
      }
      // 重新计算左右两侧的时间显示和left、right位置
      this.calLeftRightYouBiao();
      /*  const leftPercent = (this.videoInfo.controlInfo.start / this.videoInfo.baseInfo.duration).toFixed(2)
      const rightPercent = 1 - (this.videoInfo.controlInfo.end / this.videoInfo.baseInfo.duration).toFixed(2)
      const leftWidth = parseInt(leftPercent * 1000)
      const rightWidth = parseInt(rightPercent * 1000)
      this.$refs.left.style.width = leftWidth + 'px'
      this.$refs.right.style.width = rightWidth + 'px'
      const minWidth = 1000 - leftWidth - rightWidth
      this.$refs.mid.style.width = minWidth + 'px' */
    },
    // 格式化时间
    transTime(secondsT) {
      const time = moment.duration(secondsT, "milliseconds");
      const hours = time.hours();
      const minutes = time.minutes();
      const seconds = time.seconds();
      const milliseconds = time.milliseconds();
      // return moment({ h: hours, m: minutes, s: seconds, ms: milliseconds }).format('HH:mm:ss.SSS')
      return moment({ h: hours, m: minutes, s: seconds, ms: milliseconds }).format(
        "HH:mm:ss.S"
      );
    },
    onResize(x, y, width, height) {
      this.waterPicInfo.x = x;
      this.waterPicInfo.y = y;
      this.waterPicInfo.width = width;
      this.waterPicInfo.height = height;
    },
    onDrag(x, y) {
      this.waterPicInfo.x = x;
      this.waterPicInfo.y = y;
    },
    // 点击头部菜单切换操作类型
    changeCurrentType(type) {
      this.currentType = type;
    },
    // 初始化配置ffmpeg环境
    async initFfmpeg() {
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
        this.initFfmpegBool = true;
        this.$message.success("环境初始化成功！");
        // 获得路由传参
        console.info(this.$route.query.url);
        let tempUrl = "";
        if (this.$route.query.url) {
          tempUrl =
            this.$route.query.url +
            "&sign=" +
            this.$route.query.sign +
            "&us=" +
            this.$route.query.us;
        }
        console.info(tempUrl);
        const tempName = this.$route.query.name;
        if (tempUrl && tempName) {
          // 有传过来的url参数
          this.videoInfo.baseInfo.name = tempName;
          // 通过url加载视频资源
          this.initVideoCutByUrl(tempUrl);
        }
      }
    },
    initVideoCutByUrl(url) {
      const match = /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[//?/:]?.*$/;
      // 判断是不是正确的url
      if (url === "https://") {
        return;
      }
      if (match.test(url)) {
        this.setFullLoading(true, "请求视频资源");
        this.loadVideoByUrl(this, url);
      } else {
        this.setFullLoading(false);
        this.$message.error("该视频格式不支持，请换一个吧！");
      }
    },
    // 初始化拖拽视轨
    dragControllerDiv() {
      var resize = document.getElementsByClassName("resize");
      var resize2 = document.getElementsByClassName("resize2");
      var left = document.getElementsByClassName("left");
      var right = document.getElementsByClassName("right");
      var mid = document.getElementsByClassName("mid");
      var box = document.getElementsByClassName("box");
      const vm = this;
      for (let i = 0; i < resize.length; i++) {
        resize[i].onmousedown = function (e) {
          e = e || window.event; // 兼容低版本IE 防止时间参数对象失效
          var startX = e.clientX;
          // resize[i].left = resize[i].offsetLeft
          var leftTemp = mid[i].offsetLeft;
          document.onmousemove = function (e) {
            var endX = e.clientX;
            var rightW = right[i].offsetWidth;
            var moveLen = leftTemp + (endX - startX);
            var maxT = box[i].clientWidth;
            if (moveLen < 0) moveLen = 0;
            if (moveLen > maxT - rightW - 0) moveLen = maxT - rightW - 0;
            // resize[i].style.left = moveLen
            for (let j = 0; j < left.length; j++) {
              if (box[i].clientWidth - moveLen - rightW < 10) {
                left[j].style.width = box[i].clientWidth - 10 - rightW + "px";
                mid[j].style.width = "10px";
              } else {
                left[j].style.width = moveLen + "px";
                mid[j].style.width = box[i].clientWidth - moveLen - rightW + "px";
              }
              // 动态计算需要显示的秒数
              const temp = (left[j].clientWidth / maxT) * vm.videoInfo.baseInfo.duration;
              // resize[i].setAttribute('data-before', Number(temp).toFixed(1) + 's')
              resize[i].setAttribute("data-before", vm.transTime(temp) + "s");
              // 更新start值，并更新游标位置
              vm.videoInfo.controlInfo.start = temp;
              vm.videoInfo.currentTime = vm.videoInfo.controlInfo.start;
              // 更新当前播放的时间点
              vm.player.currentTime(vm.videoInfo.currentTime / 1000);
            }
          };
          document.onmouseup = function (evt) {
            document.onmousemove = null;
            document.onmouseup = null;
            resize[i].releaseCapture && resize[i].releaseCapture();
          };
          resize[i].setCapture && resize[i].setCapture();
          return false;
        };
      }
      for (let i = 0; i < resize2.length; i++) {
        resize2[i].onmousedown = function (e) {
          var startX = e.clientX;
          // resize2[i].left = resize2[i].offsetLeft
          var tempLeft = right[i].offsetLeft;
          document.onmousemove = function (e) {
            var endX = e.clientX;
            var leftW = left[i].offsetWidth;
            var moveLen = tempLeft + (endX - startX) - leftW;
            var maxT = box[i].clientWidth;
            if (moveLen < 0) {
              moveLen = 0;
              return;
            }
            if (moveLen > maxT - leftW - 0) moveLen = maxT - leftW - 0;

            // resize2[i].style.left = moveLen
            for (let j = 0; j < right.length; j++) {
              if (moveLen < 10) {
                mid[j].style.width = "10px";
                right[j].style.width = box[i].clientWidth - 10 - leftW + "px";
              } else {
                mid[j].style.width = moveLen + "px";
                right[j].style.width = box[i].clientWidth - moveLen - leftW + "px";
              }
            }
            // 动态计算需要显示的秒数
            const temp =
              ((left[i].clientWidth + mid[i].clientWidth) / maxT) *
              vm.videoInfo.baseInfo.duration;
            // resize2[i].setAttribute('data-after', Number(temp).toFixed(1) + 's')
            resize2[i].setAttribute("data-after", vm.transTime(temp) + "s");
            // 更新end的值并更新游标的位置
            vm.videoInfo.controlInfo.end = temp;
            // 更新起始点游标
            vm.videoInfo.currentTime = vm.videoInfo.controlInfo.start;
            // 更新当前播放的时间点
            vm.player.currentTime(vm.videoInfo.currentTime / 1000);
          };
          document.onmouseup = function (evt) {
            document.onmousemove = null;
            document.onmouseup = null;
            resize2[i].releaseCapture && resize2[i].releaseCapture();
          };
          resize2[i].setCapture && resize2[i].setCapture();
          return false;
        };
      }
    },
    async uploadVod(fileObj) {
      this.setFullLoading(true, "正在上传至平台");
      const vm = this;
      try {
        const result = await this.up({
          files: [fileObj],
          dirType: "ClientUsr",
          onprogress: (file) => {
            // vm.percent = file.percent ? parseInt(file.percent * 100) : 0
            this.setFullLoading(
              true,
              "正在上传至平台" + parseInt(file.percent * 100) + "%"
            );
          },
        });
        vm.newUrl = result.video.url;
        console.info(result.video.url);
        // alert('上传文件成功！' + result.video.url)
        // this.setFullLoading(true,'' + parseInt(file.percent * 100) + '%')
        // 调用平台保存文件地址的方法
        this.$emit("saveVideoCutFile", {
          name: this.videoInfo.baseInfo.name,
          size: fileObj.size,
          uid: result.fileId,
        });
        this.setFullLoading(false);
        this.$message.success({
          message: "文件已经上传至平台，请前往列表查看",
          showClose: true,
          duration: -1,
        });
      } catch (err) {
        this.setFullLoading(false);
        this.$message.error("文件上传失败！");
      }
    },
    saveFileToVod(filename) {
      const files = new window.File(
        [new Blob([ffmpeg.FS("readFile", filename)])],
        this.videoInfo.baseInfo.name,
        { type: "video/mp4" }
      );
      window.parent.postMessage(
        { files: files, name: this.videoInfo.baseInfo.name, type: "upfile" },
        "*"
      );
      const test = setInterval(() => {
        console.info(this.$route.query.uppercent);
        if (
          Number(this.$route.query.uppercent) >= 0 &&
          Number(this.$route.query.uppercent) < 100
        ) {
          this.setFullLoading(true, "视频上传中..." + this.$route.query.uppercent + "%");
        }
        if (Number(this.$route.query.uppercent) === 100) {
          this.setFullLoading(false);
          clearInterval(test);
        }
        if (Number(this.$route.query.uppercent) === -1) {
          this.setFullLoading(false);
          clearInterval(test);
        }
      }, 100);
      process.exit(0);
    },
    offerFileAsDownload(filename) {
      const mime = "application/octet-stream";
      const content = ffmpeg.FS("readFile", "b.mp4");
      console.log(`Offering download of "${filename}", with ${content.length} bytes...`);
      var a = document.createElement("a");
      a.download = filename;
      a.href = URL.createObjectURL(new Blob([content], { type: mime }));
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 2000);
    },
    // 通过文件名将MEMFS文件保存到本地
    fileDownloadLocal(filename) {
      const mime = "application/octet-stream";
      const content = ffmpeg.FS("readFile", filename);
      // console.log(`Offering download of "${filename}", with ${content.length} bytes...`)
      var a = document.createElement("a");
      a.download = filename;
      a.href = URL.createObjectURL(new Blob([content], { type: mime }));
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 2000);
      ffmpeg.FS("unlink", filename);
    },
    // 设置满屏loading
    setFullLoading(display, msg = "") {
      this.showFullLoading = display;
      this.showFullLoadingText = msg;
    },
    inputFileUrl() {
      const _this = this;
      var url = prompt("请输入视频路径", "https://");
      const match = /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[//?/:]?.*$/;
      // 判断是不是正确的url
      if (url === "https://") {
        return;
      }
      if (match.test(url)) {
        this.setFullLoading(true, "请求视频资源");
        _this.loadVideoByUrl(_this, url);
      } else {
        _this.setFullLoading(false);
        this.$message.error("您输入的视频格式不支持，请换一个吧！");
      }
    },
    loadVideoByUrl(_this, url) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.onprogress = function (e) {
          // _this.updateCircleProgressWrapper(e.loaded, e.total)
          if (e.loaded < e.total) {
            _this.setFullLoading(
              true,
              "加载视频中，请稍等..." + ((e.loaded / e.total) * 100).toFixed(1) + "%"
            );
          } else {
            _this.setFullLoading(false);
          }
        };
        xhr.onload = function () {
          if (this.status === 200) {
            const blob = this.response;
            // ffmpeg.FS('writeFile', 'source.mp4', await fetchFile(blob))
            const url = _this.getObjectURL(blob);
            _this.saveToMFS(blob);
            _this.options.sources[0].src = url;
            _this.initVideo(url, _this);
            _this.setFullLoading(false);
            _this.$message.success("加载成功！");
          } else {
            _this.setFullLoading(false);
            _this.$message.error("该视频需要您先下载至本地后再使用！");
          }
        };
        xhr.onreadystatechange = function () {
          // 若响应完成且请求成功
          if (xhr.status === 200) {
          } else {
            _this.setFullLoading(false);
            _this.$message.error("该视频需要您先下载至本地后再使用！");
            return false;
          }
        };
        xhr.send(null);
      } catch (e) {
        _this.setFullLoading(false);
        _this.showFullLoading = false;
        _this.$message.error("该视频路径不支持编辑，请换一个吧！");
      }
    },
    async saveToMFS(blob) {
      ffmpeg.FS("writeFile", "source.mp4", await fetchFile(blob));
    },
    // blob对象转本地bloburl
    blobToUrl(blobdata) {
      return URL.createObjectURL(blobdata);
    },
    // 用户点击输入视频URL
    async inputFileUrlTemp() {
      var url = prompt("请输入视频路径", "https://");
      const match = /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[//?/:]?.*$/;
      // 判断是不是正确的url
      if (url === "https://") {
        return;
      }
      if (match.test(url) && url.endsWith("mp4")) {
        try {
          this.setFullLoading(true, "加载线上数据中...");
          const data = await fetchFile(url);
          // 将数据转成base64的形式
          const dataBase64 = "data:video/mp4;base64," + this.arrayBufferToBase64(data);
          this.options.sources[0].src = dataBase64;
          this.initVideo(dataBase64, this);
          this.setFullLoading(false);
          this.$message.success("加载成功！");
        } catch (e) {
          this.setFullLoading(false);
          this.showFullLoading = false;
          this.$message.error("该视频路径不支持编辑，请换一个吧！");
        }
      } else {
        this.$message.error("您输入的视频路径有误！");
      }
      console.info(url);
    },
    initPlay() {
      const vm = this;
      this.player = this.$video(this.$refs.videoPlayer, this.options, () => {
        const player = vm.player;
        player.on("loadstart", function () {
          console.log("开始请求数据 ");
        });
        player.on("progress", function () {
          console.log("正在请求数据 ");
        });
        player.on("loadedmetadata", function () {
          console.log("获取资源长度完成 ");
        });
        player.on("canplaythrough", function () {
          console.log("视频源数据加载完成");
        });
        player.on("waiting", function () {
          console.log("等待数据");
        });
        player.on("play", function () {
          vm.playStatus = true;
          console.log("视频开始播放");
        });
        player.on("playing", function () {
          console.log("视频播放中");
        });
        player.on("pause", function () {
          vm.playStatus = false;
          console.log("视频暂停播放");
        });
        player.on("ended", function () {
          vm.playStatus = false;
          console.log("视频播放结束");
        });
        player.on("error", function () {
          console.log("加载错误");
        });
        player.on("seeking", function () {
          console.log("视频跳转中");
        });
        player.on("seeked", function () {
          console.log("视频跳转结束");
        });
        player.on("ratechange", function () {
          console.log("播放速率改变");
        });
        player.on("timeupdate", function () {
          // console.log('播放时长改变' + player.currentTime())
          // 动态改变游标和游标时间的位置
          // 1 计算left值
          vm.videoInfo.currentTime = Math.floor(player.currentTime() * 1000);
          // 判断当前时间游标是否超过结束的游标，需要自动停止
          if (vm.videoInfo.currentTime >= vm.videoInfo.controlInfo.end) {
            vm.videoInfo.currentTime = vm.videoInfo.controlInfo.end;
            player.pause();
          }
        });
        player.on("volumechange", function () {
          console.log("音量改变");
        });
        player.on("stalled", function () {
          console.log("网速异常");
        });
      });
    },
    selectFile() {
      const inp = document.getElementById("pop_video");
      if (inp) {
        inp.click();
      }
    },
    selectPic() {
      const inp = document.getElementById("pop_pic");
      if (inp) {
        inp.click();
      }
    },
    selectAudio() {
      const inp = document.getElementById("pop_audio");
      if (inp) {
        inp.click();
      }
    },
    // 上传音频
    getAudio(event) {
      const vm = this;
      if (!event.target.files[0]) {
        return;
      }
      const file = event.target.files[0];
      if (file.type !== "audio/mpeg") {
        this.$message.error("图片仅支持png和jpeg格式！");
        return;
      }
      if (window.FileReader) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function (e) {
          vm.videoInfo.audio.src = e.target.result;
          vm.videoInfo.audio.name = file.name;
          vm.$refs.fileAudio.value = "";
        };
      }
    },
    // 上传图片水印
    getPic(event) {
      if (!event.target.files[0]) {
        return;
      }
      const file = event.target.files[0];
      if (file.type !== "image/png" && file.type !== "image/jpeg") {
        this.$message.error("图片仅支持png和jpeg格式！");
        return;
      }
      // 暂存当前图片水印信息
      const vm = this;
      if (window.FileReader) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        // 监听文件读取结束后事件
        reader.onloadend = function (e) {
          console.info(e);
          // 获得图片的尺寸信息
          var img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            vm.waterPicWidth = parseInt((50 * img.width) / img.height);
            vm.waterPicInfo.width = parseInt((50 * img.width) / img.height);
            vm.waterPicInfo.source = e.target.result;
            // w = img.width
            // h = img.height
          };
        };
      }
      this.$refs.filePic.value = "";
    },
    // 上传视频后解析视频帧
    async getVideoFrames() {
      this.videoInfo.waterFrames = [];
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }
      // 计算10个对应的时间点
      const averageDura = parseInt((this.videoInfo.baseInfo.duration * 0.001) / 13);
      ffmpeg.FS("writeFile", "source.mp4", await fetchFile(this.fileObj));
      ffmpeg.setProgress(({ ratio }) => {
        this.setFullLoading("true", "视频解析中...");
        console.log(ratio);
        /*
         * ratio is a float number between 0 to 1.
         */
        if (ratio !== 1) {
          this.showFullLoadingText =
            "视频解析中，请稍后..." + (ratio * 100).toFixed(2) + "%";
        } else {
          this.showFullLoading = false;
          this.showFullLoadingText = "";
        }
      });
      try {
        await ffmpeg.run(
          "-ss",
          "00:00",
          "-i",
          "source.mp4",
          "-f",
          "image2",
          "-r",
          "1/" + averageDura,
          "-s",
          "100*50",
          "image-%2d.png"
        );
        for (let i = 0; i < 13; i++) {
          let temp = i + 1;
          if (temp < 10) {
            temp = "0" + temp;
          }
          // await ffmpeg.run('-i', 'source.mp4', '-r', '1', '-ss', parseInt(averageDura * i) + '', '-vframes', '1', '-f', 'image2', '-s', '100*50', 'image-' + temp + '.png')
          this.videoInfo.waterFrames.push(
            this.arrayBufferToBase64(ffmpeg.FS("readFile", "image-" + temp + ".png"))
          );
        }
      } catch (e) {
        this.videoInfo.waterFrames = [];
        // ffmpeg -i 22.mp4 -r 1 -ss 00:00:00 -vframes 10 image-%5d.jpeg
        await ffmpeg.run(
          "-ss",
          "00:00:00",
          "-i",
          "source.mp4",
          "-f",
          "image2",
          "-r",
          "1",
          "-vframes",
          "14",
          "-s",
          "100*50",
          "image-%2d.png"
        );
        for (let i = 0; i < 13; i++) {
          let temp = i + 1;
          if (temp < 10) {
            temp = "0" + temp;
          }
          // await ffmpeg.run('-i', 'source.mp4', '-r', '1', '-ss', parseInt(averageDura * i) + '', '-vframes', '1', '-f', 'image2', '-s', '100*50', 'image-' + temp + '.png')
          this.videoInfo.waterFrames.push(
            this.arrayBufferToBase64(ffmpeg.FS("readFile", "image-" + temp + ".png"))
          );
        }
      }
    },
    arrayBufferToBase64(array) {
      array = new Uint8Array(array);
      var length = array.byteLength;
      var table = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "+",
        "/",
      ];
      var base64Str = "";
      for (var i = 0; length - i >= 3; i += 3) {
        var num1 = array[i];
        var num2 = array[i + 1];
        var num3 = array[i + 2];
        base64Str +=
          table[num1 >>> 2] +
          table[((num1 & 0b11) << 4) | (num2 >>> 4)] +
          table[((num2 & 0b1111) << 2) | (num3 >>> 6)] +
          table[num3 & 0b111111];
      }
      var lastByte = length - i;
      if (lastByte === 1) {
        var lastNum1 = array[i];
        base64Str += table[lastNum1 >>> 2] + table[(lastNum1 & 0b11) << 4] + "==";
      } else if (lastByte === 2) {
        // eslint-disable-next-line no-redeclare
        var lastNum1 = array[i];
        var lastNum2 = array[i + 1];
        base64Str +=
          table[lastNum1 >>> 2] +
          table[((lastNum1 & 0b11) << 4) | (lastNum2 >>> 4)] +
          table[(lastNum2 & 0b1111) << 2] +
          "=";
      }
      return base64Str;
    },
    // 判断源文件是否已经写入ffmpeg
    async existSourceFile() {
      try {
        if (await ffmpeg.FS("readFile", "source.mp4")) {
        } else {
        }
      } catch (err) {
        console.info(err);
        ffmpeg.FS("writeFile", "source.mp4", await fetchFile(this.fileObj));
      }
    },
    async initVideo(videoBase64, vm) {
      vm.fileObj = videoBase64;
      vm.options.sources[0].src = videoBase64;
      vm.$nextTick(() => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = async () => {
          // 获得视频时长
          window.URL.revokeObjectURL(video.src);
          const duration = video.duration;
          console.info("视频尺寸");
          // 通过视频尺寸计算视频部分的画布大小，否则影响水印添加
          // 判断视频的宽高是不是为0，为0的话要计算某一帧图片的大小
          const tempWidth = video.videoWidth;
          const tempHeight = video.videoHeight;
          if (video.videoWidth === 0) {
            vm.setFullLoading(false);
            vm.options.sources[0].src = "";
            vm.videoInfo.waterFrames = [];
            vm.$message.error("您的视频损坏了，请换一个试试吧！");
          } else {
            vm.calVideo(vm, tempWidth, tempHeight, duration);
          }
        };
        video.src = videoBase64;
      });
    },
    calVideo(vm, tempWidth, tempHeight, duration) {
      // console.info(video.videoWidth)
      // console.info(video.videoHeight)
      vm.videoInfo.baseInfo.width = (360 * tempWidth) / tempHeight;
      vm.options.width = vm.videoInfo.baseInfo.width;
      vm.videoInfo.baseInfo.duration = duration * 1000;
      vm.videoInfo.controlInfo.end = vm.videoInfo.baseInfo.duration;
      vm.videoInfo.baseInfo.originWidth = tempWidth;
      vm.videoInfo.baseInfo.originHeight = tempHeight;
      // 存原始视频的分辨率
      // vm.video.baseInfo.= video.videoHeight
      // 设置默认输出尺寸的值
      if (tempHeight >= 1080) {
        vm.videoInfo.controlInfo.resolvingPower = "1080";
      } else if (tempHeight >= 720) {
        vm.videoInfo.controlInfo.resolvingPower = "720";
      } else if (tempHeight >= 480) {
        vm.videoInfo.controlInfo.resolvingPower = "480";
      } else if (tempHeight >= 360) {
        vm.videoInfo.controlInfo.resolvingPower = "360";
      } else {
        vm.videoInfo.controlInfo.resolvingPower = "";
      }
      // 放置时间轴的时间显示
      var resize = document.getElementsByClassName("resize");
      var resize2 = document.getElementsByClassName("resize2");
      resize[0].setAttribute("data-before", "00:00:00s");
      resize2[0].setAttribute("data-after", vm.transTime(duration * 1000) + "s");
      // resize2[0].setAttribute('data-after', duration + 's')

      vm.$nextTick(() => {
        vm.dragControllerDiv();
        vm.initPlay();
      });
      // 对视频进行分帧,太慢了，暂时关闭
      // vm.getVideoFrames()
      this.extractFramesFromVideo(this.fileObj);
    },
    async extractFramesFromVideo(videoUrl) {
      const vm = this;
      vm.videoInfo.waterFrames = [];
      var video = document.createElement("video");
      var canvas = document.createElement("canvas");
      canvas.width = 88;
      canvas.height = 50;
      video.addEventListener(
        "loadeddata",
        function () {
          for (let i = 0; i < 14; i++) {
            const temp = parseInt(video.duration / 14);
            setTimeout(() => {
              if (!isNaN(video.duration)) {
                // var rand = Math.round(Math.random() * video.duration * 1000) + 1
                video.currentTime = temp * i === 0 ? 0.1 : temp * i;
              }
            }, 500 * i);
          }
        },
        false
      );

      video.addEventListener(
        "seeked",
        function () {
          var context = canvas.getContext("2d");
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          // 转换成base64形式
          const img = canvas.toDataURL("image/jpeg"); // 这个就是图片的base64
          vm.videoInfo.waterFrames.push(img);
        },
        false
      );
      video.src = videoUrl;
    },
    // 上传视频
    async getVideo(event) {
      if (this.player) {
        this.player.pause();
        // this.player.dispose()
      }
      if (!event.target.files[0]) {
        return;
      }
      const file = event.target.files[0];
      if (file.type !== "video/mp4") {
        this.$message.error("请选择MP4格式视频！");
        return;
      }
      if (file.size > this.maxSize) {
        this.$message.error("只能编辑1G以内的视频文件！");
      }
      // document.getElementById('pop_video').value = null
      this.videoInfo.baseInfo.name = file.name;
      this.options.sources[0].src = "";
      const vm = this;
      const blobUrl = this.getObjectURL(file);
      ffmpeg.FS("writeFile", "source.mp4", await fetchFile(file));
      vm.initVideo(blobUrl, vm);
    },
    // 将文件转blob地址
    getObjectURL(file) {
      var url = null;
      if (window.createObjectURL !== undefined) {
        // basic
        url = window.createObjectURL(file);
      } else if (window.URL !== undefined) {
        // mozilla(firefox)兼容火狐
        url = window.URL.createObjectURL(file);
      } else if (window.webkitURL !== undefined) {
        // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
      }
      return url;
    },
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>
<style>
.m-message-container {
  z-index: 9999999999 !important;
}
</style>
<style lang="less" scoped>
@import "../assets/css/common";
</style>
