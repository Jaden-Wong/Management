<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表 -->
      <tree-table class="treeTable" :data="cateList" :columns="cateColumns" border :expand-type="false" :selection-type='false' :show-index="true" index-text="#">
        <template v-slot:isok="slotProps">
          <!-- {{slotProps.row}} -->
          <i class="el-icon-success" style="color:#67c23a" v-if="slotProps.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color:#f56c6c" v-else></i>
        </template>
        <template v-slot:sort="slotProps">
          <!-- {{slotProps.row}} -->
          <el-tag size="mini" v-if="slotProps.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="slotProps.row.cat_level ===  1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template v-slot:operation="slotProps">
          <!-- {{slotProps.row}} -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCateMsg(slotProps.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCateMsg(slotProps.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页条 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加商品对话框 -->
    <el-dialog title="添加商品" :visible.sync="addCateDialogVisible" width="750px" @close="closeAddCateDialog">
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectParentCate"
            :options="parentCateList"
            :props="selectParentCateProps"
            @change="selectParentCateChange" clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑名称对话框 -->
    <el-dialog title="提示" :visible.sync="editCateDialogVisible" width="750px" @close="closeEditCateDialog">
      <el-form :model="editCateForm" :rules="editCateRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      params: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      cateColumns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // prop: 'cat_deleted',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0

      },
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      selectParentCate: [],
      selectParentCateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      editCateDialogVisible: false,
      editCateForm: {
        cat_name: ''
      },
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.params
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      // console.log(res.data)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange (val) {
      this.params.pagesize = val
      this.getCateList()
    },
    handleCurrentChange (val) {
      this.params.pagenum = val
      this.getCateList()
    },
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败！')
      }
      this.parentCateList = res.data
      // console.log(this.parentCateList)
    },
    selectParentCateChange () {
      // console.log(this.selectParentCate)
      if (this.selectParentCate.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectParentCate[this.selectParentCate.length - 1]
        // 当前分类的等级
        this.addCateForm.cat_level = this.selectParentCate.length
      } else {
        // 父级分类id
        this.addCateForm.cat_pid = 0
        // 当前分类的等级
        this.addCateForm.cat_level = 0
      }
    },
    closeAddCateDialog () {
      this.$refs.addCateFormRef.resetFields()
      // 父级分类id
      this.addCateForm.cat_pid = 0
      // 当前分类的等级
      this.addCateForm.cat_level = 0
      // 父级分类级联选择器数组
      this.selectParentCate = []
    },
    addCate () {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请检查分类名称是否正确！')
        }
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        // console.log(this.addCateForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        } else {
          this.$message.success('添加商品成功！')
          this.addCateDialogVisible = false
          this.getCateList()
        }
      })
    },
    async editCateMsg (id) {
      // console.log(id)
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类名称失败！')
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    closeEditCateDialog () {
      this.$refs.editCateFormRef.resetFields()
    },
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, {
          cat_name: this.editCateForm.cat_name
        })
        // console.log(res)
        if (res.meta.status !== 200) {
          this.$message.error('编辑分类名称失败！')
        } else {
          this.$message.success('编辑分类名称成功！')
          this.editCateDialogVisible = false
          this.getCateList()
        }
      })
    },
    async deleteCateMsg (id) {
      // console.log(id)
      const confirmMsg = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(res => res)
      // console.log(confirmMsg)
      if (confirmMsg !== 'confirm') return this.$message.info('已取消删除操作')
      const { data: res } = await this.$http.delete(`categories/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      } else {
        this.$message.success('删除分类成功！')
        this.getCateList()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.treeTable{
  margin-top: 15px;
}

.el-cascader{
  width: 100%;
}
</style>
