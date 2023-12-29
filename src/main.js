import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import moment from 'moment';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import videojs from 'video.js'
import 'video.js/dist/video-js.css'


// VueDraggableResizable
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
Vue.component('vue-draggable-resizable', VueDraggableResizable)

Vue.use(ElementUI)

// 注册Moment.js为全局变量
Vue.prototype.$moment = moment;
// 将videojs添加到Vue原型中
Vue.prototype.$video = videojs;
Vue.prototype.$msg = moment;

Vue.config.productionTip = false



new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
