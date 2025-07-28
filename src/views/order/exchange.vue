<template>
  <div class="exchange-processing">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">Exchange Processing</h1>
    </div>

    <!-- 搜索过滤区域 -->
    <div class="filter-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model="filters.orderId"
            placeholder="Order ID"
            size="default"
          />
        </a-col>
        <a-col :span="6">
          <a-input
            v-model="filters.clientId"
            placeholder="Client ID"
            size="default"
          />
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="filters.status"
            placeholder="Status"
            size="default"
            style="width: 100%"
            allowClear
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="Processing">Processing</a-select-option>
            <a-select-option value="Awaiting remittance">Awaiting remittance</a-select-option>
            <a-select-option value="Remittanced">Remittanced</a-select-option>
            <a-select-option value="Fail">Fail</a-select-option>
            <a-select-option value="Success">Success</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-date-picker
            v-model="filters.date"
            placeholder="Date"
            size="default"
            style="width: 100%"
          />
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-button type="primary" @click="handleSearch" style="margin-right: 8px">
            Search
          </a-button>
          <a-button @click="handleReset">
            Reset
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-table
        :columns="columns"
        :dataSource="filteredData"
        :pagination="false"
        :scroll="{ x: 1400 }"
        rowKey="key"
        size="middle"
      >
        <!-- 货币对列自定义渲染 -->
        <template slot="fxDirection" slot-scope="text, record">
          <div class="currency-pair-cell">
            <div class="currency-item">
              <img :src="getCurrencyIcon(record.fromCurrency)" class="currency-icon" :alt="record.fromCurrency" />
              <span class="currency-text">{{ record.fromCurrency }}</span>
            </div>
            <a-icon type="arrow-right" class="arrow-icon" />
            <div class="currency-item">
              <img :src="getCurrencyIcon(record.toCurrency)" class="currency-icon" :alt="record.toCurrency" />
              <span class="currency-text">{{ record.toCurrency }}</span>
            </div>
          </div>
        </template>

        <!-- 金额列自定义渲染 -->
        <template slot="amount" slot-scope="text, record">
          <div class="amount-cell">
            <span>{{ record.fromAmount }}</span>
            <a-icon type="arrow-right" class="arrow-icon" />
            <span>{{ record.toAmount }}</span>
          </div>
        </template>

        <!-- 状态列自定义渲染 -->
        <template slot="status" slot-scope="text, record">
          <span class="status-tag">
            <span class="status-dot" :class="getStatusDotClass(text)"></span>
            {{ text }}
          </span>
        </template>

        <!-- 操作列自定义渲染 -->
        <template slot="action" slot-scope="text, record">
          <a-button
            v-if="record.actionType === 'Received'"
            type="link"
            size="small"
            @click="handleReceived(record)"
            class="action-btn"
          >
            Received
          </a-button>
          <a-button
            v-else-if="record.actionType === 'Notify'"
            type="link"
            size="small"
            @click="handleNotify(record)"
            class="action-btn"
          >
            Notify
          </a-button>
          <a-button
            v-else-if="record.actionType === 'View' || record.status === 'Success' || record.status === 'Fail'"
            type="link"
            size="small"
            @click="handleView(record)"
            class="action-btn"
          >
            View
          </a-button>
          <span v-else class="no-action">-</span>
        </template>
      </a-table>
    </div>

    <!-- 分页和总计显示 -->
    <div class="pagination-section">
      <div class="pagination-left">
        <span class="pagination-text">{{ startRecord }}-{{ endRecord }} of {{ pagination.total }}</span>
      </div>
      <div class="pagination-right">
        <span class="rows-per-page">Rows per page:</span>
        <a-select
          :value="pagination.pageSize"
          size="small"
          style="width: 60px; margin: 0 16px;"
          @change="handlePageSizeChange"
        >
          <a-select-option :value="10">10</a-select-option>
          <a-select-option :value="20">20</a-select-option>
          <a-select-option :value="50">50</a-select-option>
        </a-select>
        <span class="page-info">{{ pagination.current }}/{{ totalPages }}</span>
        <a-button
          type="link"
          size="small"
          @click="goToPrevPage"
          :disabled="pagination.current === 1"
          class="nav-btn"
        >
          <a-icon type="left" />
        </a-button>
        <a-button
          type="link"
          size="small"
          @click="goToNextPage"
          :disabled="pagination.current >= totalPages"
          class="nav-btn"
        >
          <a-icon type="right" />
        </a-button>
      </div>
    </div>

    <!-- 统一的订单详情抽屉 -->
    <a-drawer
      :title="'Exchange Processing'"
      :visible="modalVisible"
      @close="handleModalCancel"
      width="600px"
      placement="right"
      :maskClosable="false"
    >
      <div v-if="selectedRecord" class="modal-content">
        <!-- Order Details Section -->
        <div class="order-details-section">
          <h3 class="section-title">Order Details</h3>
          <a-row :gutter="[24, 16]">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Client ID</div>
                <div class="detail-value">{{ selectedRecord.clientId }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Creation Time</div>
                <div class="detail-value">{{ selectedRecord.creationTime }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Client ID</div>
                <div class="detail-value">{{ selectedRecord.clientId }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">FX Direction</div>
                <div class="detail-value">
                  <div class="currency-pair-display">
                    <div class="currency-item">
                      <img :src="getCurrencyIcon(selectedRecord.fromCurrency)" class="currency-icon" :alt="selectedRecord.fromCurrency" />
                      <span class="currency-text">{{ selectedRecord.fromCurrency }}</span>
                    </div>
                    <a-icon type="arrow-right" class="arrow-icon" />
                    <div class="currency-item">
                      <img :src="getCurrencyIcon(selectedRecord.toCurrency)" class="currency-icon" :alt="selectedRecord.toCurrency" />
                      <span class="currency-text">{{ selectedRecord.toCurrency }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Amount</div>
                <div class="detail-value">
                  <div>{{ selectedRecord.fromAmount }}</div>
                  <a-icon type="arrow-right" style="margin: 0 8px; color: #8c8c8c;" />
                  <div>{{ selectedRecord.toAmount }}</div>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Exchange Rate</div>
                <div class="detail-value">{{ selectedRecord.exchangeRate }}</div>
              </div>
            </a-col>
            <a-col :span="24">
              <div class="detail-item">
                <div class="detail-label">Service Charge</div>
                <div class="detail-value">{{ selectedRecord.serviceCharge }}</div>
              </div>
            </a-col>
          </a-row>
        </div>

        <!-- Order Progress Section -->
        <div class="order-progress-section">
          <h3 class="section-title">
            Order Progress
            <span class="progress-status" :class="getProgressStatusClass(currentProgressStatus)">
              <span class="status-dot" :class="getStatusDotClass(currentProgressStatus)"></span>
              {{ currentProgressStatus }}
            </span>
          </h3>

          <!-- Progress Steps -->
          <div class="progress-steps">
            <div
              v-for="(step, index) in progressSteps"
              :key="index"
              class="progress-step"
              :class="{
                'completed': step.status === 'completed',
                'current': step.status === 'current',
                'pending': step.status === 'pending'
              }"
            >
              <div class="step-circle">
                <a-icon
                  v-if="step.status === 'completed'"
                  type="check"
                  class="step-icon completed-icon"
                />
                <span
                  v-else-if="step.status === 'current'"
                  class="step-number current-number"
                >
                  {{ index + 1 }}
                </span>
                <span v-else class="step-number">{{ index + 1 }}</span>
              </div>
              <div class="step-content">
                <div class="step-title" :class="step.status">{{ step.title }}</div>
                <div class="step-subtitle" :class="step.status">{{ step.subtitle }}</div>
              </div>
              <div
                v-if="index < progressSteps.length - 1"
                class="step-connector"
                :class="{ 'completed': progressSteps[index + 1].status === 'completed' || progressSteps[index + 1].status === 'current' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Operation Record Section (only show when there are records) -->
        <div v-if="operationRecords.length > 0" class="operation-record-section">
          <h3 class="section-title">Operation Record</h3>
          <div class="operation-list">
            <div
              v-for="(record, index) in operationRecords"
              :key="index"
              class="operation-item"
            >
              <div class="operation-icon">
                <a-icon type="check" />
              </div>
              <div class="operation-content">
                <div class="operation-text">{{ record.action }}</div>
                <div class="operation-time">{{ record.time }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer Buttons -->
        <div class="modal-footer">
          <a-button @click="handleModalCancel" size="large">
            Cancel
          </a-button>
          <a-button
            v-if="showConfirmButton"
            type="primary"
            @click="handleConfirmAction"
            size="large"
            class="confirm-btn"
          >
            {{ confirmButtonText }}
          </a-button>
          <a-button
            v-if="showNotifyButton"
            type="primary"
            @click="handleNotifyAction"
            size="large"
            class="notify-btn"
          >
            {{ notifyButtonText }}
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
export default {
  name: 'ExchangeProcessing',
  data () {
    return {
      // 过滤条件
      filters: {
        orderId: '',
        clientId: '',
        status: '',
        date: null
      },

      // 弹窗状态
      modalVisible: false,
      selectedRecord: null,
      currentModalType: '', // 'received', 'notify', 'view'

      // 分页配置
      pagination: {
        current: 1,
        pageSize: 10,
        total: 97
      },

      // 表格列配置
      columns: [
        {
          title: 'Order ID',
          dataIndex: 'orderId',
          key: 'orderId',
          width: 100
        },
        {
          title: 'Creation Time',
          dataIndex: 'creationTime',
          key: 'creationTime',
          width: 150
        },
        {
          title: 'Client ID',
          dataIndex: 'clientId',
          key: 'clientId',
          width: 100
        },
        {
          title: 'FX Direction',
          key: 'fxDirection',
          width: 180,
          scopedSlots: { customRender: 'fxDirection' }
        },
        {
          title: 'Amount',
          key: 'amount',
          width: 150,
          scopedSlots: { customRender: 'amount' }
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          width: 150,
          scopedSlots: { customRender: 'status' }
        },
        {
          title: 'Actions',
          key: 'action',
          width: 100,
          fixed: 'right',
          scopedSlots: { customRender: 'action' }
        }
      ],

      // 模拟数据
      tableData: [
        {
          key: '1',
          orderId: 'FX-001',
          creationTime: '2025/02/10 12:20:32',
          clientId: 'CLI-001',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          fromAmount: '1,000USDT',
          toAmount: '980USD',
          exchangeRate: '0.98',
          serviceCharge: '40USDT',
          status: 'Processing',
          actionType: 'Received'
        },
        {
          key: '2',
          orderId: 'FX-001',
          creationTime: '2025/02/10 12:20:32',
          clientId: 'CLI-001',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          fromAmount: '1,000USDT',
          toAmount: '980USD',
          exchangeRate: '0.98',
          serviceCharge: '40USDT',
          status: 'Awaiting remittance',
          actionType: 'Notify'
        },
        {
          key: '3',
          orderId: 'FX-001',
          creationTime: '2025/02/10 12:20:32',
          clientId: 'CLI-001',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          fromAmount: '1,000USDT',
          toAmount: '980USD',
          exchangeRate: '0.98',
          serviceCharge: '40USDT',
          status: 'Remittanced',
          actionType: 'View'
        },
        {
          key: '4',
          orderId: 'FX-001',
          creationTime: '2025/02/10 12:20:32',
          clientId: 'CLI-001',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          fromAmount: '1,000USDT',
          toAmount: '980USD',
          exchangeRate: '0.98',
          serviceCharge: '40USDT',
          status: 'Processing',
          actionType: 'Received'
        },
        {
          key: '5',
          orderId: 'FX-001',
          creationTime: '2025/02/10 12:20:32',
          clientId: 'CLI-001',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          fromAmount: '1,000USDT',
          toAmount: '980USD',
          exchangeRate: '0.98',
          serviceCharge: '40USDT',
          status: 'Processing',
          actionType: 'Received'
        },
        {
          key: '6',
          orderId: 'FX-001',
          creationTime: '2025/02/10 12:20:32',
          clientId: 'CLI-001',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          fromAmount: '1,000USDT',
          toAmount: '980USD',
          exchangeRate: '0.98',
          serviceCharge: '40USDT',
          status: 'Remittanced',
          actionType: 'View'
        },
        {
          key: '7',
          orderId: 'FX-001',
          creationTime: '2025/02/10 12:20:32',
          clientId: 'CLI-001',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          fromAmount: '1,000USDT',
          toAmount: '980USD',
          exchangeRate: '0.98',
          serviceCharge: '40USDT',
          status: 'Awaiting remittance',
          actionType: 'Notify'
        },
        {
          key: '8',
          orderId: 'FX-001',
          creationTime: '2025/02/10 12:20:32',
          clientId: 'CLI-001',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          fromAmount: '1,000USDT',
          toAmount: '980USD',
          exchangeRate: '0.98',
          serviceCharge: '40USDT',
          status: 'Fail',
          actionType: ''
        },
        {
          key: '9',
          orderId: 'FX-001',
          creationTime: '2025/02/10 12:20:32',
          clientId: 'CLI-001',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          fromAmount: '1,000USDT',
          toAmount: '980USD',
          exchangeRate: '0.98',
          serviceCharge: '40USDT',
          status: 'Success',
          actionType: ''
        },
        {
          key: '10',
          orderId: 'FX-001',
          creationTime: '2025/02/10 12:20:32',
          clientId: 'CLI-001',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          fromAmount: '1,000USDT',
          toAmount: '980USD',
          exchangeRate: '0.98',
          serviceCharge: '40USDT',
          status: 'Success',
          actionType: ''
        }
      ]
    }
  },

  computed: {
    // 过滤后的数据
    filteredData () {
      let data = [...this.tableData]

      if (this.filters.orderId) {
        data = data.filter(item =>
          item.orderId.toLowerCase().includes(this.filters.orderId.toLowerCase())
        )
      }

      if (this.filters.clientId) {
        data = data.filter(item =>
          item.clientId.toLowerCase().includes(this.filters.clientId.toLowerCase())
        )
      }

      if (this.filters.status) {
        data = data.filter(item => item.status === this.filters.status)
      }

      return data.slice(
        (this.pagination.current - 1) * this.pagination.pageSize,
        this.pagination.current * this.pagination.pageSize
      )
    },

    // 总页数
    totalPages () {
      return Math.ceil(this.pagination.total / this.pagination.pageSize)
    },

    // 开始记录数
    startRecord () {
      return (this.pagination.current - 1) * this.pagination.pageSize + 1
    },

    // 结束记录数
    endRecord () {
      return Math.min(this.pagination.current * this.pagination.pageSize, this.pagination.total)
    },

    // 当前进度状态
    currentProgressStatus () {
      if (!this.selectedRecord) return ''

      switch (this.currentModalType) {
        case 'received':
          return 'Processing'
        case 'notify':
          return 'Awaiting remittance'
        case 'view':
          return 'Processing'
        default:
          return this.selectedRecord.status
      }
    },

    // 进度步骤
    progressSteps () {
      if (!this.selectedRecord) return []

      const steps = [
        { title: 'Created', subtitle: '' },
        { title: 'Processing', subtitle: 'From Ubank' },
        { title: 'Processing', subtitle: 'To Ubank' },
        { title: 'Crediting', subtitle: '' },
        { title: 'Success', subtitle: '' }
      ]

      // 根据当前模态框类型设置步骤状态
      switch (this.currentModalType) {
        case 'received':
          steps[0].status = 'completed'
          steps[1].status = 'current'
          steps[2].status = 'pending'
          steps[3].status = 'pending'
          steps[4].status = 'pending'
          break
        case 'notify':
          steps[0].status = 'completed'
          steps[1].status = 'completed'
          steps[2].status = 'current'
          steps[3].status = 'pending'
          steps[4].status = 'pending'
          break
        case 'view':
          steps[0].status = 'completed'
          steps[1].status = 'completed'
          steps[2].status = 'completed'
          steps[3].status = 'pending'
          steps[4].status = 'pending'
          break
        default:
          steps.forEach((step, index) => {
            step.status = index === 0 ? 'completed' : 'pending'
          })
      }

      return steps
    },

    // 操作记录
    operationRecords () {
      if (!this.selectedRecord) return []

      switch (this.currentModalType) {
        case 'received':
          return []
        case 'notify':
          return [
            { action: 'Confirm received', time: '02/10 12:20' }
          ]
        case 'view':
          return [
            { action: 'Confirm received', time: '02/10 12:20' },
            { action: 'Notify remittance', time: '02/10 13:10' }
          ]
        default:
          return []
      }
    },

    // 是否显示确认按钮
    showConfirmButton () {
      return this.currentModalType === 'received'
    },

    // 是否显示通知按钮
    showNotifyButton () {
      return this.currentModalType === 'notify'
    },

    // 确认按钮文本
    confirmButtonText () {
      return 'Confirm Received'
    },

    // 通知按钮文本
    notifyButtonText () {
      return this.currentModalType === 'notify' ? 'Notify Again' : 'Notify Remittance'
    }
  },

  methods: {
    // 搜索
    handleSearch () {
      console.log('Search filters:', this.filters)
      this.$message.success('Search completed')
    },

    // 重置
    handleReset () {
      this.filters = {
        orderId: '',
        clientId: '',
        status: '',
        date: null
      }
      this.$message.info('Filters reset')
    },

    // 处理Received操作
    handleReceived (record) {
      this.selectedRecord = { ...record }
      this.currentModalType = 'received'
      this.modalVisible = true
    },

    // 处理Notify操作
    handleNotify (record) {
      this.selectedRecord = { ...record }
      this.currentModalType = 'notify'
      this.modalVisible = true
    },

    // 处理View操作
    handleView (record) {
      this.selectedRecord = { ...record }
      this.currentModalType = 'view'
      this.modalVisible = true
    },

    // 确认操作
    handleConfirmAction () {
      if (this.currentModalType === 'received') {
        // 更新表格数据中的actionType
        const index = this.tableData.findIndex(item => item.key === this.selectedRecord.key)
        if (index > -1) {
          this.tableData[index].actionType = 'Notify'
          this.tableData[index].status = 'Awaiting remittance'
        }
        this.$message.success('Confirmed received successfully')
        this.modalVisible = false
      }
    },

    // 通知操作
    handleNotifyAction () {
      if (this.currentModalType === 'notify') {
        // 更新表格数据中的actionType
        const index = this.tableData.findIndex(item => item.key === this.selectedRecord.key)
        if (index > -1) {
          this.tableData[index].actionType = 'View'
          this.tableData[index].status = 'Remittanced'
        }
        this.$message.success('Notified remittance successfully')
        this.modalVisible = false
      }
    },

    // 取消弹窗
    handleModalCancel () {
      this.modalVisible = false
      this.selectedRecord = null
      this.currentModalType = ''
    },

    // 上一页
    goToPrevPage () {
      if (this.pagination.current > 1) {
        this.pagination.current--
      }
    },

    // 下一页
    goToNextPage () {
      if (this.pagination.current < this.totalPages) {
        this.pagination.current++
      }
    },

    // 改变每页显示数量
    handlePageSizeChange (pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.current = 1
    },

    // 获取状态颜色
    getStatusColor (status) {
      const colors = {
        'Processing': 'orange',
        'Awaiting remittance': 'orange',
        'Remittanced': 'green',
        'Fail': 'red',
        'Success': 'green'
      }
      return colors[status] || 'default'
    },

    // 获取状态点样式类
    getStatusDotClass (status) {
      const classes = {
        'Processing': 'processing',
        'Awaiting remittance': 'awaiting',
        'Remittanced': 'success',
        'Fail': 'error',
        'Success': 'success'
      }
      return classes[status] || 'default'
    },

    // 获取进度状态样式类
    getProgressStatusClass (status) {
      return this.getStatusDotClass(status)
    },

    // 获取货币图标
    getCurrencyIcon (currency) {
      const iconMap = {
        'USDT': require('@/assets/icons/usdt.png'),
        'USDC': require('@/assets/icons/usdc.png'),
        'USD': require('@/assets/icons/usd.png'),
        'BRL': require('@/assets/icons/brl.png'),
        // 'COP': require('@/assets/icons/cop.png'),
        'BTC': require('@/assets/icons/btc.png'),
        'EUR': require('@/assets/icons/eur.png'),
        'RUB': require('@/assets/icons/rub.png')
      }
      return iconMap[currency] || iconMap['USD']
    }
  }
}
</script>

<style lang="less" scoped>
.exchange-processing {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    margin: 0;
  }
}

.filter-section {
  background: #fafafa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.table-section {
  .currency-pair-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .currency-item {
      display: flex;
      align-items: center;
      gap: 4px;

      .currency-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
      }

      .currency-text {
        font-size: 14px;
        font-weight: 500;
      }
    }

    .arrow-icon {
      color: #8c8c8c;
      font-size: 12px;
    }
  }

  .amount-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .arrow-icon {
      color: #8c8c8c;
      font-size: 12px;
    }
  }

  .status-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.processing {
        background-color: #faad14;
      }

      &.awaiting {
        background-color: #faad14;
      }

      &.success {
        background-color: #52c41a;
      }

      &.error {
        background-color: #ff4d4f;
      }
    }
  }

  .action-btn {
    color: #1890ff;
    font-weight: 500;

    &:hover {
      color: #40a9ff;
    }
  }

  .no-action {
    color: #bfbfbf;
  }
}

