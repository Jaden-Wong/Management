<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 使用了layout布局 -->
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="params.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加按钮 -->
        <el-col :span="6">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 展示用户信息的表格 -->
      <el-table :data="usersList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <!-- 使用作用域插槽获取该行的信息 -->
          <template v-slot:default="slotProps">
            <!-- {{ slotProps.row }} -->
            <!-- 把该行信息中的状态信息渲染到el-switch组件中 -->
            <el-switch v-model="slotProps.row.mg_state"  @change="stateChange(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="184px">
          <template v-slot:default="slotProps">
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false" :open-delay="500">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUserMsg(slotProps.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false" :open-delay="500">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(slotProps.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false" :open-delay="500">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="openRolesSettings(slotProps.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="2"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="750px" @close="closeNewUserForm">
      <!-- 添加用户信息输入框 -->
      <el-form :model="newUserForm" :rules="newUserRules" ref="newUserFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="newUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="newUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="newUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="newUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 功能按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="750px" @close="closeEditUserForm">
      <el-form :model="editUserForm" :rules="editUserRules" ref="editUserFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 设置用户角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setDialogVisible" width="750px" @close="closeRoleSettingDialog">
      <div>
        <p>当前的用户：{{roleMsg.username}}</p>
        <p>当前的角色：{{roleMsg.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    const checkEmail = function (rule, value, callback) {
      const regEmail = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的邮箱'))
    }
    const checkPhone = (rule, value, callback) => {
      const regPhone = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regPhone.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号码'))
    }
    return {
      // 请求参数（多个参数封装成对象形式）
      params: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 2
      },
      // 用户列表信息数组
      usersList: [],
      total: 0,
      addDialogVisible: false,
      // 添加用户输入框信息
      newUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      newUserRules: {
        // 用户名输入框
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 密码输入框
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        // 邮箱输入框
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          // { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 手机输入框
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editUserForm: {},
      editUserRules: {
        // 邮箱输入框
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 手机输入框
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 设置用户角色对话框显示隐藏状态
      setDialogVisible: false,
      // 当前准备被分配角色的信息
      roleMsg: {},
      // 角色列表
      rolesList: [],
      // 当前被选中的角色对应的id值
      selectedRoleId: ''
    }
  },
  created () {
    // 向后台发送请求获取用户列表信息
    this.getUsersList()
  },
  methods: {
    // 向后台发送请求获取用户列表信息
    async getUsersList () {
      const { data: res } = await this.$http.get('users', {
        params: this.params
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('获取用户列表失败！')
      }
      // 若成功 把用户列表信息保存到用户列表信息数组
      this.usersList = res.data.users
      // 若成功 把用户列表信息总条数同步到total中
      this.total = res.data.total
    },
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.params.pagesize = val
      this.getUsersList()
    },
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.params.pagenum = val
      this.getUsersList()
    },
    async stateChange (val) {
      // console.log(val)
      const { data: res } = await this.$http.put(`/users/${val.id}/state/${val.mg_state}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        val.mg_state = !val.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    closeNewUserForm () {
      this.$refs.newUserFormRef.resetFields()
    },
    addUser () {
      this.$refs.newUserFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return false
        const { data: res } = await this.$http.post('users', this.newUserForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        } else {
          this.$message.success('添加用户成功！')
          this.addDialogVisible = false
          this.getUsersList()
        }
      })
    },
    async editUserMsg (id) {
      // console.log(id)
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
      this.editUserForm = res.data
      this.editDialogVisible = true
    },
    closeEditUserForm () {
      this.$refs.editUserFormRef.resetFields()
    },
    editUser () {
      this.$refs.editUserFormRef.validate(async vaild => {
        if (!vaild) return false
        const { data: res } = await this.$http.put(`users/${this.editUserForm.id}`, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败!')
        } else {
          // 1.关闭对话框
          this.editDialogVisible = false
          // 2.修改用户列表
          this.getUsersList()
          // 3.提示成功信息
          this.$message.success('修改用户信息成功!')
        }
      })
    },
    async removeUserById (id) {
      // console.log(id)
      const confirmMsg = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(res => res)
      // console.log(confirmMsg)
      if (confirmMsg !== 'confirm') return this.$message.info('已取消删除操作')
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      this.getUsersList()
      this.handleCurrentChange(1)
    },
    async openRolesSettings (role) {
      // console.log(role)
      this.roleMsg = role
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      this.setDialogVisible = true
    },
    async setRole () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择角色！')
      }
      const { data: res } = await this.$http.put(`users/${this.roleMsg.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('分配新角色失败！')
      }
      this.$message.success('分配新角色成功！')
      this.setDialogVisible = false
      this.getUsersList()
    },
    closeRoleSettingDialog () {
      this.roleMsg = {}
      this.selectedRoleId = ''
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
