<template>
  <div class="recharge-management">
    <!-- 搜索过滤区域 -->
    <div class="filter-section">
      <a-row :gutter="16">
        <a-col :span="4">
          <a-input
            v-model="filters.merchant_no"
            placeholder="Client ID"
            size="default"
            allow-clear
          />
        </a-col>
        <a-col :span="4">
          <a-input
            v-model="filters.merchant_name"
            placeholder="Client Name"
            size="default"
            allow-clear
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="filters.country_code"
            placeholder="Entity Country/Region"
            size="default"
            style="width: 100%"
            allowClear
            v-if="viewMode === 'fiat'"
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="HK">HongKong</a-select-option>
            <a-select-option value="BR">Brazil</a-select-option>
            <a-select-option value="CO">Colombia</a-select-option>
            <a-select-option value="MX">Mexico</a-select-option>
          </a-select>
          <a-select
            v-model="filters.currency_name"
            placeholder="Currency"
            size="default"
            style="width: 100%"
            allowClear
            v-if="viewMode === 'digital'"
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="USDT">USDT</a-select-option>
            <a-select-option value="USDC">USDC</a-select-option>
            <a-select-option value="BTC">BTC</a-select-option>
            <a-select-option value="ETH">ETH</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="filters.status"
            placeholder="Status"
            size="default"
            style="width: 100%"
            allowClear
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="1">Actived</a-select-option>
            <a-select-option value="-1">Disable</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-button type="primary" @click="handleSearch" :loading="loading" style="margin-right: 8px">
            Search
          </a-button>
          <a-button @click="handleReset">
            Reset
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 右上角切换按钮 -->
    <div class="action-section">
      <a-button-group>
        <a-button
          :type="viewMode === 'digital' ? 'primary' : 'default'"
          @click="switchViewMode('digital')"
        >
          Digital Currency
        </a-button>
        <a-button
          :type="viewMode === 'fiat' ? 'primary' : 'default'"
          @click="switchViewMode('fiat')"
        >
          Fiat Currency
        </a-button>
      </a-button-group>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-table
        :columns="currentColumns"
        :dataSource="dataList"
        :pagination="pagination"
        :scroll="{ x: 1400 }"
        :loading="loading"
        rowKey="key"
        size="middle"
        @change="handleTableChange"
      >
        <!-- Rate列自定义渲染 -->
        <template slot="rate" slot-scope="text, record">
          {{ (parseFloat(record.rate_fee || 0) * 100) + '%' }}
        </template>

        <!-- 状态列自定义渲染 -->
        <template slot="status" slot-scope="text, record">
          <a-tag
            :color="getStatusColor(record.statusText)"
          >
            <a-icon :type="getStatusIcon(record.statusText)" />
            {{ record.statusText }}
          </a-tag>
        </template>

        <!-- 操作列自定义渲染 -->
        <template slot="action" slot-scope="text, record">
          <a-button
            type="link"
            size="small"
            @click="handleEdit(record)"
            class="edit-action"
          >
            Edit
          </a-button>
        </template>
      </a-table>
    </div>

    <!-- 详情抽屉 -->
    <a-drawer
      title="Details"
      :width="600"
      :visible="detailDrawerVisible"
      @close="closeDetailDrawer"
      :bodyStyle="{ padding: '24px', paddingBottom: '80px' }"
    >
      <!-- 加载状态 -->
      <div v-if="detailLoading" style="text-align: center; padding: 60px 0;">
        <a-spin size="large" />
        <div style="margin-top: 16px; color: #666;">
          Loading details...
        </div>
      </div>

      <!-- 详情内容 -->
      <div v-else-if="selectedRecord">
        <a-row :gutter="[16, 24]">
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Fee ID</div>
              <div class="detail-value">{{ selectedRecord.id }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Client ID</div>
              <div class="detail-value">{{ selectedRecord.merchant?.merchant_no || '-' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Client Name</div>
              <div class="detail-value">{{ selectedRecord.merchant?.merchant_name || '-' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Fee Type</div>
              <div class="detail-value">{{ selectedRecord.fee_type_text || '-' }}</div>
            </div>
          </a-col>

          <!-- Digital Currency 特有字段 -->
          <template v-if="viewMode === 'digital'">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Gateway ID</div>
                <div class="detail-value">{{ selectedRecord.gateway_id || '-' }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Chain Name</div>
                <div class="detail-value">{{ selectedRecord.crypto_currency?.chain_name || '-' }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Currency Symbol</div>
                <div class="detail-value">{{ selectedRecord.crypto_currency?.symbol || '-' }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Crypto Currency ID</div>
                <div class="detail-value">{{ selectedRecord.crypto_currency_id || '-' }}</div>
              </div>
            </a-col>
          </template>

          <!-- Fiat Currency 特有字段 -->
          <template v-if="viewMode === 'fiat'">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Country Code</div>
                <div class="detail-value">{{ selectedRecord.merchant?.country_code || '-' }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Currency Code</div>
                <div class="detail-value">{{ selectedRecord.fiat_currency?.code || '-' }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Currency Symbol</div>
                <div class="detail-value">{{ selectedRecord.fiat_currency?.symbol || '-' }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Fiat Currency ID</div>
                <div class="detail-value">{{ selectedRecord.fiat_currency_id || '-' }}</div>
              </div>
            </a-col>
          </template>

          <a-col :span="12 " style="max-height: 67px;">
            <div class="detail-item" style="max-height: 67px;">
              <div class="detail-label">Currency</div>
              <div class="detail-value">
                <a-tag color="green">
                  <a-icon type="dollar" />
                  {{ viewMode === 'digital' ? selectedRecord.crypto_currency?.name : selectedRecord.fiat_currency?.name }}
                </a-tag>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Fixed Fee</div>
              <div class="detail-value">{{ selectedRecord.fixed_fee || '0.00000000' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Min Fee</div>
              <div class="detail-value">{{ selectedRecord.min_fee || '0.00000000' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Max Fee</div>
              <div class="detail-value">{{ selectedRecord.max_fee || '0.00000000' }}</div>
            </div>
          </a-col>
          <a-col :span="12" style="max-height: 67px;">
            <div class="detail-item">
              <div class="detail-label">Min Amount</div>
              <div class="detail-value">
                <a-input
                  v-model="editableRecord.min_amount"
                  class="amount-input"
                  size="default"
                />
              </div>
            </div>
          </a-col>
          <a-col :span="12" style="max-height: 67px;">
            <div class="detail-item" style="max-height: 67px;">
              <div class="detail-label">Max Amount</div>
              <div class="detail-value">
                <a-input
                  v-model="editableRecord.max_amount"
                  class="amount-input"
                  size="default"
                  placeholder="0 means unlimited"
                />
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Created Time</div>
              <div class="detail-value">{{ formatTime(selectedRecord.created_at) }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Updated Time</div>
              <div class="detail-value">{{ formatTime(selectedRecord.updated_at) }}</div>
            </div>
          </a-col>
          <a-col :span="24" v-if="selectedRecord.remarks">
            <div class="detail-item">
              <div class="detail-label">Remarks</div>
              <div class="detail-value">{{ selectedRecord.remarks }}</div>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Rate</div>
              <div class="detail-value">
                <div class="rate-input-container">
                  <a-input
                    v-model="editableRecord.rate_fee"
                    class="rate-input"
                    size="large"
                  />
                  <span class="rate-percent">%</span>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Status Type</div>
              <div class="detail-value">
                <div class="status-select-container">
                  <div class="status-display">
                    <span class="status-dot" :class="editableRecord.status === 1 ? 'actived' : 'disable'"></span>
                    <span class="status-text">{{ editableRecord.status === 1 ? 'Actived' : 'Disable' }}</span>
                    <a-button
                      type="link"
                      size="small"
                      @click="toggleStatus"
                      class="change-status-btn-inner"
                    >
                      Change Status
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>

        <!-- 抽屉底部按钮 -->
        <div class="drawer-footer">
          <a-button
            @click="handleCancel"
            style="margin-right: 8px"
            size="large"
          >
            Cancel
          </a-button>
          <a-button
            type="primary"
            @click="handleConfirm"
            :loading="updateLoading"
            size="large"
          >
            Confirm
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { request } from '@/api/_service'
import _ from 'lodash'

export default {
  name: 'RechargeManagement',
  data () {
    return {
      // 加载状态
      loading: false,
      updateLoading: false,
      detailLoading: false,

      // 视图模式
      viewMode: 'digital',

      // 过滤条件
      filters: {
        merchant_no: '',
        merchant_name: '',
        currency_name: '',
        status: '',
        country_code: ''
      },

      // 抽屉状态
      detailDrawerVisible: false,
      selectedRecord: null,
      editableRecord: {
        rate_fee: '0.5',
        status: 1,
        min_amount: '0',
        max_amount: '0'
      },

      // 分页配置
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        pageSizeOptions: ['10', '20', '50', '100']
      },

      // 数据列表
      dataList: []
    }
  },

  computed: {
    // 当前表格列配置
    currentColumns () {
      if (this.viewMode === 'digital') {
        return [
          {
            title: 'Client ID',
            dataIndex: 'clientId',
            key: 'clientId',
            width: 150
          },
          {
            title: 'Client Name',
            dataIndex: 'clientName',
            key: 'clientName',
            width: 150
          },
          {
            title: 'Chain Name',
            dataIndex: 'chainName',
            key: 'chainName',
            width: 120
          },
          {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            width: 100
          },
          {
            title: 'Fee Type',
            dataIndex: 'feeType',
            key: 'feeType',
            width: 100
          },
          {
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
            width: 100,
            scopedSlots: { customRender: 'rate' }
          },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            scopedSlots: { customRender: 'status' }
          },
          {
            title: 'Updated Time',
            dataIndex: 'updatedTime',
            key: 'updatedTime',
            width: 160
          },
          {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            scopedSlots: { customRender: 'action' }
          }
        ]
      } else {
        return [
          {
            title: 'Client ID',
            dataIndex: 'clientId',
            key: 'clientId',
            width: 150
          },
          {
            title: 'Client Name',
            dataIndex: 'clientName',
            key: 'clientName',
            width: 150
          },
          {
            title: 'Country Code',
            dataIndex: 'countryCode',
            key: 'countryCode',
            width: 120
          },
          {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            width: 100
          },
          {
            title: 'Fee Type',
            dataIndex: 'feeType',
            key: 'feeType',
            width: 100
          },
          {
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
            width: 100,
            scopedSlots: { customRender: 'rate' }
          },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            scopedSlots: { customRender: 'status' }
          },
          {
            title: 'Updated Time',
            dataIndex: 'updatedTime',
            key: 'updatedTime',
            width: 160
          },
          {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            scopedSlots: { customRender: 'action' }
          }
        ]
      }
    }
  },

  created () {
    this.fetchData()
  },

  methods: {
    // 防抖处理的搜索方法
    handleSearch: _.debounce(function () {
      this.pagination.current = 1
      this.fetchData()
    }, 300),

    // API调用方法
    async fetchData () {
      this.loading = true
      try {
        const params = this.buildRequestParams()
        const apiUrl = this.viewMode === 'digital'
          ? '/admin/merchant/recharge/v2/digital/list'
          : '/admin/merchant/recharge/v2/fiat/list'

        const response = await request({
          url: apiUrl,
          method: 'GET',
          params
        })

        if (response.code === 200) {
          this.dataList = this.mapApiDataToTableData(response.data.list || [])
          this.pagination.total = response.data.total || 0
          this.pagination.current = response.data.page || 1

          console.log('数据加载成功:', this.dataList.length, '条记录')
        } else {
          this.$message.error(response.message || '获取数据失败')
          this.dataList = []
          this.pagination.total = 0
        }
      } catch (error) {
        console.error('API调用失败:', error)
        this.$message.error('网络错误，请稍后重试')
        this.dataList = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },

    // 构建请求参数
    buildRequestParams () {
      const params = {
        page: this.pagination.current,
        limit: this.pagination.pageSize
      }

      if (this.filters.merchant_no?.trim()) {
        params.merchant_no = this.filters.merchant_no.trim()
      }

      if (this.filters.merchant_name?.trim()) {
        params.merchant_name = this.filters.merchant_name.trim()
      }

      if (this.filters.status) {
        params.status = this.filters.status
      }

      if (this.viewMode === 'digital') {
        if (this.filters.currency_name) {
          params.currency_name = this.filters.currency_name
        }
      } else {
        if (this.filters.country_code) {
          params.country_code = this.filters.country_code
        }
      }

      return params
    },

    // 将API数据映射为表格数据格式
    mapApiDataToTableData (apiList) {
      return apiList.map(item => {
        const baseData = {
          ...item,
          key: item.id,
          clientId: item.merchant?.merchant_no || '-',
          clientName: item.merchant?.merchant_name || '-',
          feeType: item.fee_type_text || '-',
          statusText: this.mapApiStatusToText(item.status),
          updatedTime: this.formatTime(item.updated_at)
        }

        if (this.viewMode === 'digital') {
          return {
            ...baseData,
            chainName: item.crypto_currency?.chain_name || '-',
            currency: item.crypto_currency?.name || '-'
          }
        } else {
          return {
            ...baseData,
            countryCode: item.merchant?.country_code || '-',
            currency: item.fiat_currency?.name || '-'
          }
        }
      })
    },

    // 将API状态数字转换为文本
    mapApiStatusToText (status) {
      return status === 1 ? 'Actived' : 'Disable'
    },

    // 格式化时间
    formatTime (timeString) {
      if (!timeString) return '-'

      try {
        const date = new Date(timeString)
        if (isNaN(date.getTime())) return timeString

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.error('时间格式化失败:', error)
        return timeString
      }
    },

    // 重置搜索
    handleReset () {
      this.filters = {
        merchant_no: '',
        merchant_name: '',
        currency_name: '',
        status: '',
        country_code: ''
      }
      this.pagination.current = 1
      this.fetchData()
    },

    // 表格分页变更
    handleTableChange (pagination) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.fetchData()
    },

    // 切换视图模式
    switchViewMode (mode) {
      this.viewMode = mode
      this.detailDrawerVisible = false
      this.selectedRecord = null
      this.detailLoading = false
      this.filters = {
        merchant_no: '',
        merchant_name: '',
        currency_name: '',
        status: '',
        country_code: ''
      }
      this.pagination.current = 1
      this.fetchData()
      this.$message.info(`Switched to ${mode} currency view`)
    },

    // 编辑按钮点击
    async handleEdit (record) {
      this.selectedRecord = null
      this.detailDrawerVisible = true
      this.detailLoading = true

      try {
        const apiUrl = this.viewMode === 'digital'
          ? `/admin/merchant/recharge/v2/digital/${record.id}`
          : `/admin/merchant/recharge/v2/fiat/${record.id}`

        const response = await request({
          url: apiUrl,
          method: 'GET'
        })

        if (response.code === 200) {
          this.selectedRecord = response.data
          // API返回rate_fee是小数(0.01)，转换为百分比数值(1)供编辑使用
          this.editableRecord = {
            rate_fee: parseFloat(response.data.rate_fee || 0) * 100, // 0.01 -> 1
            status: response.data.status,
            min_amount: response.data.min_amount || '0',
            max_amount: response.data.max_amount || '0'
          }
          console.log('详情加载成功:', this.selectedRecord)
        } else {
          this.$message.error(response.message || '获取详情失败')
          // 获取失败时保持loading状态，不填充数据
        }
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('网络错误，请稍后重试')
        // 网络错误时也保持loading状态，不填充数据
      } finally {
        this.detailLoading = false
      }
    },

    // 关闭详情抽屉
    closeDetailDrawer () {
      this.detailDrawerVisible = false
      this.selectedRecord = null
      this.detailLoading = false
    },

    // 切换状态
    toggleStatus () {
      this.editableRecord.status = this.editableRecord.status === 1 ? -1 : 1
    },

    // 取消操作
    handleCancel () {
      this.closeDetailDrawer()
    },

    // 确认操作
    async handleConfirm () {
      if (!this.selectedRecord) return

      // 验证输入
      if (!this.editableRecord.rate_fee || isNaN(parseFloat(this.editableRecord.rate_fee))) {
        this.$message.error('Please enter a valid rate')
        return
      }

      if (!this.editableRecord.min_amount || isNaN(parseFloat(this.editableRecord.min_amount))) {
        this.$message.error('Please enter a valid min amount')
        return
      }

      if (!this.editableRecord.max_amount || isNaN(parseFloat(this.editableRecord.max_amount))) {
        this.$message.error('Please enter a valid max amount')
        return
      }

      const minAmount = parseFloat(this.editableRecord.min_amount)
      const maxAmount = parseFloat(this.editableRecord.max_amount)

      if (maxAmount > 0 && minAmount > maxAmount) {
        this.$message.error('Min amount cannot be greater than max amount')
        return
      }

      this.updateLoading = true
      try {
        const apiUrl = this.viewMode === 'digital'
          ? '/admin/merchant/recharge/v2/digital/update'
          : '/admin/merchant/recharge/v2/fiat/update'

        // 编辑框的百分比数值(1)转换为API需要的小数(0.01)
        const updateData = {
          id: this.selectedRecord.id,
          min_amount: this.editableRecord.min_amount,
          max_amount: this.editableRecord.max_amount,
          rate: (parseFloat(this.editableRecord.rate_fee) / 100).toFixed(4), // 1 -> 0.0100
          status: this.editableRecord.status.toString()
        }

        console.log('提交更新数据:', updateData)

        const response = await request({
          url: apiUrl,
          method: 'POST',
          data: updateData
        })

        if (response.code === 200) {
          this.$message.success('Changes saved successfully')
          this.closeDetailDrawer()
          // 重新获取列表数据
          this.fetchData()
        } else {
          this.$message.error(response.message || 'Update failed')
        }
      } catch (error) {
        console.error('更新失败:', error)
        this.$message.error('Network error, please try again')
      } finally {
        this.updateLoading = false
      }
    },

    // 获取状态颜色
    getStatusColor (status) {
      const colors = {
        'Actived': 'green',
        'Disable': 'red'
      }
      return colors[status] || 'default'
    },

    // 获取状态图标
    getStatusIcon (status) {
      const icons = {
        'Actived': 'check-circle',
        'Disable': 'close-circle'
      }
      return icons[status] || 'exclamation-circle'
    }
  }
}
</script>

<style lang="less" scoped>
.recharge-management {
}
  .filter-section {
    background: #fafafa;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 16px;
  }

  .action-section {
    margin-bottom: 16px;
    text-align: right;
  }

  .table-section {
    .edit-action {
      color: #1890ff;
      font-weight: 500;

      &:hover {
        color: #40a9ff;
      }
    }
  }

  // 详情抽屉样式
  .detail-item {
    .detail-label {
      font-size: 12px;
      color: #8c8c8c;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 14px;
      color: #262626;
      display: flex;
      align-items: center;
      gap: 8px;

      .anticon {
        margin-right: 4px;
      }
    }
  }

  .rate-input-container {
    position: relative;
    width: 100%;

    .rate-input {
      width: 100%;
      padding-right: 30px;
      border-radius: 6px;
      border: 1px solid #d9d9d9;

      /deep/ .ant-input {
        border: none;
        padding-right: 30px;
        font-size: 14px;
      }

      &:hover, &:focus {
        border-color: #40a9ff;
      }
    }

    .rate-percent {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #8c8c8c;
      font-size: 14px;
      pointer-events: none;
    }
  }

  .amount-input {
    width: 100%;
    border-radius: 6px;
    border: 1px solid #d9d9d9;

    &:hover, &:focus {
      border-color: #40a9ff;
    }
  }

  .status-select-container {
    width: 100%;

    .status-display {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      background: #fff;
      justify-content: space-between;
      min-height: 40px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;

        &.actived {
          background-color: #52c41a;
        }

        &.disable {
          background-color: #ff4d4f;
        }
      }

      .status-text {
        flex: 1;
        font-size: 14px;
        color: #262626;
      }

      .change-status-btn-inner {
        padding: 0;
        height: auto;
        font-size: 14px;
        margin-left: auto;
      }
    }
  }

  // 抽屉底部按钮样式
  .drawer-footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    right: 0;
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    border-left: 1px solid #f0f0f0;
    border-top-left-radius: 6px;
    text-align: right;
    z-index: 1;
  }

// 全局样式覆盖
/deep/ .ant-table {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f5f5f5;
  }
}

/deep/ .ant-drawer-header {
  border-bottom: 1px solid #f0f0f0;
}

/deep/ .ant-drawer-body {
  position: relative;
}

/deep/ .ant-button-group {
  .ant-btn {
    height: 32px;
    padding: 0 16px;
    font-size: 14px;
    border-radius: 0;

    &:first-child {
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }

    &:last-child {
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }
  }

  .ant-btn-primary {
    background: #1890ff;
    border-color: #1890ff;
    z-index: 1;
  }
}
</style>
