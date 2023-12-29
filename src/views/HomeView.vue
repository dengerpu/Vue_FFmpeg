<template>
  <div class="home">
    <!-- <h2>视频前端压缩</h2>
    <video id="video" controls></video><br />
    <input type="file" id="upload" @change="upload">
    <p id="text">{{ msg }}</p> -->
    <VideoClip></VideoClip>
  </div>
</template>

<script>
// @ is an alias to /src
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import VideoClip from '@/components/VideoClip.vue';
export default {
  name: 'HomeView',
  components: {
    VideoClip
  },
  data() {
    return {
      msg: null
    }
  },
  methods: {
    async upload(e) {
      var _this = this;
      const ffmpeg = createFFmpeg({
        log: true,
        progress: ({ ratio }) => {
          _this.msg = `完成率: ${(ratio * 100.0).toFixed(2)}%`;
        },
      });
      var { name } = e.target.files[0];

      this.msg = '正在加载 ffmpeg-core.js'
      await ffmpeg.load();
      this.msg = "开始压缩"
      ffmpeg.FS('writeFile', name, await fetchFile(e.target.files[0]));
      await ffmpeg.run('-i', name, '-b', '2000000', 'put.mp4');
      this.msg = '压缩完成'
      const data = ffmpeg.FS('readFile', 'put.mp4');
      const video = document.getElementById('video');
      video.src = URL.createObjectURL(new Blob([data.buffer], {
        type: 'video/mp4'
      }));
    }
  }
}
</script>
