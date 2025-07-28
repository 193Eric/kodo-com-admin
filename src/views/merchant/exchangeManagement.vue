<template>
  <div class="exchange-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">Exchange Management</h1>
    </div>

    <!-- 搜索过滤区域 -->
    <div class="filter-section">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input
            v-model="filters.recipient"
            placeholder="Recipient"
            size="default"
          />
        </a-col>
        <a-col :span="6">
          <a-select
            v-model="filters.currency"
            placeholder="Currency"
            size="default"
            style="width: 100%"
            allowClear
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="USDT">USDT</a-select-option>
            <a-select-option value="USDC">USDC</a-select-option>
            <a-select-option value="USD">USD</a-select-option>
            <a-select-option value="BRL">BRL</a-select-option>
            <a-select-option value="COP">COP</a-select-option>
          </a-select>
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
            <a-select-option value="Actived">Actived</a-select-option>
            <a-select-option value="Disable">Disable</a-select-option>
          </a-select>
        </a-col>
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
        :pagination="pagination"
        :scroll="{ x: 1200 }"
        rowKey="key"
        size="middle"
      >
        <!-- 货币对列自定义渲染 -->
        <template slot="currencyPair" slot-scope="text, record">
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

        <!-- 状态列自定义渲染 - 可点击 -->
        <template slot="status" slot-scope="text, record">
          <a-tag
            :color="getStatusColor(text)"
            @click="handleStatusClick(record)"
            class="status-tag clickable"
          >
            <a-icon :type="getStatusIcon(text)" />
            {{ text }}
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

    <!-- 总计显示 -->
    <div class="total-section">
      <span class="total-text">Total of {{ filteredData.length }} items</span>
    </div>

    <!-- 状态设置弹窗 -->
    <a-modal
      :title="'Status Settings'"
      :visible="statusModalVisible"
      @ok="handleStatusConfirm"
      @cancel="handleStatusCancel"
      width="500px"
      :okText="'Confirm'"
      :cancelText="'Cancel'"
      :maskClosable="false"
    >
      <div v-if="selectedRecord" class="status-modal-content">
        <!-- Currency Pair -->
        <div class="status-modal-field">
          <div class="status-field-label">Currency Pair</div>
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

        <!-- Active Currency Pair -->
        <div class="status-modal-field">
          <div class="active-pair-row">
            <div class="active-pair-left">
              <div class="status-field-label" style="color:#000">Active Currency Pair</div>
              <div class="status-field-description">
                Disabling this currency pair will remove it from exchange options.
                <div class="active-pair-right">
                  <div class="switch-container">
                    <a-switch
                      v-model="pairActive"
                      :checked="pairActive"
                      size="default"
                    />
                    <span class="switch-status-text">{{ pairActive ? 'Actived' : 'Disable' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 编辑详情抽屉 -->
    <a-drawer
      title="Details"
      :width="600"
      :visible="editDrawerVisible"
      @close="closeEditDrawer"
      :bodyStyle="{ padding: '24px', paddingBottom: '80px' }"
    >
      <div v-if="selectedRecord">
        <a-row :gutter="[16, 24]">
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Entity Country/Region</div>
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
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Exchange Rate</div>
              <div class="detail-value">
                <a-input
                  v-model="editableRecord.exchangeRate"
                  class="full-width-input"
                  size="large"
                />
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Provider</div>
              <div class="detail-value">
                <a-select
                  v-model="editableRecord.provider"
                  class="full-width-select"
                  size="large"
                >
                  <a-select-option value="xCurrency">xCurrency</a-select-option>
                  <a-select-option value="WISE">WISE</a-select-option>
                </a-select>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Markup</div>
              <div class="detail-value">
                <div class="rate-input-container">
                  <a-input
                    v-model="editableRecord.markup"
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
              <div class="detail-label">Service Charge</div>
              <div class="detail-value">
                <div class="rate-input-container">
                  <a-input
                    v-model="editableRecord.serviceCharge"
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
              <div class="detail-label">Minimum Limit</div>
              <div class="detail-value">
                <a-input
                  v-model="editableRecord.minimumLimit"
                  class="full-width-input"
                  size="large"
                />
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Maximum Limit</div>
              <div class="detail-value">
                <a-input
                  v-model="editableRecord.maximumLimit"
                  class="full-width-input"
                  size="large"
                />
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Statu Type</div>
              <div class="detail-value">
                <div class="status-select-container">
                  <div class="status-display">
                    <span class="status-dot" :class="editableRecord.status.toLowerCase()"></span>
                    <span class="status-text">{{ editableRecord.status }}</span>
                    <a-button
                      type="link"
                      size="small"
                      @click="toggleStatus"
                      class="change-status-btn-inner"
                    >
                      Change Statu
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Deduction Type</div>
              <div class="detail-value">
                <a-radio-group v-model="editableRecord.deductionType" class="deduction-radio-group">
                  <a-radio value="inclusive">Inclusive Fee</a-radio>
                  <a-radio value="surcharge">Surcharge</a-radio>
                </a-radio-group>
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
export default {
  name: 'ExchangeManagement',
  data () {
    return {
      // 过滤条件
      filters: {
        recipient: '',
        currency: '',
        status: ''
      },

      // 弹窗和抽屉状态
      statusModalVisible: false,
      editDrawerVisible: false,
      selectedRecord: null,
      pairActive: false,
      editableRecord: {
        exchangeRate: '1.0000',
        provider: 'WISE',
        markup: '0.001',
        serviceCharge: '0.05',
        minimumLimit: '1 USD',
        maximumLimit: '100,000 USD',
        status: 'Actived',
        deductionType: 'inclusive'
      },

      // 分页配置
      pagination: {
        current: 1,
        pageSize: 10,
        total: 6,
        showSizeChanger: false,
        showQuickJumper: false,
        showTotal: false
      },

      // 表格列配置
      columns: [
        {
          title: 'Currency Pair',
          key: 'currencyPair',
          width: 200,
          scopedSlots: { customRender: 'currencyPair' }
        },
        {
          title: 'Provider',
          dataIndex: 'provider',
          key: 'provider',
          width: 120
        },
        {
          title: 'Exchange rate',
          dataIndex: 'exchangeRate',
          key: 'exchangeRate',
          width: 120
        },
        {
          title: 'Markup',
          dataIndex: 'markup',
          key: 'markup',
          width: 100
        },
        {
          title: 'Service Charge',
          dataIndex: 'serviceCharge',
          key: 'serviceCharge',
          width: 120
        },
        {
          title: 'Minimum Limit',
          dataIndex: 'minimumLimit',
          key: 'minimumLimit',
          width: 120
        },
        {
          title: 'Maximum Limit',
          dataIndex: 'maximumLimit',
          key: 'maximumLimit',
          width: 120
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          width: 100,
          scopedSlots: { customRender: 'status' }
        },
        {
          title: 'Actions',
          key: 'action',
          width: 100,
          scopedSlots: { customRender: 'action' }
        }
      ],

      // 模拟数据
      tableData: [
        {
          key: '1',
          fromCurrency: 'USDT',
          toCurrency: 'USD',
          provider: 'xCurrency',
          exchangeRate: '1.0000',
          markup: '0.001%',
          serviceCharge: '0.05%',
          minimumLimit: '1,000USD',
          maximumLimit: '100,000USD',
          status: 'Actived'
        },
        {
          key: '2',
          fromCurrency: 'USDC',
          toCurrency: 'USD',
          provider: 'WISE',
          exchangeRate: '1.0000',
          markup: '0.001%',
          serviceCharge: '0.05%',
          minimumLimit: '1,000USD',
          maximumLimit: '100,000USD',
          status: 'Actived'
        },
        {
          key: '3',
          fromCurrency: 'USD',
          toCurrency: 'USDT',
          provider: 'WISE',
          exchangeRate: '1.0000',
          markup: '0.001%',
          serviceCharge: '0.05%',
          minimumLimit: '1,000USD',
          maximumLimit: '100,000USD',
          status: 'Actived'
        },
        {
          key: '4',
          fromCurrency: 'USD',
          toCurrency: 'USDC',
          provider: 'WISE',
          exchangeRate: '1.0000',
          markup: '0.001%',
          serviceCharge: '0.05%',
          minimumLimit: '1,000USD',
          maximumLimit: '100,000USD',
          status: 'Actived'
        },
        {
          key: '5',
          fromCurrency: 'BRL',
          toCurrency: 'USDT',
          provider: 'xCurrency',
          exchangeRate: '1.0000',
          markup: '0.001%',
          serviceCharge: '0.05%',
          minimumLimit: '1,000USD',
          maximumLimit: '100,000USD',
          status: 'Disable'
        },
        {
          key: '6',
          fromCurrency: 'COP',
          toCurrency: 'USDT',
          provider: 'xCurrency',
          exchangeRate: '1.0000',
          markup: '0.001%',
          serviceCharge: '0.05%',
          minimumLimit: '1,000USD',
          maximumLimit: '100,000USD',
          status: 'Disable'
        }
      ]
    }
  },

  computed: {
    // 过滤后的数据
    filteredData () {
      let data = [...this.tableData]

      if (this.filters.recipient) {
        data = data.filter(item =>
          (item.fromCurrency + item.toCurrency).toLowerCase().includes(this.filters.recipient.toLowerCase())
        )
      }

      if (this.filters.currency) {
        data = data.filter(item =>
          item.fromCurrency === this.filters.currency || item.toCurrency === this.filters.currency
        )
      }

      if (this.filters.status) {
        data = data.filter(item => item.status === this.filters.status)
      }

      return data
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
        recipient: '',
        currency: '',
        status: ''
      }
      this.$message.info('Filters reset')
    },

    // 点击状态标签
    handleStatusClick (record) {
      this.selectedRecord = record
      this.pairActive = record.status === 'Actived'
      this.statusModalVisible = true
    },

    // 确认状态修改
    handleStatusConfirm () {
      if (this.selectedRecord) {
        const newStatus = this.pairActive ? 'Actived' : 'Disable'
        // 更新数据
        const index = this.tableData.findIndex(item => item.key === this.selectedRecord.key)
        if (index > -1) {
          this.tableData[index].status = newStatus
        }
        this.$message.success(`Currency pair status updated to ${newStatus}`)
      }
      this.statusModalVisible = false
      this.selectedRecord = null
    },

    // 取消状态修改
    handleStatusCancel () {
      this.statusModalVisible = false
      this.selectedRecord = null
    },

    // 编辑按钮点击
    handleEdit (record) {
      this.selectedRecord = { ...record }
      this.editableRecord = {
        exchangeRate: record.exchangeRate,
        provider: record.provider,
        markup: record.markup ? record.markup.replace('%', '') : '0.001',
        serviceCharge: record.serviceCharge ? record.serviceCharge.replace('%', '') : '0.05',
        minimumLimit: record.minimumLimit,
        maximumLimit: record.maximumLimit,
        status: record.status,
        deductionType: 'inclusive'
      }
      this.editDrawerVisible = true
    },

    // 关闭编辑抽屉
    closeEditDrawer () {
      this.editDrawerVisible = false
      this.selectedRecord = null
    },

    // 切换状态
    toggleStatus () {
      this.editableRecord.status = this.editableRecord.status === 'Actived' ? 'Disable' : 'Actived'
    },

    // 取消编辑操作
    handleCancel () {
      this.closeEditDrawer()
    },

    // 确认编辑操作
    handleConfirm () {
      if (this.selectedRecord) {
        // 更新数据
        const index = this.tableData.findIndex(item => item.key === this.selectedRecord.key)
        if (index > -1) {
          this.tableData[index].exchangeRate = this.editableRecord.exchangeRate
          this.tableData[index].provider = this.editableRecord.provider
          this.tableData[index].markup = this.editableRecord.markup + '%'
          this.tableData[index].serviceCharge = this.editableRecord.serviceCharge + '%'
          this.tableData[index].minimumLimit = this.editableRecord.minimumLimit
          this.tableData[index].maximumLimit = this.editableRecord.maximumLimit
          this.tableData[index].status = this.editableRecord.status
        }
        this.$message.success('Changes saved successfully')
        this.closeEditDrawer()
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
.exchange-management {
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

    .edit-action {
      color: #1890ff;
      font-weight: 500;

      &:hover {
        color: #40a9ff;
      }
    }
  }

  .total-section {
    margin-top: 16px;
    padding: 12px 0;
    border-top: 1px solid #f0f0f0;

    .total-text {
      color: #8c8c8c;
      font-size: 14px;
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

  .full-width-input {
    width: 100%;
    border-radius: 6px;
    border: 1px solid #d9d9d9;

    &:hover, &:focus {
      border-color: #40a9ff;
    }
  }

  .full-width-select {
    width: 100%;

    /deep/ .ant-select-selection {
      border-radius: 6px;
      border: 1px solid #d9d9d9;
      height: 40px;
      line-height: 38px;

      &:hover {
        border-color: #40a9ff;
      }
    }

    /deep/ .ant-select-focused .ant-select-selection {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }

  .status-select-container {
    width: 600px;

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
        color: #1890ff;
        margin-left: auto;

        &:hover {
          color: #40a9ff;
        }
      }
    }
  }

  .deduction-radio-group {
    /deep/ .ant-radio-wrapper {
      margin-right: 24px;
      font-size: 14px;
    }
  }

  // 抽屉底部按钮样式
  .drawer-footer {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    border-left: 1px solid #f0f0f0;
    border-top-left-radius: 6px;
    text-align: right;
    z-index: 1;
    width:100%;
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

      .status-field-description {
        font-size: 12px;
        color: #8c8c8c;
        margin-top: 8px;
        line-height: 1.5;
      }

      .active-pair-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;

        .active-pair-left {
          flex: 1;
        }

        .active-pair-right {
          flex-shrink: 0;
          display: flex;
          float: right;
          margin-top: -10px;
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

/deep/ .ant-drawer-body {
  position: relative;
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
