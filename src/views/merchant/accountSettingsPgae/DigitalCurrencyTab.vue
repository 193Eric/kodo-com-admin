<template>
  <div class="digital-currency-management">
    <!-- 搜索过滤区域 -->
    <div class="filter-section">
      <a-row :gutter="16">
        <a-col :span="4">
          <a-input
            v-model="filters.clientId"
            placeholder="Client ID"
            size="default"
          />
        </a-col>
        <a-col :span="4">
          <a-input
            v-model="filters.clientName"
            placeholder="Client Name"
            size="default"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="filters.channel"
            placeholder="Channel"
            size="default"
            style="width: 100%"
            allowClear
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="TRC20">TRC20</a-select-option>
            <a-select-option value="ERC20">ERC20</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
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
            <a-select-option value="Actived">Actived</a-select-option>
            <a-select-option value="Disable">Disable</a-select-option>
            <a-select-option value="Inactive">Inactive</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="handleSearch" style="margin-right: 8px">
            Search
          </a-button>
          <a-button @click="handleReset">
            Reset
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 新增按钮 -->
    <div class="action-section">
      <a-button type="primary" @click="handleNewAccount">
        <a-icon type="plus" />
        New Account
      </a-button>
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
                    <span class="switch-status-text">{{ accountActive ? 'Actived' : 'Inactive' }}</span>
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
      <div v-if="selectedRecord">
        <a-row :gutter="[16, 24]">
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
              <div class="detail-label">Submit Time</div>
              <div class="detail-value">{{ selectedRecord.operateTime }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Entity Country/Region</div>
              <div class="detail-value">
                <img :src="getCountryFlag('HongKong')" class="country-flag" alt="HK" />
                HongKong
              </div>
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
              <div class="detail-label">Account</div>
              <div class="detail-value">012807100000001012</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Account Type</div>
              <div class="detail-value">同名VA</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Currency</div>
              <div class="detail-value">{{ selectedRecord.currency }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Operator ID</div>
              <div class="detail-value">OP-101</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Operator Name</div>
              <div class="detail-value">John Smith</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Operate Time</div>
              <div class="detail-value">{{ selectedRecord.operateTime }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">
                <a-tag :color="getStatusColor(selectedRecord.status)">
                  <a-icon :type="getStatusIcon(selectedRecord.status)" />
                  {{ selectedRecord.status }}
                </a-tag>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </a-drawer>
  </div>
</template>

<script>
export default {
  name: 'DigitalCurrencyAddressManagement',
  data () {
    return {
      // 过滤条件
      filters: {
        clientId: '',
        clientName: '',
        channel: '',
        currency: '',
        status: ''
      },

      // 弹窗和抽屉状态
      statusModalVisible: false,
      detailDrawerVisible: false,
      selectedRecord: null,
      accountActive: false,

      // 分页配置
      pagination: {
        current: 1,
        pageSize: 10,
        total: 97,
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
          width: 100,
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

      // 模拟数据
      tableData: [
        {
          key: '1',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'TRC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          status: 'Actived'
        },
        {
          key: '2',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'TRC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          status: 'Actived'
        },
        {
          key: '3',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'TRC20',
          currency: 'USDC',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          status: 'Actived'
        },
        {
          key: '4',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'TRC20',
          currency: 'USDC',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          status: 'Actived'
        },
        {
          key: '5',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'ERC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          status: 'Disable'
        },
        {
          key: '6',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'ERC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          status: 'Disable'
        },
        {
          key: '7',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'ERC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          status: 'Inactive'
        },
        {
          key: '8',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'ERC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          status: 'Inactive'
        },
        {
          key: '9',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'ERC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          status: 'Inactive'
        },
        {
          key: '10',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'ERC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          status: 'Inactive'
        }
      ]
    }
  },

  computed: {
    // 过滤后的数据
    filteredData () {
      let data = [...this.tableData]

      if (this.filters.clientId) {
        data = data.filter(item =>
          item.clientId.toLowerCase().includes(this.filters.clientId.toLowerCase())
        )
      }

      if (this.filters.clientName) {
        data = data.filter(item =>
          item.clientName.toLowerCase().includes(this.filters.clientName.toLowerCase())
        )
      }

      if (this.filters.channel) {
        data = data.filter(item => item.channel === this.filters.channel)
      }

      if (this.filters.currency) {
        data = data.filter(item => item.currency === this.filters.currency)
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
        clientId: '',
        clientName: '',
        channel: '',
        currency: '',
        status: ''
      }
      this.$message.info('Filters reset')
    },

    // 新建账户
    handleNewAccount () {
      this.$message.info('New Account functionality')
    },

    // 复制地址
    copyAddress (address) {
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
      this.accountActive = record.status === 'Actived'
      this.statusModalVisible = true
    },

    // 确认状态修改
    handleStatusConfirm () {
      if (this.selectedRecord) {
        const newStatus = this.accountActive ? 'Actived' : 'Inactive'
        // 更新数据
        const index = this.tableData.findIndex(item => item.key === this.selectedRecord.key)
        if (index > -1) {
          this.tableData[index].status = newStatus
        }
        this.$message.success(`Account status updated to ${newStatus}`)
      }
      this.statusModalVisible = false
      this.selectedRecord = null
    },

    // 取消状态修改
    handleStatusCancel () {
      this.statusModalVisible = false
      this.selectedRecord = null
    },

    // 查看详情
    handleView (record) {
      this.selectedRecord = record
      this.detailDrawerVisible = true
    },

    // 关闭详情抽屉
    closeDetailDrawer () {
      this.detailDrawerVisible = false
      this.selectedRecord = null
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
