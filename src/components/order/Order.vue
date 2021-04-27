<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="ordersList" stripe border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="120"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款" width="120">
          <template v-slot="slotProps">
            <el-tag type="success" v-if="slotProps.row.order_pay === '1'" size="mini">已付款</el-tag>
            <el-tag type="danger" v-else size="mini">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="120"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180">
          <template v-slot="slotProps">{{slotProps.row.create_time *1000 | formatDate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <!-- 修改收货地址 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAdress"></el-button>
          <!-- 查询物流信息 -->
          <el-button type="success" icon="el-icon-location" size="mini" @click="getExpressMsg"></el-button>
        </el-table-column>
      </el-table>
       <el-pagination
        popper-class="popper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 修改收货地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="750px" @close="closeAddressDialog">
      <el-form :model="addressEditForm" :rules="addressEditRules" ref="addressEditFormRef" label-width="100px">
        <el-form-item label="省市区/县">
          <el-cascader
            v-model="addressEditForm.address1"
            :options="Citydata"
            :props="cascaderProps" clearable>
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressEditForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddress">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查询物流信息对话框 -->
    <el-dialog
      title="物流信息"
      :visible.sync="expressMsgDialogVisible"
      width="750px">
      <!-- <div class="containerBox">
        <div class="expressMsgBox" v-for="(item, i) in expressMsg" :key="i">
          <span><strong>物流状态：</strong>{{item.context}}</span><br/>
          <span class="span2"><strong>更新时间：</strong>{{item.time}}</span>
        </div>
      </div> -->
      <div class="radio">
        排序：
        <el-radio-group v-model="reverse">
          <el-radio :label="true">倒序</el-radio>
          <el-radio :label="false">正序</el-radio>
        </el-radio-group>
      </div>
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(item, index) in expressMsg"
          :key="index"
          :timestamp="item.time">
          {{item.context}}
        </el-timeline-item>
      </el-timeline>
        <span slot="footer" class="dialog-footer">
          <el-button @click="expressMsgDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="expressMsgDialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import Citydata from './citydata'
export default {
  data () {
    return {
      params: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      ordersList: [],
      total: 0,
      addressDialogVisible: false,
      addressEditForm: {
        address1: [],
        address2: ''
      },
      addressEditRules: {
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      Citydata,
      citydataselect: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children'
      },
      expressMsgDialogVisible: false,
      expressMsg: [],
      reverse: true
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.params
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败！')
      }
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (val) {
      this.params.pagesize = val
      this.getOrdersList()
    },
    handleCurrentChange (val) {
      this.params.pagenum = val
      this.getOrdersList()
    },
    editAdress () {
      this.addressDialogVisible = true
    },
    closeAddressDialog () {
      this.addressEditForm.address1 = []
      this.$refs.addressEditFormRef.resetFields()
    },
    editAddress () {
      this.$refs.addressEditFormRef.validate(valid => {
        // console.log(this.addressEditForm.address1.length)
        if (this.addressEditForm.address1.length === 0) return this.$message.error('请选择省市区/县')
        if (!valid) return false
        // 没有接口
        this.$message.success('提交修改信息成功！')
        this.addressDialogVisible = false
      })
    },
    async getExpressMsg () {
      try {
        const { data: res } = await this.$http.get(`/kuaidi/${1106975712662}`)
        // console.log(res)
        this.expressMsg = res.data
        this.expressMsgDialogVisible = true
      } catch {
        this.$message.error('查询物流信息失败！')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-cascader{
  width: 100%;
}

// .containerBox{
//   max-height: 350px;
//   overflow:auto;
// }

// .expressMsgBox{
//   margin: 10px;
//   padding-left: 20px;
//   font-size: 15px;
//   .span2{
//     color: #aaa;
//   }
// }

.radio{
  margin-bottom: 20px;
}

</style>