// 分页样式 - 模仿参考页面
.pagination-section {
  margin-top: 16px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .pagination-left {
    .pagination-text {
      color: #8c8c8c;
      font-size: 14px;
    }
  }

  .pagination-right {
    display: flex;
    align-items: center;
    gap: 8px;

    .rows-per-page {
      color: #8c8c8c;
      font-size: 14px;
    }

    .page-info {
      color: #8c8c8c;
      font-size: 14px;
    }

    .nav-btn {
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8c8c8c;

      &:hover:not(:disabled) {
        color: #1890ff;
      }

      &:disabled {
        color: #bfbfbf;
      }
    }
  }
}

// 抽屉样式
.modal-content {
  .order-details-section {
    margin-bottom: 32px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 16px;
    }

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
      }
    }

    .currency-pair-display {
      display: flex;
      align-items: center;
      gap: 8px;

      .currency-item {
        display: flex;
        align-items: center;
        gap: 4px;

        .currency-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }

        .currency-text {
          font-size: 14px;
          font-weight: 500;
        }
      }

      .arrow-icon {
        color: #8c8c8c;
        font-size: 12px;
      }
    }
  }

  .order-progress-section {
    margin-bottom: 32px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 16px;

      .progress-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: normal;

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;

          &.processing {
            background-color: #faad14;
          }

          &.awaiting {
            background-color: #faad14;
          }

          &.success {
            background-color: #52c41a;
          }
        }

        &.processing {
          color: #faad14;
        }

        &.awaiting {
          color: #faad14;
        }

        &.success {
          color: #52c41a;
        }
      }
    }

    .progress-steps {
      display: flex;
      align-items: flex-start;
      gap: 0;

      .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        flex: 1;

        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          z-index: 2;
          background: #fff;

          .step-icon {
            font-size: 16px;

            &.completed-icon {

            }
          }

          .step-number {
            font-size: 14px;
            font-weight: 500;

            &.current-number {

            }
          }
        }

        .step-content {
          text-align: center;

          .step-title {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 2px;

            &.completed {
              color: #262626;
            }

            &.current {

            }

            &.pending {

            }
          }

          .step-subtitle {
            font-size: 12px;

            &.completed {
              color: #8c8c8c;
            }

            &.current {
              color: #8c8c8c;
            }

            &.pending {
              color: #bfbfbf;
            }
          }
        }

        .step-connector {
          position: absolute;
          top: 16px;
          left: 50%;
          right: -50%;
          height: 2px;
          background: #f0f0f0;
          z-index: 1;

          &.completed {
            background: rgba(17, 37, 62, 1)
          }
        }

        &.completed {
          .step-circle {

            border: 2px solid rgba(17, 37, 62, 1)
          }
        }

        &.current {
          .step-circle {

            border: 2px solid rgba(17, 37, 62, 1)
          }
        }

        &.pending {
          .step-circle {
            background: #fafafa;
            border: 2px solid rgba(17, 37, 62, 1);
          }

        }

        &:last-child {
          .step-connector {
            display: none;
          }
        }
      }
    }
  }

  .operation-record-section {
    margin-bottom: 32px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 16px;
    }

    .operation-list {
      .operation-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;

        .operation-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f6ffed;
          border: 1px solid #52c41a;
          display: flex;
          align-items: center;
          justify-content: center;

          .anticon {
            font-size: 12px;
            color: #52c41a;
          }
        }

        .operation-content {
          .operation-text {
            font-size: 14px;
            color: #262626;
            margin-bottom: 2px;
          }

          .operation-time {
            font-size: 12px;
            color: #8c8c8c;
          }
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    z-index: 1;

    .ant-btn {
      height: 40px;
      padding: 0 24px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
      min-width: 120px;
    }

    .confirm-btn, .notify-btn {
      background: #1c3a5c;
      border-color: #1c3a5c;

      &:hover {
        background: #2d4a6a;
        border-color: #2d4a6a;
      }
    }
  }
}

// 全局样式覆盖 - 参考样式
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
  padding-bottom: 80px;
}

/deep/ .ant-select-selection {
  border: 1px solid #d9d9d9;
}
</style>
