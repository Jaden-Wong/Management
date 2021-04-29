<template>
  <div>
    <div class="poster">
      <h3>Welcome!</h3>
      <h3>{{i}}秒后将自动跳转到用户页</h3>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      i: 3
    }
  },
  mounted () {
    this.goToUsers()
  },
  methods: {
    goToUsers () {
      setTimeout(() => {
        this.$router.push('/users')
      }, 3000)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
