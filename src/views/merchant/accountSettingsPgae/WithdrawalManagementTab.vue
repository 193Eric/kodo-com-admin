<template>
  <div class="withdrawal-management">
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
        <a-col :span="4" v-if="viewMode === 'fiat'">
          <a-select
            v-model="filters.accountType"
            placeholder="Account Type"
            size="default"
            style="width: 100%"
            allowClear

          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="virtual account">virtual account</a-select-option>
            <a-select-option value="institution account">institution account</a-select-option>
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
        :scroll="{ x: 1600 }"
        :loading="loading"
        rowKey="key"
        size="middle"
        @change="handleTableChange"
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

        <!-- Rate列自定义渲染 -->
        <template slot="rate" slot-scope="text, record">
          {{ (parseFloat(record.rate_fee || 0) * 100) + '%' }}
        </template>

        <!-- 状态列自定义渲染 - 不可点击 -->
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
          <div class="action-buttons">
            <a-button
              type="link"
              size="small"
              @click="handleReview(record)"
              :class="{ 'review-action': record.statusText === 'Pending' }"
              style="margin-right: 8px"
            >
              {{ record.statusText === 'Pending' ? 'Review' : 'View' }}
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
                <div class="detail-label">Crypto Currency ID</div>
                <div class="detail-value">{{ selectedRecord.crypto_currency_id || '-' }}</div>
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
              <div class="detail-label">Currency</div>
              <div class="detail-value">
                <a-tag color="green">
                  <a-icon type="dollar" />
                  {{ viewMode === 'digital' ? selectedRecord.crypto_currency?.name : selectedRecord.currency }}
                </a-tag>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Rate</div>
              <div class="detail-value">{{ (parseFloat(selectedRecord.rate_fee || 0) * 100) + '%' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Min Amount</div>
              <div class="detail-value">{{ selectedRecord.min_amount || '0.00000000' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Max Amount</div>
              <div class="detail-value">{{ selectedRecord.max_amount || '0.00000000' }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="detail-item">
              <div class="detail-label">Updated Time</div>
              <div class="detail-value">{{ formatTime(selectedRecord.updated_at) }}</div>
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
        </a-row>

        <!-- Review抽屉底部按钮 - 只有Pending状态才显示 -->
        <div v-if="selectedRecord.statusText === 'Pending'" class="drawer-footer">
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
      <div v-if="detailLoading" style="text-align: center; padding: 60px 0;">
        <a-spin size="large" />
        <div style="margin-top: 16px; color: #666;">
          Loading details...
        </div>
      </div>

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
                <div class="detail-label">Crypto Currency ID</div>
                <div class="detail-value">{{ selectedRecord.crypto_currency_id || '-' }}</div>
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
          </template>

          <!-- Fiat Currency 特有字段 (保持原样，因为没有对应的API) -->
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
              <div class="detail-label">Currency</div>
              <div class="detail-value">
                <a-tag color="green">
                  <a-icon type="dollar" />
                  {{ viewMode === 'digital' ? selectedRecord.crypto_currency?.name : selectedRecord.currency }}
                </a-tag>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
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
          <a-col :span="12">
            <div class="detail-item">
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
              <div class="detail-label">Updated Time</div>
              <div class="detail-value">{{ formatTime(selectedRecord.updated_at) }}</div>
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
  name: 'WithdrawalManagement',
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
        entityCountry: '',
        accountType: ''
      },

      // 抽屉状态
      reviewDrawerVisible: false,
      editDrawerVisible: false,
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
      dataList: [],

      // 法币数据 (保持静态数据，因为没有对应的API)
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
          status: 'Pending',
          statusText: 'Pending'
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
          status: 'Pending',
          statusText: 'Pending'
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
          status: 'Pending',
          statusText: 'Pending'
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
          status: 'Actived',
          statusText: 'Actived'
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
          status: 'Actived',
          statusText: 'Actived'
        }
      ]
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
            width: 120,
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

    // 当前数据源 (数字货币用API数据，法币用静态数据)
    currentTableData () {
      return this.viewMode === 'digital' ? this.dataList : this.fiatCurrencyData
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

    // API调用方法 (只对数字货币生效)
    async fetchData () {
      if (this.viewMode === 'fiat') {
        // 法币模式不调用API，直接返回
        return
      }

      this.loading = true
      try {
        const params = this.buildRequestParams()
        const response = await request({
          url: '/admin/merchant/expend/v2/digital/list',
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
        ...item,
        key: item.id,
        clientId: item.merchant?.merchant_no || '-',
        clientName: item.merchant?.merchant_name || '-',
        chainName: item.crypto_currency?.chain_name || '-',
        currency: item.crypto_currency?.name || '-',
        feeType: item.fee_type_text || '-',
        statusText: this.mapApiStatusToText(item.status),
        updatedTime: this.formatTime(item.updated_at)
      }))
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

    // 表格分页变更
    handleTableChange (pagination) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.fetchData()
    },

    // 重置
    handleReset () {
      this.filters = {
        merchant_no: '',
        merchant_name: '',
        currency_name: '',
        status: '',
        entityCountry: '',
        accountType: ''
      }
      this.pagination.current = 1
      this.fetchData()
      this.$message.info('Filters reset')
    },

    // 切换视图模式
    switchViewMode (mode) {
      this.viewMode = mode
      // 关闭抽屉并清空选中记录
      this.reviewDrawerVisible = false
      this.editDrawerVisible = false
      this.selectedRecord = null
      this.detailLoading = false
      // 重置过滤条件
      this.filters = {
        merchant_no: '',
        merchant_name: '',
        currency_name: '',
        status: '',
        entityCountry: '',
        accountType: ''
      }
      this.pagination.current = 1
      this.fetchData()
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
    async handleEdit (record) {
      this.selectedRecord = null
      this.editDrawerVisible = true
      this.detailLoading = true

      try {
        if (this.viewMode === 'digital') {
          // 数字货币模式直接使用record数据，无需调用详情接口
          setTimeout(() => {
            this.selectedRecord = { ...record }
            // API返回rate_fee是小数(0.01)，转换为百分比数值(1)供编辑使用
            this.editableRecord = {
              rate_fee: parseFloat(record.rate_fee || 0) * 100, // 0.01 -> 1
              status: record.status,
              min_amount: record.min_amount || '0',
              max_amount: record.max_amount || '0'
            }
            this.detailLoading = false
            console.log('编辑数据准备完成:', this.selectedRecord)
          }, 300) // 模拟加载时间
        } else {
          // 法币模式直接使用传入的record
          setTimeout(() => {
            this.selectedRecord = { ...record }
            this.editableRecord = {
              rate_fee: record.rate ? parseFloat(record.rate.replace('%', '')) : 0.5,
              status: record.status === 'Actived' ? 1 : -1,
              min_amount: '0',
              max_amount: record.transactionLimit || '0'
            }
            this.detailLoading = false
          }, 300)
        }
      } catch (error) {
        console.error('准备编辑数据失败:', error)
        this.$message.error('Failed to load edit data')
        this.detailLoading = false
      }
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
      this.detailLoading = false
    },

    // 切换状态
    toggleStatus () {
      this.editableRecord.status = this.editableRecord.status === 1 ? -1 : 1
    },

    // 拒绝操作
    handleReject () {
      if (this.selectedRecord) {
        // 更新对应数据源的状态
        if (this.viewMode === 'digital') {
          const index = this.dataList.findIndex(item => item.key === this.selectedRecord.id)
          if (index > -1) {
            this.dataList[index].statusText = 'Disable'
            this.selectedRecord.statusText = 'Disable'
          }
        } else {
          const index = this.fiatCurrencyData.findIndex(item => item.key === this.selectedRecord.key)
          if (index > -1) {
            this.fiatCurrencyData[index].status = 'Disable'
            this.fiatCurrencyData[index].statusText = 'Disable'
            this.selectedRecord.statusText = 'Disable'
          }
        }
        this.$message.success('Request rejected')
        this.closeReviewDrawer()
      }
    },

    // 同意操作
    handleAgree () {
      if (this.selectedRecord) {
        // 更新对应数据源的状态
        if (this.viewMode === 'digital') {
          const index = this.dataList.findIndex(item => item.key === this.selectedRecord.id)
          if (index > -1) {
            this.dataList[index].statusText = 'Actived'
            this.selectedRecord.statusText = 'Actived'
          }
        } else {
          const index = this.fiatCurrencyData.findIndex(item => item.key === this.selectedRecord.key)
          if (index > -1) {
            this.fiatCurrencyData[index].status = 'Actived'
            this.fiatCurrencyData[index].statusText = 'Actived'
            this.selectedRecord.statusText = 'Actived'
          }
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
    async handleConfirm () {
      if (!this.selectedRecord) return

      // 验证输入
      if (this.editableRecord.rate_fee === '' || isNaN(parseFloat(this.editableRecord.rate_fee))) {
        this.$message.error('Please enter a valid rate')
        return
      }

      if (this.editableRecord.min_amount === '' || isNaN(parseFloat(this.editableRecord.min_amount))) {
        this.$message.error('Please enter a valid min amount')
        return
      }

      if (this.editableRecord.max_amount === '' || isNaN(parseFloat(this.editableRecord.max_amount))) {
        this.$message.error('Please enter a valid max amount')
        return
      }

      const rateValue = parseFloat(this.editableRecord.rate_fee)
      const minAmount = parseFloat(this.editableRecord.min_amount)
      const maxAmount = parseFloat(this.editableRecord.max_amount)

      // 验证费率范围
      if (rateValue < 0 || rateValue > 100) {
        this.$message.error('Rate must be between 0 and 100')
        return
      }

      // 验证金额范围
      if (minAmount < 0) {
        this.$message.error('Min amount cannot be negative')
        return
      }

      if (maxAmount < 0) {
        this.$message.error('Max amount cannot be negative')
        return
      }

      if (maxAmount > 0 && minAmount > maxAmount) {
        this.$message.error('Min amount cannot be greater than max amount')
        return
      }

      this.updateLoading = true
      try {
        if (this.viewMode === 'digital') {
          // 数字货币更新API
          const updateData = {
            id: this.selectedRecord.id,
            min_amount: this.editableRecord.min_amount.toString(),
            max_amount: this.editableRecord.max_amount.toString(),
            rate: (rateValue).toString(), // 将百分比转换为小数字符串: 0.5 -> "0.005"
            status: this.editableRecord.status.toString()
          }

          console.log('提交更新数据:', updateData)

          const response = await request({
            url: '/admin/merchant/expend/v2/digital/update',
            method: 'POST',
            data: updateData
          })

          if (response.code === 200) {
            this.$message.success('Changes saved successfully')
            this.closeEditDrawer()
            // 重新获取列表数据
            await this.fetchData()
          } else {
            this.$message.error(response.message || 'Update failed')
          }
        } else {
          // 法币模式直接更新本地数据
          const index = this.fiatCurrencyData.findIndex(item => item.key === this.selectedRecord.key)
          if (index > -1) {
            this.fiatCurrencyData[index].rate = this.editableRecord.rate_fee + '%'
            this.fiatCurrencyData[index].status = this.editableRecord.status === 1 ? 'Actived' : 'Disable'
            this.fiatCurrencyData[index].statusText = this.editableRecord.status === 1 ? 'Actived' : 'Disable'
            this.fiatCurrencyData[index].transactionLimit = this.editableRecord.max_amount
          }
          this.$message.success('Changes saved successfully')
          this.closeEditDrawer()
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
