<template>
  <div class="login_contianer">
    <!-- 白色的登录框 -->
    <div class="login_box">
      <!-- 大logo -->
      <div class="profile_photo">
        <img src="../assets/logo.png" alt="logo">
      </div>
      <!-- 用户名密码输入框 -->
      <div class="login_input">
        <el-form label-width="0px" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" placeholder="请输入密码" type="password"></el-input>
          </el-form-item>
        </el-form>
        <!-- 登录按钮重置按钮 -->
        <el-row class="login_btns">
          <el-button type="primary" :plain="true" @click="login">登录</el-button>
          <el-button type="info" :plain="true" @click="loginFormReset">重置</el-button>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录框中的信息
      loginForm: {
        username: '',
        password: ''
      },
      // 配置输入框格式校验规则
      loginFormRules: {
        // 用户名输入框
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        // 密码输入框
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置按钮功能
    loginFormReset () {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录按钮功能
    login () {
      // 1.进行格式校验
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return false
        // 2.向后台发送登录信息 进行用户名和密码校验
        const { data: res } = await this.$http.post('login', this.loginForm)
        // console.log(res)
        // 根据后台返回的数据判断校验结果
        // 2.1校验结果失败
        if (res.meta.status !== 200) {
          // alert('登陆失败，该用户名不存在！')
          this.$message.error('登陆失败，该用户名不存在！')
        } else {
          // 2.2校验结果成功
          // alert('登录成功！')
          this.$message.success('登录成功！')
          // console.log(res)
          // 把后台返回的token信息保存到本地
          window.sessionStorage.setItem('token', res.data.token)
          // 页面跳转
          this.$router.push('home')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .login_contianer{
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box{
      position: absolute;
      top: 50%;
      left: 50%;
      width: 450px;
      height: 300px;
      background-color: #fff;
      border-radius: 10px;
      transform: translate(-50%,-50%);
    }

    .profile_photo{
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%,-50%);
      padding: 10px;
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      background-color: #fff;
      border-radius: 50%;
      box-shadow: 0 0 10px #ddd;
      img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }

    .login_input{
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
      .login_btns{
        display: flex;
        justify-content: flex-end;
      }
    }
</style>
