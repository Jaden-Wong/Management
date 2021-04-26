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
      <!-- 顶部警示条 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon></el-alert>
      <el-row class="selectBox">
        <el-col>
          选择商品分类：
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectCateList"
            :options="cateList"
            :props="selectCateListProps"
            @change="selectCateListChange" clearable>
          </el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleTabClick">

        <!-- 一.动态参数对应的展示区域 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button type="primary" size="medium" :disabled="selectCateList.length !== 3 ? true : false" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border style="width: 100%">
            <!-- 动态参数展开列 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <el-tag v-for="(item, i) in slotProps.row.attr_vals" :key="i" closable @close="closeButton(i, slotProps.row)">{{item}}</el-tag>

                <!-- 展开列下 添加新标签 按钮/输入框两位一体 -->
                <!-- 1.输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)">
                </el-input>
                <!-- 2.按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
              </template>
            </el-table-column>

            <!-- 索引号列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <!-- 参数名称列 -->
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <!-- 相关操作列 -->
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <!-- 编辑操作按钮 -->
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditDialog(slotProps.row.attr_id)">编辑</el-button>
                <!-- 删除操作按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="openDeleteDialog(slotProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 二.静态属性对应的展示区域 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button type="primary" size="medium" :disabled="selectCateList.length !== 3 ? true : false" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border style="width: 100%">
            <!-- 静态属性展开列 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <el-tag v-for="(item, i) in slotProps.row.attr_vals" :key="i" closable  @close="closeButton(i, slotProps.row)">{{item}}</el-tag>

                <!-- 展开列下 添加新标签 按钮/输入框两位一体 -->
                <!-- 1.输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)">
                </el-input>
                <!-- 2.按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
              </template>
            </el-table-column>

            <!-- 索引号列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <!-- 属性名称列 -->
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <!-- 相关操作列 -->
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <!-- 编辑操作按钮 -->
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditDialog(slotProps.row.attr_id)">编辑</el-button>
                <!-- 删除操作按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="openDeleteDialog(slotProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 对话框 -->
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
        this.selectCateList = []
        this.manyTableData = []
        this.onlyTableData = []
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
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
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
    },
    showInput (row) {
      // console.log(row)
      row.inputVisible = true
      // 页面上的元素被重新渲染时,调用$nextTick中的回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 把参数的属性值字符串保存到数据库中
    async saveAttr_vals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败！')
      } else {
        this.$message.success('修改参数成功！')
      }
    },
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return false
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttr_vals(row)
    },
    closeButton (i, row) {
      // console.log(i)
      row.attr_vals.splice(i, 1)
      this.saveAttr_vals(row)
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

.el-tag{
  margin: 15px;
}

.input-new-tag{
  width: 125px;
}
</style>
