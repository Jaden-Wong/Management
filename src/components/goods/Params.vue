<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon></el-alert>
      <el-row class="selectBox">
        <el-col>
          选择商品分类：
          <el-cascader
            v-model="selectCateList"
            :options="cateList"
            :props="selectCateListProps"
            @change="selectCateListChange" clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="medium" :disabled="selectCateList.length !== 3 ? true : false" @click="addDialogVisible = true">添加参数</el-button>
          <el-table :data="manyTableData" border style="width: 100%">
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditDialog(slotProps.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="openDeleteDialog(slotProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="medium" :disabled="selectCateList.length !== 3 ? true : false" @click="addDialogVisible = true">添加属性</el-button>
          <el-table :data="onlyTableData" border style="width: 100%">
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditDialog(slotProps.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="openDeleteDialog(slotProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加 动态参数 / 静态属性 对话框 -->
    <el-dialog :title="'编辑' + tileOfDialog" :visible.sync="addDialogVisible" width="750px" @close="closeAddDialog">
      <el-form :model="addForm" :rules="addRules" ref="addRuleFormRef" label-width="100px">
        <el-form-item :label="tileOfDialog" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑 动态参数 / 静态属性 对话框 -->
    <el-dialog :title="'编辑' + tileOfDialog" :visible.sync="editDialogVisible" width="750px" @close="closeEditDialog">
      <el-form :model="editForm" :rules="editRules" ref="editRuleFormRef" label-width="100px">
        <el-form-item :label="tileOfDialog" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      selectCateList: [],
      selectCateListProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
        // checkStrictly: true
      },
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      // 添加操作系列
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addRules: {
        attr_name: [
          { required: true, message: '请输入参数/属性名称', trigger: 'blur' }
        ]
      },
      // 编辑操作系列
      editDialogVisible: false,
      editForm: {},
      editRules: {
        attr_name: [
          { required: true, message: '请输入参数/属性名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      // console.log(res.data)
      this.cateList = res.data
    },
    // 获取分类参数列表
    async getParamsData () {
      if (!this.cateId) {
        // this.selectCateList = []
        return false
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取动态参数/静态属性失败！')
      }
      // console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
      // console.log(this.manyTableData)
      // console.log(this.onlyTableData)
    },
    selectCateListChange () {
      // 获取分类参数列表
      this.getParamsData()
    },
    handleTabClick () {
      // console.log(this.activeName)
      // console.log(this.selectCateList)
      // 获取分类参数列表
      this.getParamsData()
    },
    // 关闭添加操作对话框
    closeAddDialog () {
      this.$refs.addRuleFormRef.resetFields()
    },
    addParams () {
      this.$refs.addRuleFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        } else {
          this.$message.success('添加参数成功！')
          this.addDialogVisible = false
          this.getParamsData()
        }
      })
    },
    // 打开编辑操作对话框
    async openEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      // console.log(this.cateId)
      // console.log(id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭编辑操作对话框
    closeEditDialog () {
      this.$refs.editRuleFormRef.resetFields()
    },
    editParams () {
      this.$refs.editRuleFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        } else {
          this.$message.success('修改参数成功！')
          this.editDialogVisible = false
          this.getParamsData()
        }
      })
    },
    // 打开删除操作对话框
    async openDeleteDialog (id) {
      const confirmMsg = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(res => res)
      // console.log(confirmMsg)
      if (confirmMsg !== 'confirm') return this.$message.info('已取消删除操作')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      } else {
        this.$message.success('删除参数成功！')
        this.getParamsData()
      }
    }
  },
  computed: {
    cateId () {
      return this.selectCateList.length === 3 ? this.selectCateList[2] : null
    },
    tileOfDialog () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>

<style lang="scss" scoped>
.selectBox{
  margin: 15px 0;
}
</style>
