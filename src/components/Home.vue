<template>
  <el-container class="home_container">
    <!-- 最顶部的功能栏 -->
    <el-header>
      <div>
        <!-- 默认头像 -->
        <!-- <img src="../assets/logo.png" alt=""> -->
        <!-- 用户头像 -->
        <div class="demo-basic--circle">
          <div class="block">
            <el-avatar :size="50" :src="circleUrl"></el-avatar>
          </div>
        </div>
        <!-- 标题文字 -->
        <span class="home-title">电商后台管理系统</span>
      </div>
      <!-- 退出登录按钮 -->
      <el-button type="info" :plain="true" @click="logout">退出登录</el-button>
    </el-header>
    <!-- 侧边导航栏 -->
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath">
          <!-- 导航栏打开收起按钮 -->
          <div class="toggleDiv" @click="toggleCollapse">|||</div>
          <!-- 循环生成一级导航栏 -->
          <el-submenu :index="'/' + item.id" v-for="item in menusData" :key="item.id">
            <!-- 一级导航栏图标和名称 -->
            <template slot="title">
              <i :class="menusIcon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 循环生成二级导航栏 -->
            <el-menu-item :index="'/' + subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="activeChange('/' + subitem.path)">
              <!-- 二级导航栏图标和名称 -->
              <i class="el-icon-menu"></i>
              <span>{{subitem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位标签 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 导航栏功能内容数组
      menusData: [],
      // 一级导航栏图标数组
      menusIcon: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-flag',
        101: 'el-icon-s-opportunity',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing'
      },
      // 导航栏折叠布尔值
      isCollapse: false,
      // 当前选中的二级导航栏对应的路径（高亮显示）
      activePath: '',
      // 头像url
      circleUrl: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
  },
  created () {
    // 获取导航栏功能内容信息
    this.getMenus()
    // 设置当前应到被选中（高亮显示）的二级导航栏
    this.activeSet()
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('login')
    },
    // 获取导航栏功能内容信息
    async getMenus () {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 若成功 把后台返回的信息 保存到导航栏功能内容数组中
      this.menusData = res.data
      // console.log(this.menusData)
    },
    // 导航栏打开收起
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 点击一个二级导航栏 触发当前选中变化事件
    activeChange (activePath) {
      // console.log(activePath)
      // 把当前选中的二级导航栏对应的路径保存到本地
      window.sessionStorage.setItem('activePath', activePath)
      // 更新data中当前选中的二级导航栏对应的路径（使之高亮显示）
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    // 设置当前应到被选中（高亮显示）的二级导航栏
    activeSet () {
      // 设置依据 已在本地保存的路径信息
      this.activePath = window.sessionStorage.getItem('activePath')
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
    // img{
    //   border-radius: 50%;
    // }
    .demo-basic--circle,
    .home-title{
      padding-left: 15px;
    }
    .demo-basic--circle{
      cursor: pointer;
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
