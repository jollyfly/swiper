import objectAssign from 'object-assign'
const arrayFrom = (nodeList) => Array.prototype.slice.call(nodeList)

class Swiper {
  constructor (options) {
    this._default = {
      container: '.cc-swiper',
      item: '.cc-swiper-item',
      activeClass: 'active',
      threshold: 110,
      duration: 300,
      height: '100%',
      name: 'swiper',
      eventInterceptor: () => true
    }
    this._options = objectAssign(this._default, options)
    this._options.height = this._options.height.replace('px', '')
    this._start = {}
    this._move = {}
    this._end = {}
    this._eventHandlers = {}
    this._prev = this._current = 0
    this._width = this._distance = 0
    this._offset = []
    this.$box = this._options.box
    this.$container = this.$box.querySelector(this._options.container)
    this.$items = this.$container.querySelectorAll(this._options.item)
    this.count = this.$items.length
    this.realCount = this.$items.length // real items length
    this._position = [] // used by go event
    if (!this.count) {
      return
    }
    this._init()
    this._bind()
    return this
  }

  updateItemWidth () {
    this._width = this.$box.offsetWidth || document.documentElement.offsetWidth
    this._distance = this._width
  }

  _init () {
    this.updateItemWidth()
    this._initPosition()
    this._activate(this._current)
    this._setOffset()
    this._setTransform()
  }

  _initPosition () {
    for (let i = 0; i < this.realCount; i++) {
      this._position.push(i)
    }
  }

  _setOffset () {
    let me = this
    let index = me._position.indexOf(me._current)
    me._offset = []
    arrayFrom(me.$items).forEach(function ($item, key) {
      me._offset.push((key - index) * me._distance)
    })
  }

  _setTransition (duration) {
    duration = duration || (this._options.duration || 'none')
    let transition = duration === 'none' ? 'none' : duration + 'ms'
    arrayFrom(this.$items).forEach((it) => {
      it.style.webkitTransition = transition
      it.style.transition = transition
    })
  }

  _setTransform (offset) {
    const me = this
    offset = offset || 0
    arrayFrom(me.$items).forEach(function ($item, key) {
      let distance = me._offset[key] + offset
      let transform = `translate3d(${distance}px, 0, 0)`
      $item.style.webkitTransform = transform
      $item.style.transform = transform
    })
  }

  _bind () {
    const me = this
    me.touchstartHandler = (e) => {
      if (!me._options.eventInterceptor(e, me._options.name)) {
        return
      }
      me._start.x = e.changedTouches[0].pageX
      me._start.y = e.changedTouches[0].pageY
      me._setTransition('none')
      me._isMoved = false
    }
    me.touchmoveHandler = (e) => {
      if (!me._options.eventInterceptor(e, me._options.name)) {
        return
      }
      if (me.count === 1) {
        return
      }
      me._move.x = e.changedTouches[0].pageX
      me._move.y = e.changedTouches[0].pageY
      let distanceX = me._move.x - me._start.x
      let distanceY = me._move.y - me._start.y
      let distance = distanceX
      let noScroller = Math.abs(distanceX) < Math.abs(distanceY)
      /* set shorter distance for first and last item for better experience */
      if (this._current === this.count - 1 || this._current === 0) {
        distance = distance / 3
      }
      if (!noScroller) {
        me._setTransform(distance)
      }
      !noScroller && e.preventDefault()
    }

    me.touchendHandler = (e) => {
      if (!me._options.eventInterceptor(e, me._options.name)) {
        return
      }
      if (me.count === 1) {
        return
      }
      me._end.x = e.changedTouches[0].pageX
      me._end.y = e.changedTouches[0].pageY

      let distanceX = me._end.x - me._start.x
      let distanceY = me._end.y - me._end.y
      let distance = distanceX
      let noScroller = Math.abs(distanceX) < Math.abs(distanceY)
      distance = me.getDistance(distance)
      if (noScroller) {
        return
      }
      if (distance > me._options.threshold) {
        me.move(-1)
      } else if (distance < -me._options.threshold) {
        me.move(1)
      } else {
        me.move(0)
      }
    }

    me.$container.addEventListener('touchstart', me.touchstartHandler, false)
    me.$container.addEventListener('touchmove', me.touchmoveHandler, false)
    me.$container.addEventListener('touchend', me.touchendHandler, false)
  }
  getDistance (distance) {
    if (distance > 0 && this._current === 0) {
      this.$container.dispatchEvent(new Event('preEvent'))
      return 0
    } else if (distance < 0 && this._current === this.realCount - 1) {
      this.$container.dispatchEvent(new Event('nextEvent'))
      return 0
    } else {
      return distance
    }
  }

  _moveIndex (num) {
    if (num !== 0) {
      this._prev = this._current
      this._current += this.realCount
      this._current += num
      this._current %= this.realCount
    }
  }

  _activate (index) {
    let clazz = this._options.activeClass
    Array.prototype.forEach.call(this.$items, ($item) => {
      $item.classList.remove(clazz)
      if (index === Number($item.dataset.index)) {
        $item.classList.add(clazz)
      }
    })
  }

  go (index) {
    const me = this
    index = index || 0
    index += this.realCount
    index = index % this.realCount
    index = this._position.indexOf(index) - this._position.indexOf(this._current)
    me._moveIndex(index)
    me._setOffset()
    me._setTransition()
    me._setTransform()
    return this
  }

  move (num) {
    this.go(this._current + num)
    return this
  }

  on (event, callback) {
    if (this._eventHandlers[event]) {
      console.error(`[swiper] event ${event} is already register`)
    }
    if (typeof callback !== 'function') {
      console.error('[swiper] parameter callback must be a function')
    }
    this._eventHandlers[event] = callback
    return this
  }

  destroy () {
    this._current = 0
    this._setTransform(0)
    this.$container.removeEventListener('touchstart', this.touchstartHandler, false)
    this.$container.removeEventListener('touchmove', this.touchmoveHandler, false)
    this.$container.removeEventListener('touchend', this.touchendHandler, false)
  }
}

export default Swiper
