<template>
  <div class="login_contianer">
    <div class="login_box">
      <div class="profile_photo">
        <img src="../assets/logo.png" alt="头像">
      </div>
      <div class="login_input">
        <el-form label-width="0px" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" placeholder="请输入密码" type="password"></el-input>
          </el-form-item>
        </el-form>
        <el-row class="login_btns">
          <el-button type="primary" :plain="true" @click="login">登录</el-button>
          <el-button type="info" @click="loginFormReset">重置</el-button>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    loginFormReset () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return false
        const { data: res } = await this.$http.post('login', this.loginForm)
        // console.log(res)
        if (res.meta.status !== 200) {
          // alert('登陆失败，该用户名不存在！')
          this.$message.error('登陆失败，该用户名不存在！')
        } else {
          // alert('登录成功！')
          this.$message.success('登录成功！')
          // console.log(res)
          window.sessionStorage.setItem('token', res.data.token)
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
