<template>
  <!--加载视频中，请稍等的过程-->
  <div class="full-loading">
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
</template>

<script>
export default {
  name: "Loadding",
  props: {
    showFullLoadingText: {
      type: String,
      default: "",
    },
    showFullLoading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style scoped>
/* 整页加载中的loading */
.full-loading{
  position: absolute;
  top: 0;
  left: 0px;
  width: 100%;
  height: 100%;
  background: #33333380;
  text-align: center;
}
</style>