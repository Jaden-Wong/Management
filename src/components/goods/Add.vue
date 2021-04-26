<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">

      <!-- 警示条 -->
      <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表格区域 -->
      <el-form :model="goodsForm" :rules="goodsRules" ref="goodsFormRef" label-width="100px" label-position="top">

        <!-- tab标签页 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeLeave" @tab-click="tabClick">

          <!-- 1.基本信息栏 -->
          <el-tab-pane label="基本信息" name="0">
            <!-- 验证表单 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="goodsForm.goods_price" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="goodsForm.goods_number" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="goodsForm.goods_weight" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="分类列表" prop="goods_cat">
              <el-cascader
                v-model="goodsForm.goods_cat"
                :options="cateList"
                :props="goodsCatSettings"
                @change="handleChange" clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>

          <!-- 2.商品参数栏 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox v-for="(item2, i) in item.attr_vals" v-model="item.attr_vals" :label="item2" border :key="i"></el-checkbox>
            </el-form-item>
          </el-tab-pane>

          <!-- 3.商品属性栏 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <!-- 4.商品图片栏 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="pictureURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove" :headers="headersObj"
              list-type="picture" :on-success="uploadSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>

          <!-- 4.商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="goodsForm.goods_introduce" />
            <el-button type="primary" class="addGoods" @click="add">添加商品</el-button>
          </el-tab-pane>

        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="picturePreviewVisible"
      width="750px">
      <img :src="picturePreviewURL" class="previewPic">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      goodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      goodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      },
      cateList: [],
      goodsCatSettings: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      manyTableData: [],
      onlyTableData: [],
      pictureURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headersObj: {
        Authorization: sessionStorage.getItem('token')
      },
      picturePreviewURL: '',
      picturePreviewVisible: false
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
      this.cateList = res.data
    },
    handleChange () {
      if (this.goodsForm.goods_cat.length !== 3) {
        this.goodsForm.goods_cat = []
        return false
      }
      // console.log(this.goodsForm)
    },
    beforeLeave (activeName, oldActiveName) {
      // console.log(activeName, oldActiveName)
      if (oldActiveName === '0' && this.goodsForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类!')
        return false
      }
    },
    async tabClick () {
      if (this.activeIndex === '1') {
        // console.log('获取商品参数')
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败!')
        }
        this.$message.success('获取商品参数成功!')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        // console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败!')
        }
        this.$message.success('获取商品属性成功!')
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 点击已上传图片时触发
    handlePreview (file) {
      // console.log(file)
      this.picturePreviewURL = file.response.data.url
      // console.log(this.picturePreviewURL)
      this.picturePreviewVisible = true
    },
    // 删除图片时触发
    handleRemove (file) {
      // console.log(file)
      const picInfo = file.response.data.tmp_path
      const index = this.goodsForm.pics.findIndex(item => {
        // console.log(item.pic)
        // console.log(picInfo)
        return item.pic === picInfo
      })
      // console.log(index)
      this.goodsForm.pics.splice(index, 1)
      // console.log(this.goodsForm)
    },
    uploadSuccess (response) {
      // console.log(response.data.tmp_path)
      const picInfo = { pic: response.data.tmp_path }
      this.goodsForm.pics.push(picInfo)
      // console.log(this.goodsForm)
    },
    add () {
      this.$refs.goodsFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写表单必填项!')
        }
        // console.log(this.goodsForm)
        this.manyTableData.forEach(item => {
          const manyObj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.goodsForm.attrs.push(manyObj)
        })
        this.onlyTableData.forEach(item => {
          const onlyObj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.goodsForm.attrs.push(onlyObj)
        })
        const form = _.cloneDeep(this.goodsForm)
        form.goods_cat = form.goods_cat.join(',')
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败!')
        } else {
          this.$message.success('添加商品成功!')
          this.$router.push('/goods')
        }
      })
    }
  },
  computed: {
    cateId () {
      if (this.goodsForm.goods_cat.length === 3) {
        return this.goodsForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.el-checkbox{
  margin: 0 5px 0 0 !important;
}

.el-upload__tip{
  font-size: 13px;
}

.previewPic{
  width: 100%;
}
</style>
