<template>
  <div class="withdrawal-address-management">
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
            placeholder="Country Code"
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
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="filters.bank_name"
            placeholder="Bank Name"
            size="default"
            style="width: 100%"
            allowClear
            v-if="viewMode === 'fiat'"
          >
            <a-select-option value="">All</a-select-option>
          </a-select>
          <a-select
            v-model="filters.channel"
            placeholder="Channel"
            size="default"
            style="width: 100%"
            allowClear
            v-if="viewMode === 'digital'"
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="TRC20">TRC20</a-select-option>
            <a-select-option value="ERC20">ERC20</a-select-option>
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
            <a-select-option value="0">Pending</a-select-option>
            <a-select-option value="1">Approved</a-select-option>
            <a-select-option value="-1">Rejected</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
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
            class="status-tag"
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
            @click="handleAction(record)"
            :class="{ 'review-action': record.statusText === 'Pending' }"
          >
            {{ record.statusText === 'Pending' ? 'Review' : 'View' }}
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
      <div v-if="selectedRecord">
        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Client ID</div>
              <div class="detail-value">{{ selectedRecord.clientId }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Client Name</div>
              <div class="detail-value">{{ selectedRecord.clientName }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Account ID</div>
              <div class="detail-value">{{ selectedRecord.accountId }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Currency</div>
              <div class="detail-value">
                <a-tag color="green">
                  <a-icon type="dollar" />
                  {{ selectedRecord.currency }}
                </a-tag>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">
                <a-tag :color="getStatusColor(selectedRecord.statusText)">
                  <a-icon :type="getStatusIcon(selectedRecord.statusText)" />
                  {{ selectedRecord.statusText }}
                </a-tag>
              </div>
            </div>
          </a-col>

          <!-- Digital Currency 特有字段 -->
          <template v-if="viewMode === 'digital'">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Wallet Name</div>
                <div class="detail-value">{{ selectedRecord.walletName }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Chain Name</div>
                <div class="detail-value">{{ selectedRecord.channel }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Balance</div>
                <div class="detail-value">{{ selectedRecord.balance }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Frozen Amount</div>
                <div class="detail-value">{{ selectedRecord.frozenAmount }}</div>
              </div>
            </a-col>
            <a-col :span="24">
              <div class="detail-item">
                <div class="detail-label">Address</div>
                <div class="detail-value">{{ selectedRecord.address }}</div>
              </div>
            </a-col>
            <a-col :span="24" v-if="selectedRecord.memo && selectedRecord.memo !== '-'">
              <div class="detail-item">
                <div class="detail-label">Memo</div>
                <div class="detail-value">{{ selectedRecord.memo }}</div>
              </div>
            </a-col>
          </template>

          <!-- Fiat Currency 特有字段 -->
          <template v-if="viewMode === 'fiat'">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Bank Name</div>
                <div class="detail-value">{{ selectedRecord.bankName }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Account Type</div>
                <div class="detail-value">{{ selectedRecord.accountType }}</div>
              </div>
            </a-col>
            <a-col :span="24">
              <div class="detail-item">
                <div class="detail-label">Account Number</div>
                <div class="detail-value">{{ selectedRecord.account }}</div>
              </div>
            </a-col>
          </template>

          <!-- <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">
                <a-tag :color="getStatusColor(selectedRecord.statusText)">
                  <a-icon :type="getStatusIcon(selectedRecord.statusText)" />
                  {{ selectedRecord.statusText }}
                </a-tag>
              </div>
            </div></a-col> -->
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Submit Time</div>
              <div class="detail-value">{{ selectedRecord.operateTime }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Operator ID</div>
              <div class="detail-value">{{ selectedRecord.operatorId || 'OP-101' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Operator Name</div>
              <div class="detail-value">{{ selectedRecord.operatorName || 'John Smith' }}</div>
            </div>
          </a-col>
        </a-row>

        <!-- 抽屉底部按钮 - 只有Pending状态才显示 -->
        <div v-if="selectedRecord.statusText === 'Pending'" class="drawer-footer">
          <a-button
            @click="handleReject"
            :loading="actionLoading"
            style="margin-right: 8px"
            size="large"
          >
            Reject
          </a-button>
          <a-button
            type="primary"
            @click="handleAgree"
            :loading="actionLoading"
            size="large"
          >
            Agree
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
  name: 'WithdrawalAddressManagement',
  data () {
    return {
      // 加载状态
      loading: false,
      actionLoading: false,

      // 视图模式
      viewMode: 'digital',

      // 过滤条件
      filters: {
        merchant_no: '',
        merchant_name: '',
        status: '',
        country_code: '',
        bank_name: '',
        channel: '',
        currency_name: ''
      },

      // 抽屉状态
      detailDrawerVisible: false,
      selectedRecord: null,

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
            width: 150
          },
          {
            title: 'Wallet Name',
            dataIndex: 'walletName',
            key: 'walletName',
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
        ]
      } else {
        return [
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
            width: 150
          },
          {
            title: 'Bank Name',
            dataIndex: 'bankName',
            key: 'bankName',
            width: 120
          },
          {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            width: 100
          },
          {
            title: 'Account Type',
            dataIndex: 'accountType',
            key: 'accountType',
            width: 100
          },
          {
            title: 'Account',
            dataIndex: 'account',
            key: 'account',
            width: 160
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
          ? '/admin/merchant/withdraw/v2/digital/address/list'
          : '/admin/merchant/withdraw/v2/fiat/address/list'

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

      if (this.viewMode === 'fiat' && this.filters.country_code) {
        params.country_code = this.filters.country_code
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
          accountId: item.id || '-', // Account ID 统一使用 id
          statusText: item.status_text || this.mapApiStatusToText(item.status),
          operateTime: this.formatTime(item.updated_at || item.created_at)
        }

        if (this.viewMode === 'digital') {
          return {
            ...baseData,
            walletName: item.wallet_name || '-',
            channel: item.chain_name || '-',
            currency: item.coin_name || '-',
            address: this.formatAddress(item.address),
            memo: item.memo || '-',
            balance: item.balance || '0.00000000',
            frozenAmount: item.frozen_amount || '0.00000000'
          }
        } else {
          return {
            ...baseData,
            bankName: item.bank_name || '-',
            currency: item.currency_name || item.currency || '-',
            accountType: this.mapAccountTypeToText(item.account_type),
            account: item.masked_account_number || item.account_number || '-'
          }
        }
      })
    },

    // 将账户类型枚举转换为文本
    mapAccountTypeToText (accountType) {
      const typeMap = {
        1: '对公', // 对公账户
        2: '对私' // 对私账户
      }
      return typeMap[accountType] || (accountType || '-')
    },

    // 格式化地址显示
    formatAddress (address) {
      if (!address || address.trim() === '') {
        return 'Not Set'
      }

      if (address.length > 20) {
        return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`
      }

      return address
    },

    // 将API状态数字转换为文本
    mapApiStatusToText (status) {
      const STATUS_PENDING = 0 // 待审核
      const STATUS_APPROVED = 1 // 已通过
      const STATUS_REJECTED = -1 // 已拒绝

      const statusMap = {
        [STATUS_PENDING]: 'Pending',
        [STATUS_APPROVED]: 'Approved',
        [STATUS_REJECTED]: 'Rejected'
      }

      // 兼容API返回的状态文本
      if (typeof status === 'string') {
        const textMap = {
          'Disabled': 'Disabled',
          'Enabled': 'Approved',
          'Active': 'Active',
          'Pending': 'Pending'
        }
        return textMap[status] || status
      }

      return statusMap[status] || 'Unknown'
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
        status: '',
        country_code: '',
        bank_name: '',
        channel: '',
        currency_name: ''
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
      this.filters = {
        merchant_no: '',
        merchant_name: '',
        status: '',
        country_code: '',
        bank_name: '',
        channel: '',
        currency_name: ''
      }
      this.pagination.current = 1
      this.fetchData()
      this.$message.info(`Switched to ${mode} currency view`)
    },

    // 复制地址
    copyAddress (address) {
      if (address === 'Not Set' || !address) {
        this.$message.warning('Address not set')
        return
      }

      const textarea = document.createElement('textarea')
      textarea.value = address
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      this.$message.success('Address copied to clipboard')
    },

    // 操作按钮点击
    async handleAction (record) {
      this.selectedRecord = null
      this.detailDrawerVisible = true
      this.actionLoading = true

      try {
        const apiUrl = this.viewMode === 'digital'
          ? `/admin/merchant/withdraw/v2/digital/address/${record.id}`
          : `/admin/merchant/withdraw/v2/fiat/address/${record.id}`

        const response = await request({
          url: apiUrl,
          method: 'GET'
        })

        if (response.code === 200) {
          this.selectedRecord = this.mapDetailDataToDisplay(response.data)
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
        this.actionLoading = false
      }
    },

    // 将详情API数据映射为显示格式
    mapDetailDataToDisplay (apiData) {
      const baseData = {
        ...apiData,
        clientId: apiData.merchant?.merchant_no || '-',
        clientName: apiData.merchant?.merchant_name || '-',
        accountId: apiData.id || '-',
        statusText: apiData.status_text || this.mapApiStatusToText(apiData.status),
        operateTime: this.formatTime(apiData.updated_at || apiData.created_at)
      }

      if (this.viewMode === 'digital') {
        return {
          ...baseData,
          walletName: apiData.wallet_name || '-',
          channel: apiData.chain_name || '-',
          currency: apiData.coin_name || '-',
          address: apiData.address || 'Not Set',
          memo: apiData.memo || '-',
          balance: apiData.balance || '0.00000000',
          frozenAmount: apiData.frozen_amount || '0.00000000',
          dailyWithdrawalLimit: apiData.daily_withdrawal_limit || '-',
          whitelistIps: apiData.whitelist_ips || '-',
          remarks: apiData.remarks || '-'
        }
      } else {
        return {
          ...baseData,
          accountName: apiData.account_name || '-',
          bankName: apiData.bank_name || '-',
          bankCode: apiData.bank_code || '-',
          accountNumber: apiData.account_number || '-',
          accountType: this.mapAccountTypeToText(apiData.account_type),
          countryName: apiData.country_name || '-',
          countryCode: apiData.country_code || '-',
          residenceAddress: apiData.residence_address || '-',
          postalCode: apiData.postal_code || '-',
          intermediateBankName: apiData.intermediate_bank_name || '-',
          intermediateBankSwiftCode: apiData.intermediate_bank_swift_code || '-',
          bankBranch: apiData.bank_branch || '-',
          city: apiData.city || '-',
          state: apiData.state || '-',
          currency: apiData.currency || '-',
          proofFiles: apiData.proof_files || [],
          reviewedAt: apiData.reviewed_at ? this.formatTime(apiData.reviewed_at) : '-',
          reviewedBy: apiData.reviewed_by || '-',
          account: apiData.masked_account_number || apiData.account_number || '-'
        }
      }
    },

    // 关闭详情抽屉
    closeDetailDrawer () {
      this.detailDrawerVisible = false
      this.selectedRecord = null
    },

    // 拒绝操作
    async handleReject () {
      if (!this.selectedRecord) return

      this.actionLoading = true
      try {
        const apiUrl = this.viewMode === 'digital'
          ? '/admin/merchant/withdraw/v2/digital/address/reject'
          : '/admin/merchant/withdraw/v2/fiat/address/reject'

        const response = await request({
          url: apiUrl,
          method: 'POST',
          data: {
            id: this.selectedRecord.id
          }
        })

        if (response.code === 200) {
          this.$message.success('Request rejected successfully')
          this.closeDetailDrawer()
          // 重新获取列表数据
          this.fetchData()
        } else {
          this.$message.error(response.message || 'Reject operation failed')
        }
      } catch (error) {
        console.error('拒绝操作失败:', error)
        this.$message.error('Network error, please try again')
      } finally {
        this.actionLoading = false
      }
    },

    // 同意操作
    async handleAgree () {
      if (!this.selectedRecord) return

      this.actionLoading = true
      try {
        const apiUrl = this.viewMode === 'digital'
          ? '/admin/merchant/withdraw/v2/digital/address/approve'
          : '/admin/merchant/withdraw/v2/fiat/address/approve'

        const response = await request({
          url: apiUrl,
          method: 'POST',
          data: {
            id: this.selectedRecord.id
          }
        })

        if (response.code === 200) {
          this.$message.success('Request approved successfully')
          this.closeDetailDrawer()
          // 重新获取列表数据
          this.fetchData()
        } else {
          this.$message.error(response.message || 'Approve operation failed')
        }
      } catch (error) {
        console.error('同意操作失败:', error)
        this.$message.error('Network error, please try again')
      } finally {
        this.actionLoading = false
      }
    },

    // 获取状态颜色
    getStatusColor (status) {
      const colors = {
        'Pending': 'orange',
        'Approved': 'green',
        'Rejected': 'red',
        'Disabled': 'red',
        'Active': 'green',
        'Enabled': 'green'
      }
      return colors[status] || 'default'
    },

    // 获取状态图标
    getStatusIcon (status) {
      const icons = {
        'Pending': 'clock-circle',
        'Approved': 'check-circle',
        'Rejected': 'close-circle',
        'Disabled': 'close-circle',
        'Active': 'check-circle',
        'Enabled': 'check-circle'
      }
      return icons[status] || 'exclamation-circle'
    }
  }
}
</script>

<style lang="less" scoped>
.withdrawal-address-management {
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
      .anticon {
        margin-right: 4px;
      }
    }

    .review-action {
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
