<template>
  <div class="withdrawal-management">
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
            v-model="filters.entityCountry"
            placeholder="Entity Country/Region"
            size="default"
            style="width: 100%"
            allowClear
            v-if="viewMode === 'fiat'"
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="HongKong">HongKong</a-select-option>
            <a-select-option value="Brazil">Brazil</a-select-option>
            <a-select-option value="Colombia">Colombia</a-select-option>
            <a-select-option value="Mexico">Mexico</a-select-option>
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
            v-model="filters.accountType"
            placeholder="Account Type"
            size="default"
            style="width: 100%"
            allowClear
            v-if="viewMode === 'fiat'"
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="virtual account">virtual account</a-select-option>
            <a-select-option value="institution account">institution account</a-select-option>
          </a-select>
          <a-select
            v-model="filters.currency"
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
            v-model="filters.status"
            placeholder="Status"
            size="default"
            style="width: 100%"
            allowClear
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="Pending">Pending</a-select-option>
            <a-select-option value="Actived">Actived</a-select-option>
            <a-select-option value="Disable">Disable</a-select-option>
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
        :dataSource="filteredData"
        :pagination="pagination"
        :scroll="{ x: 1600 }"
        rowKey="key"
        size="middle"
      >
        <!-- 实体国家/地区列自定义渲染 -->
        <template slot="entityCountry" slot-scope="text, record">
          <div class="country-cell">
            <img :src="getCountryFlag(text)" class="country-flag" :alt="text" />
            <span>{{ text }}</span>
          </div>
        </template>

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

        <!-- 状态列自定义渲染 - 不可点击 -->
        <template slot="status" slot-scope="text, record">
          <a-tag
            :color="getStatusColor(text)"
            class="status-tag"
          >
            <a-icon :type="getStatusIcon(text)" />
            {{ text }}
          </a-tag>
        </template>

        <!-- 操作列自定义渲染 -->
        <template slot="action" slot-scope="text, record">
          <div class="action-buttons">
            <a-button
              type="link"
              size="small"
              @click="handleReview(record)"
              :class="{ 'review-action': record.status === 'Pending' }"
              style="margin-right: 8px"
            >
              {{ record.status === 'Pending' ? 'Review' : 'View' }}
            </a-button>
            <a-button
              type="link"
              size="small"
              @click="handleEdit(record)"
              class="edit-action"
            >
              Edit
            </a-button>
          </div>
        </template>
      </a-table>
    </div>

    <!-- Review详情抽屉 -->
    <a-drawer
      title="Details"
      :width="600"
      :visible="reviewDrawerVisible"
      @close="closeReviewDrawer"
      :bodyStyle="{ padding: '24px', paddingBottom: '80px' }"
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

          <!-- Digital Currency 特有字段 -->
          <template v-if="viewMode === 'digital'">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Channel</div>
                <div class="detail-value">{{ selectedRecord.channel }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Address</div>
                <div class="detail-value">{{ selectedRecord.address }}</div>
              </div>
            </a-col>
          </template>

          <!-- Fiat Currency 特有字段 -->
          <template v-if="viewMode === 'fiat'">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Entity Country/Region</div>
                <div class="detail-value">
                  <div class="country-cell">
                    <img :src="getCountryFlag(selectedRecord.entityCountry)" class="country-flag" :alt="selectedRecord.entityCountry" />
                    <span>{{ selectedRecord.entityCountry }}</span>
                  </div>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Account Type</div>
                <div class="detail-value">{{ selectedRecord.accountType }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Account</div>
                <div class="detail-value">{{ selectedRecord.account }}</div>
              </div>
            </a-col>
          </template>

          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Rate</div>
              <div class="detail-value">{{ selectedRecord.rate }}</div>
            </div>
          </a-col>
          <!-- 只有Fiat Currency模式才显示Transaction Limit -->
          <a-col :span="12" v-if="viewMode === 'fiat'">
            <div class="detail-item">
              <div class="detail-label">Transaction Limit</div>
              <div class="detail-value">{{ selectedRecord.transactionLimit }}</div>
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

        <!-- Review抽屉底部按钮 - 只有Pending状态才显示 -->
        <div v-if="selectedRecord.status === 'Pending'" class="drawer-footer">
          <a-button
            @click="handleReject"
            style="margin-right: 8px"
            size="large"
          >
            Reject
          </a-button>
          <a-button
            type="primary"
            @click="handleAgree"
            size="large"
          >
            Agree
          </a-button>
        </div>
      </div>
    </a-drawer>

    <!-- Edit详情抽屉 -->
    <a-drawer
      title="Details"
      :width="600"
      :visible="editDrawerVisible"
      @close="closeEditDrawer"
      :bodyStyle="{ padding: '24px', paddingBottom: '80px' }"
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

          <!-- Digital Currency 特有字段 -->
          <template v-if="viewMode === 'digital'">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Channel</div>
                <div class="detail-value">{{ selectedRecord.channel }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Address</div>
                <div class="detail-value">{{ selectedRecord.address }}</div>
              </div>
            </a-col>
          </template>

          <!-- Fiat Currency 特有字段 -->
          <template v-if="viewMode === 'fiat'">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Entity Country/Region</div>
                <div class="detail-value">
                  <div class="country-cell">
                    <img :src="getCountryFlag(selectedRecord.entityCountry)" class="country-flag" :alt="selectedRecord.entityCountry" />
                    <span>{{ selectedRecord.entityCountry }}</span>
                  </div>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Account Type</div>
                <div class="detail-value">{{ selectedRecord.accountType }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Account</div>
                <div class="detail-value">{{ selectedRecord.account }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Transaction Limit</div>
                <div class="detail-value">{{ editableRecord.transactionLimit }}</div>
              </div>
            </a-col>
          </template>
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
                <a-tag color="green">
                  <a-icon type="check-circle" />
                  {{ selectedRecord.status }}
                </a-tag>
              </div>
            </div>
          </a-col>
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">Rate</div>
              <div class="detail-value">
                <div class="rate-input-container">
                  <a-input
                    v-model="editableRecord.rate"
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
        </a-row>

        <!-- Edit抽屉底部按钮 -->
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
  name: 'WithdrawalManagement',
  data () {
    return {
      // 视图模式
      viewMode: 'digital',

      // 过滤条件
      filters: {
        clientId: '',
        clientName: '',
        channel: '',
        currency: '',
        status: '',
        entityCountry: '',
        accountType: ''
      },

      // 抽屉状态
      reviewDrawerVisible: false,
      editDrawerVisible: false,
      selectedRecord: null,
      editableRecord: {
        rate: '0.5',
        status: 'Actived',
        transactionLimit: '1,300,000'
      },

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

      // 数字货币数据
      digitalCurrencyData: [
        {
          key: 'digital-1',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'TRC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          rate: '0.5%',
          transactionLimit: '1,300,000',
          status: 'Pending'
        },
        {
          key: 'digital-2',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'TRC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          rate: '0.5%',
          transactionLimit: '1,300,000',
          status: 'Pending'
        },
        {
          key: 'digital-3',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'TRC20',
          currency: 'USDC',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          rate: '0.5%',
          transactionLimit: '1,300,000',
          status: 'Pending'
        },
        {
          key: 'digital-4',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'TRC20',
          currency: 'USDC',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          rate: '0.5%',
          transactionLimit: '1,300,000',
          status: 'Actived'
        },
        {
          key: 'digital-5',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          channel: 'ERC20',
          currency: 'USDT',
          address: 'TPRgvk...JoCSck',
          operateTime: '2025/02/10 12:20:32',
          rate: '0.5%',
          transactionLimit: '1,300,000',
          status: 'Actived'
        }
      ],

      // 法币数据
      fiatCurrencyData: [
        {
          key: 'fiat-1',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          entityCountry: 'HongKong',
          currency: 'HKD',
          accountType: 'virtual account',
          account: '012807100000001012',
          operateTime: '2025/02/10 12:20:32',
          rate: '0.5%',
          transactionLimit: '1,300,000',
          status: 'Pending'
        },
        {
          key: 'fiat-2',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          entityCountry: 'Colombia',
          currency: 'COP',
          accountType: 'virtual account',
          account: '012807100000001012',
          operateTime: '2025/02/10 12:20:32',
          rate: '0.5%',
          transactionLimit: '1,300,000',
          status: 'Pending'
        },
        {
          key: 'fiat-3',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          entityCountry: 'Brazil',
          currency: 'BRL',
          accountType: 'virtual account',
          account: '012807100000001012',
          operateTime: '2025/02/10 12:20:32',
          rate: '0.5%',
          transactionLimit: '1,300,000',
          status: 'Pending'
        },
        {
          key: 'fiat-4',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          entityCountry: 'Mexico',
          currency: 'MXN',
          accountType: 'virtual account',
          account: '012807100000001012',
          operateTime: '2025/02/10 12:20:32',
          rate: '0.5%',
          transactionLimit: '1,300,000',
          status: 'Actived'
        },
        {
          key: 'fiat-5',
          clientId: 'CLI-001',
          accountId: 'ACC-2001',
          clientName: 'Solutions Inc',
          entityCountry: 'HongKong',
          currency: 'HKD',
          accountType: 'institution account',
          account: '012807100000001012',
          operateTime: '2025/02/10 12:20:32',
          rate: '0.5%',
          transactionLimit: '1,300,000',
          status: 'Actived'
        }
      ]
    }
  },

  computed: {
    // 当前数据源
    currentTableData () {
      return this.viewMode === 'digital' ? this.digitalCurrencyData : this.fiatCurrencyData
    },

    // 当前表格列配置
    currentColumns () {
      if (this.viewMode === 'digital') {
        return [
          {
            title: 'Account ID',
            dataIndex: 'accountId',
            key: 'accountId',
            width: 120,
            fixed: 'left'
          },
          {
            title: 'Client ID',
            dataIndex: 'clientId',
            key: 'clientId',
            width: 100
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
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            scopedSlots: { customRender: 'status' }
          },
          {
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
            width: 80
          },
          {
            title: 'Transaction Limit',
            dataIndex: 'transactionLimit',
            key: 'transactionLimit',
            width: 120
          },
          {
            title: 'Action',
            key: 'action',
            width: 150,
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
            title: 'Entity Country/Region',
            dataIndex: 'entityCountry',
            key: 'entityCountry',
            width: 160,
            scopedSlots: { customRender: 'entityCountry' }
          },
          {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            width: 80
          },
          {
            title: 'Account Type',
            dataIndex: 'accountType',
            key: 'accountType',
            width: 140
          },
          {
            title: 'Account',
            dataIndex: 'account',
            key: 'account',
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
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
            width: 80
          },
          {
            title: 'Transaction Limit',
            dataIndex: 'transactionLimit',
            key: 'transactionLimit',
            width: 120
          },
          {
            title: 'Action',
            key: 'action',
            width: 150,
            fixed: 'right',
            scopedSlots: { customRender: 'action' }
          }
        ]
      }
    },

    // 过滤后的数据
    filteredData () {
      let data = [...this.currentTableData]

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

      if (this.viewMode === 'digital') {
        if (this.filters.channel) {
          data = data.filter(item => item.channel === this.filters.channel)
        }
        if (this.filters.currency) {
          data = data.filter(item => item.currency === this.filters.currency)
        }
      } else {
        if (this.filters.entityCountry) {
          data = data.filter(item => item.entityCountry === this.filters.entityCountry)
        }
        if (this.filters.accountType) {
          data = data.filter(item => item.accountType === this.filters.accountType)
        }
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
        status: '',
        entityCountry: '',
        accountType: ''
      }
      this.$message.info('Filters reset')
    },

    // 切换视图模式
    switchViewMode (mode) {
      this.viewMode = mode
      // 关闭抽屉并清空选中记录
      this.reviewDrawerVisible = false
      this.editDrawerVisible = false
      this.selectedRecord = null
      // 重置过滤条件
      this.filters = {
        clientId: '',
        clientName: '',
        channel: '',
        currency: '',
        status: '',
        entityCountry: '',
        accountType: ''
      }
      this.$message.info(`Switched to ${mode} currency view`)
    },

    // 复制地址
    copyAddress (address) {
      if (!address) return
      const textarea = document.createElement('textarea')
      textarea.value = address
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      this.$message.success('Address copied to clipboard')
    },

    // Review按钮点击
    handleReview (record) {
      this.selectedRecord = { ...record }
      this.reviewDrawerVisible = true
    },

    // Edit按钮点击
    handleEdit (record) {
      this.selectedRecord = { ...record }
      this.editableRecord = {
        rate: record.rate ? record.rate.replace('%', '') : '0.5',
        status: record.status,
        transactionLimit: record.transactionLimit
      }
      this.editDrawerVisible = true
    },

    // 关闭Review抽屉
    closeReviewDrawer () {
      this.reviewDrawerVisible = false
      this.selectedRecord = null
    },

    // 关闭Edit抽屉
    closeEditDrawer () {
      this.editDrawerVisible = false
      this.selectedRecord = null
    },

    // 切换状态
    toggleStatus () {
      this.editableRecord.status = this.editableRecord.status === 'Actived' ? 'Disable' : 'Actived'
    },

    // 拒绝操作
    handleReject () {
      if (this.selectedRecord) {
        // 更新对应数据源的状态
        const dataSource = this.viewMode === 'digital' ? this.digitalCurrencyData : this.fiatCurrencyData
        const index = dataSource.findIndex(item => item.key === this.selectedRecord.key)
        if (index > -1) {
          dataSource[index].status = 'Disable'
          this.selectedRecord.status = 'Disable'
        }
        this.$message.success('Request rejected')
        this.closeReviewDrawer()
      }
    },

    // 同意操作
    handleAgree () {
      if (this.selectedRecord) {
        // 更新对应数据源的状态
        const dataSource = this.viewMode === 'digital' ? this.digitalCurrencyData : this.fiatCurrencyData
        const index = dataSource.findIndex(item => item.key === this.selectedRecord.key)
        if (index > -1) {
          dataSource[index].status = 'Actived'
          this.selectedRecord.status = 'Actived'
        }
        this.$message.success('Request approved')
        this.closeReviewDrawer()
      }
    },

    // 取消编辑操作
    handleCancel () {
      this.closeEditDrawer()
    },

    // 确认编辑操作
    handleConfirm () {
      if (this.selectedRecord) {
        // 更新对应数据源的数据
        const dataSource = this.viewMode === 'digital' ? this.digitalCurrencyData : this.fiatCurrencyData
        const index = dataSource.findIndex(item => item.key === this.selectedRecord.key)
        if (index > -1) {
          dataSource[index].rate = this.editableRecord.rate + '%'
          dataSource[index].status = this.editableRecord.status
          dataSource[index].transactionLimit = this.editableRecord.transactionLimit
        }
        this.$message.success('Changes saved successfully')
        this.closeEditDrawer()
      }
    },

    // 获取状态颜色
    getStatusColor (status) {
      const colors = {
        'Pending': 'orange',
        'Actived': 'green',
        'Disable': 'red'
      }
      return colors[status] || 'default'
    },

    // 获取状态图标
    getStatusIcon (status) {
      const icons = {
        'Pending': 'clock-circle',
        'Actived': 'check-circle',
        'Disable': 'close-circle'
      }
      return icons[status] || 'exclamation-circle'
    },

    // 获取国家旗帜
    getCountryFlag (country) {
      const flags = {
        'HongKong': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAxOCI+PGNpcmNsZSBjeD0iMTIiIGN5PSI5IiByPSI4IiBmaWxsPSIjRkY2QjY5Ii8+PC9zdmc+',
        'Brazil': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAxOCI+PGNpcmNsZSBjeD0iMTIiIGN5PSI5IiByPSI4IiBmaWxsPSIjNDJCOTgzIi8+PC9zdmc+',
        'Colombia': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAxOCI+PGNpcmNsZSBjeD0iMTIiIGN5PSI5IiByPSI4IiBmaWxsPSIjRkZEQTQ0Ii8+PC9zdmc+',
        'Mexico': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAxOCI+PGNpcmNsZSBjeD0iMTIiIGN5PSI5IiByPSI4IiBmaWxsPSIjRkY2QjY5Ii8+PC9zdmc+'
      }
      return flags[country] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAxOCI+PGNpcmNsZSBjeD0iMTIiIGN5PSI5IiByPSI4IiBmaWxsPSIjQ0NDIi8+PC9zdmc+'
    }
  }
}
</script>

<style lang="less" scoped>
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
    .country-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .country-flag {
        width: 16px;
        height: 12px;
        border-radius: 2px;
      }
    }

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

    .action-buttons {
      display: flex;
      align-items: center;
    }

    .review-action {
      color: #1890ff;
      font-weight: 500;

      &:hover {
        color: #40a9ff;
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
        color: #1890ff;
        margin-left: auto;

        &:hover {
          color: #40a9ff;
        }
      }
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
