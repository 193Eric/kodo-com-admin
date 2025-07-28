<template>
  <div class="withdrawal-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>Withdrawal</h1>
      <div class="header-actions">
        <a-button type="link" @click="handleWithdrawalHistory">
          <a-icon type="history" />
          Withdrawal History
        </a-button>
      </div>
    </div>

    <!-- Tab切换 -->
    <a-tabs v-model="activeTab" class="withdrawal-tabs">
      <a-tab-pane key="withdrawalCrypto" tab="Withdrawal Crypto">
        <WithdrawalCrypto />
      </a-tab-pane>

      <a-tab-pane key="withdrawalFiat" tab="Withdrawal Fiat">
        <WithdrawalFiat />
      </a-tab-pane>

      <a-tab-pane key="cryptoAddress" tab="Crypto Address">
        <!-- 加密货币地址管理页面 -->
        <div class="tab-content">
          <!-- 搜索区域 -->
          <div class="search-section">
            <div class="search-filters">
              <a-input
                v-model="cryptoFilters.search"
                placeholder="Search recipient..."
                style="width: 200px; margin-right: 16px"
                allow-clear
              >
                <a-icon slot="prefix" type="search" />
              </a-input>

              <a-select
                v-model="cryptoFilters.currency"
                placeholder="Currency"
                style="width: 120px; margin-right: 16px"
                allow-clear
              >
                <a-select-option value="USDT">USDT</a-select-option>
                <a-select-option value="BTC">BTC</a-select-option>
                <a-select-option value="ETH">ETH</a-select-option>
              </a-select>

              <a-button @click="handleCryptoReset">
                Reset
              </a-button>
            </div>

            <div class="action-buttons">
              <a-button type="primary" @click="handleNewCryptoAddress">
                <a-icon type="plus" />
                New Address
              </a-button>
            </div>
          </div>

          <!-- 加密货币地址表格 -->
          <a-table
            :columns="cryptoColumns"
            :data-source="filteredCryptoData"
            :row-key="record => record.id"
            :pagination="cryptoPagination"
            @change="handleCryptoTableChange"
          >
            <template slot="network" slot-scope="text, record">
              <a-space>
                <a-tag v-for="network in record.networks" :key="network">
                  {{ network }}
                </a-tag>
              </a-space>
            </template>

            <template slot="address" slot-scope="text">
              <span class="address-text">{{ text }}</span>
              <a-icon type="copy" class="copy-icon" @click="handleCopyAddress(text)" />
            </template>

            <template slot="operation" slot-scope="text, record">
              <a-space>
                <a-button type="link" size="small" @click="handleCryptoView(record)">
                  <a-icon type="eye" />
                </a-button>
                <a-button type="link" size="small" @click="handleCryptoEdit(record)">
                  <a-icon type="edit" />
                </a-button>
                <a-button type="link" size="small" @click="handleCryptoDelete(record)">
                  <a-icon type="delete" />
                </a-button>
              </a-space>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <a-tab-pane key="fiatAddress" tab="Fiat Address">
        <!-- 法币地址管理页面 -->
        <div class="tab-content">
          <!-- 搜索区域 -->
          <div class="search-section">
            <div class="search-filters">
              <a-input
                v-model="fiatFilters.search"
                placeholder="Search recipient..."
                style="width: 200px; margin-right: 16px"
                allow-clear
              >
                <a-icon slot="prefix" type="search" />
              </a-input>

              <a-select
                v-model="fiatFilters.currency"
                placeholder="Currency"
                style="width: 120px; margin-right: 16px"
                allow-clear
              >
                <a-select-option value="USD">USD</a-select-option>
                <a-select-option value="EUR">EUR</a-select-option>
                <a-select-option value="GBP">GBP</a-select-option>
              </a-select>

              <a-button @click="handleFiatReset">
                Reset
              </a-button>
            </div>

            <div class="action-buttons">
              <a-button type="primary" @click="handleNewFiatAddress">
                <a-icon type="plus" />
                New Address
              </a-button>
            </div>
          </div>

          <!-- 法币地址表格 -->
          <a-table
            :columns="fiatColumns"
            :data-source="filteredFiatData"
            :row-key="record => record.id"
            :pagination="fiatPagination"
            @change="handleFiatTableChange"
          >
            <template slot="receivingAccount" slot-scope="text">
              <span class="masked-account">{{ text }}</span>
            </template>

            <template slot="country" slot-scope="text, record">
              <a-space>
                <img :src="record.flag" :alt="text" style="width: 16px; height: 12px;" />
                <span>{{ text }}</span>
              </a-space>
            </template>

            <template slot="operation" slot-scope="text, record">
              <a-space>
                <a-button type="link" size="small" @click="handleFiatView(record)">
                  <a-icon type="eye" />
                </a-button>
                <a-button type="link" size="small" @click="handleFiatEdit(record)">
                  <a-icon type="edit" />
                </a-button>
                <a-button type="link" size="small" @click="handleFiatDelete(record)">
                  <a-icon type="delete" />
                </a-button>
              </a-space>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 加密货币地址模态框 -->
    <!-- 新增/编辑加密货币地址 -->
    <a-modal
      :title="cryptoModalType === 'add' ? 'Add New Crypto Address' : 'Edit Crypto Address'"
      :visible="cryptoModalVisible"
      :confirm-loading="cryptoModalLoading"
      @ok="handleCryptoModalOk"
      @cancel="handleCryptoModalCancel"
      width="600px"
    >
      <a-form :form="cryptoForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="Recipient Name">
          <a-input
            v-decorator="[
              'recipientName',
              { rules: [{ required: true, message: 'Please input recipient name!' }] }
            ]"
            placeholder="Enter recipient name"
          />
        </a-form-item>

        <a-form-item label="Currency">
          <a-select
            v-decorator="[
              'currency',
              { rules: [{ required: true, message: 'Please select currency!' }] }
            ]"
            placeholder="Select currency"
            mode="multiple"
          >
            <a-select-option value="BTC">BTC</a-select-option>
            <a-select-option value="ETH">ETH</a-select-option>
            <a-select-option value="USDT">USDT</a-select-option>
            <a-select-option value="USDC">USDC</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Network">
          <a-select
            v-decorator="[
              'networks',
              { rules: [{ required: true, message: 'Please select network!' }] }
            ]"
            placeholder="Select network"
            mode="multiple"
          >
            <a-select-option value="ERC-20">ERC-20</a-select-option>
            <a-select-option value="TRC-20">TRC-20</a-select-option>
            <a-select-option value="BEP-20">BEP-20</a-select-option>
            <a-select-option value="Bitcoin">Bitcoin</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Address">
          <a-input
            v-decorator="[
              'address',
              { rules: [{ required: true, message: 'Please input address!' }] }
            ]"
            placeholder="Enter crypto address"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看加密货币地址详情 -->
    <a-modal
      title="Crypto Address Details"
      :visible="cryptoViewModalVisible"
      :footer="null"
      @cancel="cryptoViewModalVisible = false"
      width="600px"
    >
      <div v-if="currentCryptoRecord" class="detail-content">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="Recipient Name">
            {{ currentCryptoRecord.recipientName }}
          </a-descriptions-item>
          <a-descriptions-item label="Currency">
            {{ currentCryptoRecord.currency }}
          </a-descriptions-item>
          <a-descriptions-item label="Networks">
            <a-space>
              <a-tag v-for="network in currentCryptoRecord.networks" :key="network">
                {{ network }}
              </a-tag>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="Address">
            <div class="address-detail">
              <span class="address-text">{{ currentCryptoRecord.address }}</span>
              <a-icon type="copy" class="copy-icon" @click="handleCopyAddress(currentCryptoRecord.address)" />
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="Created Time">
            {{ currentCryptoRecord.createdTime || '2024-01-01 10:00:00' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>

    <!-- 法币地址模态框 -->
    <!-- 新增/编辑法币地址 -->
    <a-modal
      :title="fiatModalType === 'add' ? 'Add New Fiat Address' : 'Edit Fiat Address'"
      :visible="fiatModalVisible"
      :confirm-loading="fiatModalLoading"
      @ok="handleFiatModalOk"
      @cancel="handleFiatModalCancel"
      width="600px"
    >
      <a-form :form="fiatForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="Recipient Name">
          <a-input
            v-decorator="[
              'recipientName',
              { rules: [{ required: true, message: 'Please input recipient name!' }] }
            ]"
            placeholder="Enter recipient name"
          />
        </a-form-item>

        <a-form-item label="Account Type">
          <a-select
            v-decorator="[
              'accountType',
              { rules: [{ required: true, message: 'Please select account type!' }] }
            ]"
            placeholder="Select account type"
          >
            <a-select-option value="Personal">Personal</a-select-option>
            <a-select-option value="Company">Company</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Receiving Account">
          <a-input
            v-decorator="[
              'receivingAccount',
              { rules: [{ required: true, message: 'Please input receiving account!' }] }
            ]"
            placeholder="Enter account number"
          />
        </a-form-item>

        <a-form-item label="Country/Region">
          <a-select
            v-decorator="[
              'country',
              { rules: [{ required: true, message: 'Please select country!' }] }
            ]"
            placeholder="Select country"
          >
            <a-select-option value="America">America</a-select-option>
            <a-select-option value="Canada">Canada</a-select-option>
            <a-select-option value="United Kingdom">United Kingdom</a-select-option>
            <a-select-option value="Germany">Germany</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Currency">
          <a-select
            v-decorator="[
              'currency',
              { rules: [{ required: true, message: 'Please select currency!' }] }
            ]"
            placeholder="Select currency"
          >
            <a-select-option value="USD">USD</a-select-option>
            <a-select-option value="EUR">EUR</a-select-option>
            <a-select-option value="GBP">GBP</a-select-option>
            <a-select-option value="CAD">CAD</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看法币地址详情 -->
    <a-modal
      title="Fiat Address Details"
      :visible="fiatViewModalVisible"
      :footer="null"
      @cancel="fiatViewModalVisible = false"
      width="600px"
    >
      <div v-if="currentFiatRecord" class="detail-content">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="Recipient Name">
            {{ currentFiatRecord.recipientName }}
          </a-descriptions-item>
          <a-descriptions-item label="Account Type">
            {{ currentFiatRecord.accountType }}
          </a-descriptions-item>
          <a-descriptions-item label="Receiving Account">
            {{ currentFiatRecord.receivingAccount }}
          </a-descriptions-item>
          <a-descriptions-item label="Country/Region">
            <a-space>
              <img :src="currentFiatRecord.flag" :alt="currentFiatRecord.country" style="width: 16px; height: 12px;" />
              <span>{{ currentFiatRecord.country }}</span>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="Currency">
            {{ currentFiatRecord.currency }}
          </a-descriptions-item>
          <a-descriptions-item label="Created Time">
            {{ currentFiatRecord.createdTime || '2024-01-01 10:00:00' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script>
// 引入子组件
import WithdrawalCrypto from './WithdrawalCrypto.vue'
import WithdrawalFiat from './WithdrawalFiat.vue'

export default {
  name: 'WithdrawalPage',
  components: {
    WithdrawalCrypto,
    WithdrawalFiat
  },
  data () {
    return {
      activeTab: 'withdrawalCrypto',

      // 加密货币地址相关
      cryptoFilters: {
        search: '',
        currency: undefined
      },
      cryptoAddressData: [
        {
          id: 1,
          recipientName: 'Digital Solutions Inc',
          address: 'CF7PUKUBUqPA02LVRYYDS4ECgr7oDEJ3P9',
          networks: ['ERC-20', 'TRC-20'],
          currency: 'BTC, USDT'
        },
        {
          id: 2,
          recipientName: 'CryptoVendor Ltd',
          address: 'TQNPUKUBUqPA02LVRYYDS4ECgr7oDEJ92H',
          networks: ['TRC-20'],
          currency: 'USDC, USDT'
        }
      ],
      cryptoPagination: {
        current: 1,
        pageSize: 10,
        total: 2
      },
      cryptoColumns: [
        {
          title: 'Recipient Name',
          dataIndex: 'recipientName',
          width: 200
        },
        {
          title: 'Address',
          dataIndex: 'address',
          scopedSlots: { customRender: 'address' },
          width: 300
        },
        {
          title: 'Network',
          dataIndex: 'networks',
          scopedSlots: { customRender: 'network' },
          width: 150
        },
        {
          title: 'Currency',
          dataIndex: 'currency',
          width: 120
        },
        {
          title: 'Operation',
          scopedSlots: { customRender: 'operation' },
          width: 120,
          fixed: 'right'
        }
      ],

      // 加密货币模态框相关
      cryptoModalVisible: false,
      cryptoModalLoading: false,
      cryptoModalType: 'add', // 'add' | 'edit'
      cryptoForm: this.$form.createForm(this),
      currentCryptoRecord: null,
      cryptoViewModalVisible: false,

      // 法币地址相关
      fiatFilters: {
        search: '',
        currency: undefined
      },
      fiatAddressData: [
        {
          id: 1,
          recipientName: 'Global Trade Partners',
          accountType: 'Company',
          receivingAccount: '**** **** **** 2261',
          country: 'America',
          flag: 'https://flagcdn.com/w20/us.png',
          currency: 'USD'
        },
        {
          id: 2,
          recipientName: 'CryptoVendor Ltd',
          accountType: 'Personal',
          receivingAccount: '**** **** **** 2762',
          country: 'America',
          flag: 'https://flagcdn.com/w20/us.png',
          currency: 'USD'
        }
      ],
      fiatPagination: {
        current: 1,
        pageSize: 10,
        total: 2
      },
      fiatColumns: [
        {
          title: 'Recipient Name',
          dataIndex: 'recipientName',
          width: 160
        },
        {
          title: 'Account Type',
          dataIndex: 'accountType',
          width: 120
        },
        {
          title: 'Receiving Account',
          dataIndex: 'receivingAccount',
          scopedSlots: { customRender: 'receivingAccount' },
          width: 180
        },
        {
          title: 'Country/Region',
          dataIndex: 'country',
          scopedSlots: { customRender: 'country' },
          width: 150
        },
        {
          title: 'Currency',
          dataIndex: 'currency',
          width: 100
        },
        {
          title: 'Operation',
          scopedSlots: { customRender: 'operation' },
          width: 120,
          fixed: 'right'
        }
      ],

      // 法币模态框相关
      fiatModalVisible: false,
      fiatModalLoading: false,
      fiatModalType: 'add', // 'add' | 'edit'
      fiatForm: this.$form.createForm(this),
      currentFiatRecord: null,
      fiatViewModalVisible: false
    }
  },

  computed: {
    // 过滤后的加密货币数据
    filteredCryptoData () {
      let data = [...this.cryptoAddressData]

      if (this.cryptoFilters.search) {
        data = data.filter(item =>
          item.recipientName.toLowerCase().includes(this.cryptoFilters.search.toLowerCase()) ||
          item.address.toLowerCase().includes(this.cryptoFilters.search.toLowerCase())
        )
      }

      if (this.cryptoFilters.currency) {
        data = data.filter(item =>
          item.currency.toLowerCase().includes(this.cryptoFilters.currency.toLowerCase())
        )
      }

      this.cryptoPagination.total = data.length
      return data
    },

    // 过滤后的法币数据
    filteredFiatData () {
      let data = [...this.fiatAddressData]

      if (this.fiatFilters.search) {
        data = data.filter(item =>
          item.recipientName.toLowerCase().includes(this.fiatFilters.search.toLowerCase()) ||
          item.receivingAccount.toLowerCase().includes(this.fiatFilters.search.toLowerCase())
        )
      }

      if (this.fiatFilters.currency) {
        data = data.filter(item =>
          item.currency === this.fiatFilters.currency
        )
      }

      this.fiatPagination.total = data.length
      return data
    }
  },

  methods: {
    // 提现历史
    handleWithdrawalHistory () {
      this.$message.info('跳转到提现历史页面')
    },

    // ===== 加密货币地址管理 =====
    handleCryptoReset () {
      this.cryptoFilters = {
        search: '',
        currency: undefined
      }
    },

    // 新增加密货币地址
    handleNewCryptoAddress () {
      this.cryptoModalType = 'add'
      this.cryptoModalVisible = true
      this.currentCryptoRecord = null
      this.$nextTick(() => {
        this.cryptoForm.resetFields()
      })
    },

    // 查看加密货币地址
    handleCryptoView (record) {
      this.currentCryptoRecord = record
      this.cryptoViewModalVisible = true
    },

    // 编辑加密货币地址
    handleCryptoEdit (record) {
      this.cryptoModalType = 'edit'
      this.cryptoModalVisible = true
      this.currentCryptoRecord = record

      this.$nextTick(() => {
        this.cryptoForm.setFieldsValue({
          recipientName: record.recipientName,
          address: record.address,
          networks: record.networks,
          currency: record.currency.split(', ')
        })
      })
    },

    // 删除加密货币地址
    handleCryptoDelete (record) {
      this.$confirm({
        title: 'Confirm Delete',
        content: `Are you sure you want to delete the address for "${record.recipientName}"?`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => {
          const index = this.cryptoAddressData.findIndex(item => item.id === record.id)
          if (index > -1) {
            this.cryptoAddressData.splice(index, 1)
            this.$message.success('Address deleted successfully')
          }
        }
      })
    },

    // 加密货币模态框确认
    handleCryptoModalOk () {
      this.cryptoForm.validateFields((err, values) => {
        if (!err) {
          this.cryptoModalLoading = true

          // 模拟API调用
          setTimeout(() => {
            if (this.cryptoModalType === 'add') {
              // 新增
              const newRecord = {
                id: Date.now(),
                recipientName: values.recipientName,
                address: values.address,
                networks: values.networks,
                currency: values.currency.join(', ')
              }
              this.cryptoAddressData.push(newRecord)
              this.$message.success('Crypto address added successfully')
            } else {
              // 编辑
              const index = this.cryptoAddressData.findIndex(item => item.id === this.currentCryptoRecord.id)
              if (index > -1) {
                this.cryptoAddressData[index] = {
                  ...this.cryptoAddressData[index],
                  recipientName: values.recipientName,
                  address: values.address,
                  networks: values.networks,
                  currency: values.currency.join(', ')
                }
                this.$message.success('Crypto address updated successfully')
              }
            }

            this.cryptoModalLoading = false
            this.cryptoModalVisible = false
            this.cryptoForm.resetFields()
          }, 1000)
        }
      })
    },

    // 加密货币模态框取消
    handleCryptoModalCancel () {
      this.cryptoModalVisible = false
      this.cryptoForm.resetFields()
    },

    handleCryptoTableChange (pagination) {
      this.cryptoPagination.current = pagination.current
      this.cryptoPagination.pageSize = pagination.pageSize
    },

    // ===== 法币地址管理 =====
    handleFiatReset () {
      this.fiatFilters = {
        search: '',
        currency: undefined
      }
    },

    // 新增法币地址
    handleNewFiatAddress () {
      this.fiatModalType = 'add'
      this.fiatModalVisible = true
      this.currentFiatRecord = null
      this.$nextTick(() => {
        this.fiatForm.resetFields()
      })
    },

    // 查看法币地址
    handleFiatView (record) {
      this.currentFiatRecord = record
      this.fiatViewModalVisible = true
    },

    // 编辑法币地址
    handleFiatEdit (record) {
      this.fiatModalType = 'edit'
      this.fiatModalVisible = true
      this.currentFiatRecord = record

      this.$nextTick(() => {
        this.fiatForm.setFieldsValue({
          recipientName: record.recipientName,
          accountType: record.accountType,
          receivingAccount: record.receivingAccount,
          country: record.country,
          currency: record.currency
        })
      })
    },

    // 删除法币地址
    handleFiatDelete (record) {
      this.$confirm({
        title: 'Confirm Delete',
        content: `Are you sure you want to delete the address for "${record.recipientName}"?`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => {
          const index = this.fiatAddressData.findIndex(item => item.id === record.id)
          if (index > -1) {
            this.fiatAddressData.splice(index, 1)
            this.$message.success('Address deleted successfully')
          }
        }
      })
    },

    // 法币模态框确认
    handleFiatModalOk () {
      this.fiatForm.validateFields((err, values) => {
        if (!err) {
          this.fiatModalLoading = true

          // 获取国家对应的国旗
          const countryFlags = {
            'America': 'https://flagcdn.com/w20/us.png',
            'Canada': 'https://flagcdn.com/w20/ca.png',
            'United Kingdom': 'https://flagcdn.com/w20/gb.png',
            'Germany': 'https://flagcdn.com/w20/de.png'
          }

          // 模拟API调用
          setTimeout(() => {
            if (this.fiatModalType === 'add') {
              // 新增
              const newRecord = {
                id: Date.now(),
                recipientName: values.recipientName,
                accountType: values.accountType,
                receivingAccount: values.receivingAccount,
                country: values.country,
                flag: countryFlags[values.country] || 'https://flagcdn.com/w20/us.png',
                currency: values.currency
              }
              this.fiatAddressData.push(newRecord)
              this.$message.success('Fiat address added successfully')
            } else {
              // 编辑
              const index = this.fiatAddressData.findIndex(item => item.id === this.currentFiatRecord.id)
              if (index > -1) {
                this.fiatAddressData[index] = {
                  ...this.fiatAddressData[index],
                  recipientName: values.recipientName,
                  accountType: values.accountType,
                  receivingAccount: values.receivingAccount,
                  country: values.country,
                  flag: countryFlags[values.country] || 'https://flagcdn.com/w20/us.png',
                  currency: values.currency
                }
                this.$message.success('Fiat address updated successfully')
              }
            }

            this.fiatModalLoading = false
            this.fiatModalVisible = false
            this.fiatForm.resetFields()
          }, 1000)
        }
      })
    },

    // 法币模态框取消
    handleFiatModalCancel () {
      this.fiatModalVisible = false
      this.fiatForm.resetFields()
    },

    handleFiatTableChange (pagination) {
      this.fiatPagination.current = pagination.current
      this.fiatPagination.pageSize = pagination.pageSize
    },

    // 复制地址
    handleCopyAddress (address) {
      navigator.clipboard.writeText(address).then(() => {
        this.$message.success('地址已复制到剪贴板')
      }).catch(() => {
        this.$message.error('复制失败')
      })
    }
  }
}
</script>

<style scoped>
.withdrawal-page {
  padding: 24px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #262626;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
}

.withdrawal-tabs {
  background: #fff;
  border-radius: 8px;
}

.withdrawal-tabs .ant-tabs-bar {
  margin: 0;
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
}

.withdrawal-tabs .ant-tabs-tab {
  margin: 0 32px 0 0;
  padding: 16px 0;
  font-size: 14px;
  color: #8c8c8c;
}

.withdrawal-tabs .ant-tabs-tab-active {
  color: #11253E;
  font-weight: 600;
}

.tab-content {
  padding: 24px;
}

.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.search-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 表格样式 */
.ant-table {
  background: #fff;
  border-radius: 6px;
}

.ant-table-thead > tr > th {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
  font-weight: 600;
}

.ant-table-tbody > tr > td {
  border-bottom: 1px solid #f0f0f0;
}

.ant-table-tbody > tr:hover > td {
  background: #f5f5f5;
}

/* 地址样式 */
.address-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #595959;
}

.copy-icon {
  margin-left: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #11253E;
}

.copy-icon:hover {
  color: #40a9ff;
}

/* 脱敏账号样式 */
.masked-account {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #595959;
}

/* 操作按钮样式 */
.ant-btn-link {
  padding: 4px 8px;
  height: auto;
  border: none;
  box-shadow: none;
}

.ant-btn-link:hover {
  background: #f0f0f0;
  border-radius: 4px;
}

/* 标签样式 */
.ant-tag {
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
}

/* 详情内容样式 */
.detail-content {
  padding: 16px 0;
}

.address-detail {
  display: flex;
  align-items: center;
}

.address-detail .address-text {
  flex: 1;
  word-break: break-all;
}

/* 模态框样式优化 */
.ant-modal-body {
  padding: 24px;
}

.ant-form-item {
  margin-bottom: 16px;
}

.ant-descriptions-item-label {
  font-weight: 600;
  background: #fafafa;
}
</style>
