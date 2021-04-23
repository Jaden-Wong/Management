<template>
  <el-container class="home_container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router>
          <div class="toggleDiv" @click="toggleCollapse">|||</div>
          <el-submenu :index="item.id + ''" v-for="item in menusData" :key="item.id">
            <template slot="title">
              <i :class="menusIcon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="subitem.path + ''" v-for="subitem in item.children" :key="subitem.id">
              <i class="el-icon-menu"></i>
              <span>{{subitem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menusData: [],
      menusIcon: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-flag',
        101: 'el-icon-s-opportunity',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing'
      },
      isCollapse: false
    }
  },
  created () {
    this.getMenus()
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('login')
    },
    async getMenus () {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menusData = res.data
      // console.log(this.menusData)
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="scss" scoped>
.home_container{
  height: 100%;
}
.el-header{
  display: flex;
  justify-content: space-between;
  padding-left:0 ;
  align-items: center;
  background-color: #363d40;
  div,img{
    height: 100%;
  }
  div{
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 20px;
    img{
      border-radius: 50%;
    }
    span{
      padding-left: 15px;
    }
  }
}

.el-aside{
  background-color: #313743;
}

.el-main{
  background-color: #e9edf1;
}

.el-menu{
  border-right: none;
}

.toggleDiv{
  height: 23px;
  line-height: 20px;
  background-color: #475162;
  text-align: center;
  font-size: 12px;
  color: #fff;
  letter-spacing: 1.5px;
  cursor: pointer;
}
</style>
