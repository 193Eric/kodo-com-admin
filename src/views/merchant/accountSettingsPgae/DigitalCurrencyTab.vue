<template>
  <div class="digital-currency-management">
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
            v-model="filters.currency_name"
            placeholder="Currency"
            size="default"
            style="width: 100%"
            allowClear
          >
            <a-select-option value="USDT">USDT</a-select-option>
            <a-select-option value="USDC">USDC</a-select-option>
            <a-select-option value="BTC">BTC</a-select-option>
            <a-select-option value="ETH">ETH</a-select-option>
            <a-select-option value="TRX">TRX</a-select-option>
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

    <!-- 新增按钮 -->
    <!-- <div class="action-section">
      <a-button type="primary" @click="handleNewAccount">
        <a-icon type="plus" />
        New Account
      </a-button>
    </div> -->

    <!-- 数据表格 -->
    <div class="table-section">
      <a-table
        :columns="columns"
        :dataSource="dataList"
        :pagination="pagination"
        :scroll="{ x: 1200 }"
        :loading="loading"
        rowKey="key"
        size="middle"
        @change="handleTableChange"
      >
        <!-- 地址列自定义渲染 -->
        <template slot="address" slot-scope="text, record">
          <div class="address-cell">
            <span class="address-text">{{ text }}</span>
            <a-button
              type="link"
              size="small"
              @click="copyAddress(text)"
              class="copy-btn"
            >
              <a-icon type="copy" />
            </a-button>
          </div>
        </template>

        <!-- 状态列自定义渲染 -->
        <template slot="status" slot-scope="text, record">
          <a-tag
            :color="getStatusColor(record.statusText)"
            @click="handleStatusClick(record)"
            class="status-tag clickable"
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
            @click="handleView(record)"
          >
            View
          </a-button>
        </template>
      </a-table>
    </div>

    <!-- 状态设置弹窗 -->
    <a-modal
      :title="'Status Settings'"
      :visible="statusModalVisible"
      @ok="handleStatusConfirm"
      @cancel="handleStatusCancel"
      width="600px"
      :okText="'Confirm'"
      :cancelText="'Cancel'"
      :maskClosable="false"
      :confirmLoading="statusUpdateLoading"
    >
      <div v-if="selectedRecord" class="status-modal-content">
        <!-- Client Name -->
        <div class="status-modal-field">
          <div class="status-field-label">Client Name</div>
          <div class="status-field-value">{{ selectedRecord.clientName }}</div>
        </div>

        <!-- Active Account -->
        <div class="status-modal-field">
          <div class="active-account-row">
            <div class="active-account-left">
              <div class="status-field-label" style="color:#000">Active Account</div>
              <div class="status-field-description">
                Disabling the account, it will not be able to perform any transactions.
                <div class="active-account-right">
                  <div class="switch-container">
                    <a-switch
                      v-model="accountActive"
                      :checked="accountActive"
                      size="default"
                    />
                    <span class="switch-status-text">{{ accountActive ? 'Actived' : 'Disable' }}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 详情抽屉 -->
    <a-drawer
      title="Details"
      :width="600"
      :visible="detailDrawerVisible"
      @close="closeDetailDrawer"
      :bodyStyle="{ padding: '24px' }"
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
          <!-- 基本信息 -->
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Account ID</div>
              <div class="detail-value">{{ selectedRecord.id }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Merchant ID</div>
              <div class="detail-value">{{ selectedRecord.merchant_id }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Currency ID</div>
              <div class="detail-value">{{ selectedRecord.crypto_currency_id }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">
                <a-tag :color="getStatusColor(mapApiStatusToText(selectedRecord.status))">
                  <a-icon :type="getStatusIcon(mapApiStatusToText(selectedRecord.status))" />
                  {{ mapApiStatusToText(selectedRecord.status) }}
                </a-tag>
              </div>
            </div>
          </a-col>

          <!-- 钱包信息 -->
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Wallet Address</div>
              <div class="detail-value">
                <span style="word-break: break-all;">
                  {{ selectedRecord.wallet_address || 'Not Set' }}
                </span>
                <a-button
                  v-if="selectedRecord.wallet_address"
                  type="link"
                  size="small"
                  @click="copyAddress(selectedRecord.wallet_address)"
                  style="margin-left: 8px;"
                >
                  <a-icon type="copy" />
                </a-button>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Wallet Code</div>
              <div class="detail-value">{{ selectedRecord.wallet_code || '-' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Memo</div>
              <div class="detail-value">{{ selectedRecord.memo || '-' }}</div>
            </div>
          </a-col>

          <!-- 网关信息 -->
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Gateway ID</div>
              <div class="detail-value">{{ selectedRecord.gateway_id }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Gateway Currency ID</div>
              <div class="detail-value">{{ selectedRecord.gateway_currency_id }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Chain Code</div>
              <div class="detail-value">{{ selectedRecord.crypto_chain_code }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Created Time</div>
              <div class="detail-value">{{ formatTime(selectedRecord.created_at) }}</div>
            </div>
          </a-col>

          <!-- 余额信息 -->
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Available Balance</div>
              <div class="detail-value">{{ selectedRecord.available_balance }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Frozen Balance</div>
              <div class="detail-value">{{ selectedRecord.frozen_balance }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Settlement Balance</div>
              <div class="detail-value">{{ selectedRecord.settlement_balance }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Total Deposit</div>
              <div class="detail-value">{{ selectedRecord.total_deposit }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Total Withdraw</div>
              <div class="detail-value">{{ selectedRecord.total_withdraw }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Total Exchange</div>
              <div class="detail-value">{{ selectedRecord.total_exchange }}</div>
            </div>
          </a-col>

          <!-- 限额信息 -->
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Deposit Limit</div>
              <div class="detail-value">{{ selectedRecord.deposit_limit }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Daily Deposit Limit</div>
              <div class="detail-value">{{ selectedRecord.daily_deposit_limit }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Withdraw Limit</div>
              <div class="detail-value">{{ selectedRecord.withdraw_limit }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Daily Withdraw Limit</div>
              <div class="detail-value">{{ selectedRecord.daily_withdraw_limit }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">2FA Exchange Amount</div>
              <div class="detail-value">{{ selectedRecord.threshold_exchange_amount_2fa }}</div>
            </div>
          </a-col>

          <!-- 商户信息 -->
          <a-col :span="12" v-if="selectedRecord.merchant">
            <div class="detail-item">
              <div class="detail-label">Merchant No</div>
              <div class="detail-value">{{ selectedRecord.merchant.merchant_no }}</div>
            </div>
          </a-col>
          <a-col :span="12" v-if="selectedRecord.merchant">
            <div class="detail-item">
              <div class="detail-label">Merchant Name</div>
              <div class="detail-value">{{ selectedRecord.merchant.merchant_name }}</div>
            </div>
          </a-col>

          <!-- 币种信息 -->
          <a-col :span="12" v-if="selectedRecord.currency">
            <div class="detail-item">
              <div class="detail-label">Currency Name</div>
              <div class="detail-value">{{ selectedRecord.currency.name }}</div>
            </div>
          </a-col>
          <a-col :span="12" v-if="selectedRecord.currency">
            <div class="detail-item">
              <div class="detail-label">Currency Symbol</div>
              <div class="detail-value">{{ selectedRecord.currency.symbol }}</div>
            </div>
          </a-col>
          <a-col :span="12" v-if="selectedRecord.currency">
            <div class="detail-item">
              <div class="detail-label">Chain Name</div>
              <div class="detail-value">{{ selectedRecord.currency.chain_name }}</div>
            </div>
          </a-col>

          <!-- 备注信息 -->
          <a-col :span="24" v-if="selectedRecord.remarks">
            <div class="detail-item">
              <div class="detail-label">Remarks</div>
              <div class="detail-value">{{ selectedRecord.remarks }}</div>
            </div>
          </a-col>
        </a-row>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { request } from '@/api/_service'
import _ from 'lodash'

export default {
  name: 'DigitalCurrencyAddressManagement',
  data () {
    return {
      // 加载状态
      loading: false,
      statusUpdateLoading: false,

      // 过滤条件
      filters: {
        merchant_no: '',
        merchant_name: ''
      },

      // 弹窗和抽屉状态
      statusModalVisible: false,
      detailDrawerVisible: false,
      detailLoading: false, // 详情加载状态
      selectedRecord: null,
      accountActive: false,
      originalStatus: null, // 记录原始状态

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

      // 表格列配置
      columns: [
        {
          title: 'Client ID',
          dataIndex: 'clientId',
          key: 'clientId',
          width: 150,
          fixed: 'left'
        },
        {
          title: 'Account ID',
          dataIndex: 'accountId',
          key: 'accountId',
          width: 120
        },
        {
          title: 'Client Name',
          dataIndex: 'clientName',
          key: 'clientName',
          width: 120
        },
        {
          title: 'Channel',
          dataIndex: 'channel',
          key: 'channel',
          width: 100
        },
        {
          title: 'Currency',
          dataIndex: 'currency',
          key: 'currency',
          width: 100
        },
        {
          title: 'Address',
          dataIndex: 'address',
          key: 'address',
          width: 200,
          scopedSlots: { customRender: 'address' }
        },
        {
          title: 'Operate Time',
          dataIndex: 'operateTime',
          key: 'operateTime',
          width: 160
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          width: 120,
          scopedSlots: { customRender: 'status' }
        },
        {
          title: 'Action',
          key: 'action',
          width: 100,
          fixed: 'right',
          scopedSlots: { customRender: 'action' }
        }
      ],

      // 数据列表
      dataList: []
    }
  },

  created () {
    this.fetchData()
  },

  methods: {
    // 防抖处理的搜索方法
    handleSearch: _.debounce(function () {
      this.pagination.current = 1 // 搜索时重置到第一页
      this.fetchData()
    }, 300),

    // API调用方法
    async fetchData () {
      this.loading = true
      try {
        const params = this.buildRequestParams()

        const response = await request({
          url: '/admin/merchant/crypto/v2/address/list',
          method: 'GET',
          params
        })

        if (response.code === 200) {
          // 将API返回的数据映射为表格需要的格式
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

      // 添加搜索条件
      if (this.filters.merchant_no?.trim()) {
        params.merchant_no = this.filters.merchant_no.trim()
      }

      if (this.filters.merchant_name?.trim()) {
        params.merchant_name = this.filters.merchant_name.trim()
      }

      if (this.filters.currency_name) {
        params.currency_name = this.filters.currency_name
      }

      if (this.filters.status) {
        params.status = this.filters.status
      }

      return params
    },

    // 将API数据映射为表格数据格式
    mapApiDataToTableData (apiList) {
      return apiList.map(item => ({
        // 先保留原始API数据
        ...item,

        // 然后覆盖为表格显示字段映射（这样确保显示字段不会被覆盖）
        key: item.id,
        clientId: item.merchant?.merchant_no || '-',
        accountId: item.id || '-',
        clientName: item.merchant?.merchant_name || '-',
        channel: item.currency?.chain_name || '-',
        currency: item.currency?.id || '-', // 使用currency.id
        address: this.formatAddress(item.wallet_address),
        operateTime: this.formatTime(item.updated_at),
        statusText: this.mapApiStatusToText(item.status) // 用于显示的状态文本
        // status 保持原始数字，不覆盖
      }))
    },

    // 格式化地址显示
    formatAddress (address) {
      if (!address || address.trim() === '') {
        return 'Not Set'
      }

      // 如果是URL格式，显示为链接样式
      if (address.startsWith('http')) {
        return 'URL Address'
      }

      // 如果是长地址，截取显示
      if (address.length > 20) {
        return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`
      }

      return address
    },

    // 将API状态数字转换为文本
    mapApiStatusToText (status) {
      return status === 1 ? 'Actived' : 'Disable'
    },

    // 格式化时间（ISO格式转换为显示格式）
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
        status: ''
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

    // 新建账户
    handleNewAccount () {
      this.$message.info('New Account functionality')
    },

    // 复制地址
    copyAddress (address) {
      // 如果地址未设置，提示用户
      if (address === 'Not Set' || !address) {
        this.$message.warning('Address not set')
        return
      }

      // 创建临时textarea元素用于复制
      const textarea = document.createElement('textarea')
      textarea.value = address
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      this.$message.success('Address copied to clipboard')
    },

    // 点击状态标签
    handleStatusClick (record) {
      this.selectedRecord = record
      this.originalStatus = record.status // 记录原始状态
      this.accountActive = record.status === 1 // 根据原始状态码判断
      this.statusModalVisible = true
    },

    // 确认状态修改
    async handleStatusConfirm () {
      if (!this.selectedRecord) return

      const newStatus = this.accountActive ? 1 : -1

      // 判断状态是否有变化
      if (newStatus === this.originalStatus) {
        // 状态没有变化，直接关闭弹窗
        this.$message.info('Status unchanged')
        this.statusModalVisible = false
        this.selectedRecord = null
        this.originalStatus = null
        return
      }

      // 状态有变化，调用接口
      this.statusUpdateLoading = true
      try {
        const response = await request({
          url: '/admin/merchant/crypto/v2/address/status',
          method: 'POST',
          data: {
            id: this.selectedRecord.id
          }
        })

        if (response.code === 200) {
          // 更新本地数据
          const index = this.dataList.findIndex(item => item.key === this.selectedRecord.key)
          if (index > -1) {
            // 更新原始状态数据
            this.dataList[index].status = newStatus // 更新数字状态
            this.dataList[index].status_text = this.accountActive ? '正常' : '禁用' // 更新中文状态
            // 更新显示用的状态文本
            this.dataList[index].statusText = this.accountActive ? 'Actived' : 'Disable'
          }

          this.$message.success(`Account status updated to ${this.accountActive ? 'Actived' : 'Disable'}`)
        } else {
          this.$message.error(response.message || 'Status update failed')
        }
      } catch (error) {
        console.error('状态更新失败:', error)
        this.$message.error('Network error, please try again')
      } finally {
        this.statusUpdateLoading = false
        this.statusModalVisible = false
        this.selectedRecord = null
        this.originalStatus = null
      }
    },

    // 取消状态修改
    handleStatusCancel () {
      this.statusModalVisible = false
      this.selectedRecord = null
      this.originalStatus = null
    },

    // 查看详情
    async handleView (record) {
      this.selectedRecord = null
      this.detailDrawerVisible = true
      this.detailLoading = true

      try {
        const response = await request({
          url: `/admin/merchant/crypto/v2/address/${record.id}`,
          method: 'GET'
        })

        if (response.code === 200) {
          this.selectedRecord = response.data
          console.log('详情加载成功:', this.selectedRecord)
        } else {
          this.$message.error(response.message || '获取详情失败')
          this.selectedRecord = record // fallback到列表数据
        }
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('网络错误，请稍后重试')
        this.selectedRecord = record // fallback到列表数据
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

    // 获取状态颜色
    getStatusColor (status) {
      const colors = {
        'Actived': 'green',
        'Disable': 'red',
        'Inactive': 'gray'
      }
      return colors[status] || 'default'
    },

    // 获取状态图标
    getStatusIcon (status) {
      const icons = {
        'Actived': 'check-circle',
        'Disable': 'close-circle',
        'Inactive': 'pause-circle'
      }
      return icons[status] || 'exclamation-circle'
    },

    // 获取国家旗帜
    getCountryFlag (country) {
      // 这里返回一个简单的旗帜图标，实际项目中可以使用真实的旗帜图片
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAxOCI+PGNpcmNsZSBjeD0iMTIiIGN5PSI5IiByPSI4IiBmaWxsPSIjRkY2QjY5Ii8+PC9zdmc+'
    }
  }
}
</script>

<style lang="less" scoped>
.digital-currency-management {
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
    .address-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .address-text {
        flex: 1;
        margin-right: 8px;
      }

      .copy-btn {
        padding: 0;
        min-width: auto;
        height: auto;

        .anticon {
          font-size: 12px;
        }
      }
    }

    .status-tag {
      cursor: pointer;
      transition: all 0.3s;

      &.clickable:hover {
        opacity: 0.8;
        transform: scale(1.05);
      }

      .anticon {
        margin-right: 4px;
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

      .country-flag {
        width: 16px;
        height: 12px;
        border-radius: 2px;
      }

      .anticon {
        margin-right: 4px;
      }
    }
  }

  // 状态设置弹窗样式
  .status-modal-content {
    padding: 8px 0;

    .status-modal-field {
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }

      .status-field-label {
        font-size: 14px;
        color: rgba(138, 149, 161, 1);
        margin-bottom: 8px;
        font-weight: 500;
      }

      .status-field-value {
        font-size: 16px;
        color: #262626;
        font-weight: 600;
      }

      .status-field-description {
        font-size: 12px;
        color: #8c8c8c;
        margin-top: 8px;
        line-height: 1.5;
      }

      .active-account-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;

        .active-account-left {
          flex: 1;
        }

        .active-account-right {
          flex-shrink: 0;
          display: flex;
          float: right;
          margin-top:-10px;
          align-items: center;

          .switch-container {
            display: flex;
            align-items: center;
            gap: 12px;

            .switch-status-text {
              font-size: 16px;
              color: #262626;
              font-weight: 500;
            }
          }
        }
      }
    }
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

/deep/ .ant-modal-header {
  border-bottom: 1px solid #f0f0f0;
}

/deep/ .ant-modal-footer {
  border-top: 1px solid #f0f0f0;
  padding: 16px 24px;

  .ant-btn {
    height: 40px;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    min-width: 80px;
  }

  .ant-btn-primary {
    background: #1c3a5c;
    border-color: #1c3a5c;

    &:hover {
      background: #2d4a6a;
      border-color: #2d4a6a;
    }
  }

  .ant-btn-default {
    border-color: #d9d9d9;
    color: #262626;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }
  }
}
</style>
