<template>
  <div class='box'>
    {{transTime(initval)}}
    <div style="display: flex;flex-direction: column">
      <div @click="add()" class='bt1'>▲</div>
      <div @click="del()" class='bt2'>▼</div>
    </div>
  </div>
</template>
 
<script>
export default {
  name: 'step',
  props: {
    type: {
      type: String
    },
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 1
    },
    initval: {
      type: Number,
      default: 1
    }
  },
  created () {
    // 保存一下初始值
    this.temp2 = this.initval * 1
  },
  data () {
    return {
      num: 1,
      temp: 1,
      temp2: 1
    }
  },
  methods: {
    transTime (secondsT) {
      const time = this.$moment.duration(secondsT, 'milliseconds')
      const hours = time.hours()
      const minutes = time.minutes()
      const seconds = time.seconds()
      const milliseconds = time.milliseconds()
      // return this.$moment({ h: hours, m: minutes, s: seconds, ms: milliseconds }).format('HH:mm:ss.SSS')
      return this.$moment({ h: hours, m: minutes, s: seconds, ms: milliseconds }).format('HH:mm:ss.S')
    },
    add () {
      this.$emit('addSecond', this.type)
      /* if ((this.num + 0.1) < this.max) {
        this.num = this.num + this.temp2
        this.temp = this.num + this.temp2
      } else {
        alert('最多购买5件商品')
      } */
    },
    del () {
      this.$emit('delSecond', this.type)
      /*   if (this.num > 1) {
        this.num = this.num - this.temp2
        this.temp = this.num - this.temp2
      } */
    },
    tx () {
      if (this.num > 5) {
        alert('最多购买5件商品')
        this.num = 5
        this.temp = 5
      } else if (typeof this.num !== 'number') {
        // 判断数据类型，如果不是数字就赋值为上次输入的值
        alert('请输入数字')
        this.num = this.temp
      }
    }
  }
}
</script>
 
<style scoped lang="less">
.input-step{
  background: transparent;
  color: white;
  border: 0px !important;
}
.box{
  position: relative;
  width: 120px;
  justify-content: center;
  align-items: center;
  height: 50px;
}
input{
  text-align: center;
  position: absolute;
  left: 0;
  top: 0;
  display: inline-block;
  width: 45px;
  height: 45px;
}
button{
}
.bt1{
  position: absolute;
  right: 0px;
  width: 20px;
  height: 20px;
  top: 0;
  line-height: 25px;
  opacity: 0.8;
  &:hover{
   opacity: 1;
  }
}
.bt2{
  position: absolute;
  right: 0px;
  width: 20px;
  height: 20px;
  line-height: 25px;
  bottom: 5px;
  opacity: 0.8;
  &:hover{
    opacity: 1;
  }
}
</style>