<template>
  <div class="cc-slider">
    <div class="cc-swiper" :style="{height: '100%'}">
      <div class="cc-swiper-item" :style = "{width: getWidth}" v-for="i in 5" :key="i">
        <div class="question">{{i}}</div>
      </div>
      <div class="cc-swiper-item" :style = "{width: getWidth}">
        <div class="father" style="height: 46%; border: 1px solid red; margin-bottom: 20px">father</div>
        <div class="cc-slider-complex" style="border: 1px solid red">
          <div class="cc-swiper-complex" :style="{height: '100%'}" @nextEvent = "fatherNext" @preEvent = "fatherPre">
            <div class="cc-swiper-complex-item" :style = "{width: getWidth}" v-for="i in 5" :key="i">
              <div class="question-complex">{{i}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Swiper from './swiper.js'

  export default {
    name: 'swiper',
    components: {},
    computed: {
      getWidth () {
        return document.body.clientWidth + 'px'
      }
    },
    created () {
    },
    mounted () {
      this.render()
    },
    methods: {
      render () {
        this.destroy()
        const eventInterceptor = (e, name) => {
          const className = e.srcElement.className
          if (className === 'question') {
            return true
          }
          if (className === 'father') {
            return true
          }
          if (className === 'question-complex') {
            return name === 'childrenSwiper'
          }
        }
        this.swiper = new Swiper({
          box: this.$el,
          name: 'fatherSwiper',
          eventInterceptor: eventInterceptor
        })
        this.complexSwiper = new Swiper({
          box: this.$el.querySelector('.cc-slider-complex'),
          container: '.cc-swiper-complex',
          item: '.cc-swiper-complex-item',
          activeClass: 'active',
          threshold: 110,
          duration: 300,
          height: '50%',
          name: 'childrenSwiper',
          eventInterceptor: eventInterceptor
        })
      },
      fatherNext () {
        this.swiper.move(1)
      },
      fatherPre () {
        this.swiper.move(-1)
      },
      destroy () {
        this.swiper && this.swiper.destroy()
        this.complexSwiper && this.complexSwiper.destroy()
      }
    },
    data () {
      return {}
    },
    beforeDestroy () {
      this.destroy()
    }
  }
</script>

<style lang="less">

  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .cc-slider {
    overflow: hidden;
    position: relative;
    height: 100%;

    .cc-swiper {
      overflow: hidden;
      position: relative;

      .cc-swiper-item {
        position: absolute;
        top: 0;
        left: 0;
        border: 1px solid red;
        height: 100%;
        overflow-y: scroll;

        .question {
          height: 750px;
        }
      }
    }
  }
  .cc-slider-complex:extend(.cc-slider){
    height: 50%;
    .cc-swiper-complex:extend(.cc-slider .cc-swiper){
      .cc-swiper-complex-item:extend(.cc-slider .cc-swiper .cc-swiper-item){
        .question-complex{
          height: 100%;
        }
      }
    }
  }

</style>
