<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-button type="primary" @click="addRolesVisible = true">添加角色</el-button>
      <el-table :data="rolesList" border stripe>
        <!-- 展开页 -->
        <el-table-column type="expand">
          <template v-slot="slotProps">
            <el-row v-for="(item1, i1) in slotProps.row.children" :key="i1" :class="['botbd', i1 === 0 ? 'topbd':'', 'colcenter']">
              <!-- 一级权限标签 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightrById(slotProps.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级三级权限标签 -->
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" :key="i2" :class="[i2 === 0 ? '' : 'topbd', 'colcenter']">
                  <!-- 二级权限标签 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightrById(slotProps.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限标签 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="i3" closable @close="removeRightrById(slotProps.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{slotProps.row}}
            </pre> -->
          </template>
        </el-table-column>
        <!-- 列表页 -->
        <el-table-column type="index"  label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="360px">
          <template v-slot:default="slotProps">
            <el-button type="primary" icon="el-icon-edit" size="medium" @click="editRolesMsg(slotProps.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="medium" @click="deleteRolesMsg(slotProps.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="medium">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesVisible" width="750px" @close="closeRolesForm">
      <!-- 添加角色信息输入框 -->
      <el-form :model="rolesForm" :rules="rolesRules" ref="rolesFormRef" label-width="85px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 功能按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色信息对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRolesVisible" width="750px" @close="closeEditRolesForm">
      <!-- 添加角色信息输入框 -->
      <el-form :model="editRolesForm" :rules="editRolesRules" ref="editRolesFormRef" label-width="85px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 功能按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [],
      rolesForm: {
        roleName: '',
        roleDesc: ''
      },
      rolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        // 密码输入框
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      addRolesVisible: false,
      editRolesForm: {},
      editRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        // 密码输入框
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      editRolesVisible: false
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      }
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    closeRolesForm () {
      this.$refs.rolesFormRef.resetFields()
    },
    addRoles () {
      this.$refs.rolesFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('roles', this.rolesForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        } else {
          this.$message.success('添加角色成功！')
          this.addRolesVisible = false
          this.getRolesList()
        }
      })
    },
    async editRolesMsg (id) {
      // console.log(id)
      const { data: res } = await this.$http.get(`roles/${id}`)
      this.editRolesForm = res.data
      this.editRolesVisible = true
    },
    closeEditRolesForm () {
      this.$refs.editRolesFormRef.resetFields()
    },
    editRoles () {
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`roles/${this.editRolesForm.roleId}`, {
          roleName: this.editRolesForm.roleName,
          roleDesc: this.editRolesForm.roleDesc
        })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑角色信息失败！')
        } else {
          this.$message.success('编辑角色信息成功！')
          this.editRolesVisible = false
          this.getRolesList()
        }
      })
    },
    async deleteRolesMsg (id) {
      // console.log(id)
      const confirmMsg = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(res => res)
      // console.log(confirmMsg)
      if (confirmMsg !== 'confirm') return this.$message.info('已取消删除操作')
      const { data: res } = await this.$http.delete(`roles/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      } else {
        this.$message.success('删除角色成功！')
        this.getRolesList()
      }
    },
    async removeRightrById (role, id) {
      const confirmMsg = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(res => res)
      // console.log(confirmMsg)
      if (confirmMsg !== 'confirm') return this.$message.info('已取消删除操作')
      // console.log('确认删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      } else {
        this.$message.success('删除权限成功！')
        // console.log(role)
        // console.log(res.data)
        // 重新赋值权限信息
        role.children = res.data
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tag{
  margin: 10px;
}

.topbd{
  border-top: 1px solid #eee;
}

.botbd{
  border-bottom: 1px solid #eee;
}

.colcenter{
  display: flex;
  align-items: center;
}
</style>
