<template>
  <div class="admission-approval-page">
    <div class="page-header">
      <h1 class="page-title">Admission Approval</h1>
    </div>

    <!-- 标签页 -->
    <a-tabs v-model="activeTab" @change="onTabChange">
      <a-tab-pane key="pending" tab="Pending Approval" />
      <a-tab-pane key="approved" tab="Approved" />
    </a-tabs>

    <!-- 搜索过滤区域 -->
    <div class="filter-section">
      <a-row :gutter="16">
        <a-col :span="4">
          <a-input
            v-model="filters.merchant_no"
            placeholder="Merchant No"
            size="default"
            allow-clear
          />
        </a-col>
        <a-col :span="4">
          <a-input
            v-model="filters.merchant_name"
            placeholder="Merchant Name"
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
            allow-clear
          >
            <a-select-option value="">All</a-select-option>
            <a-select-option value="HK">Hong Kong</a-select-option>
            <a-select-option value="SG">Singapore</a-select-option>
            <a-select-option value="US">USA</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-range-picker
            v-model="filters.dateRange"
            placeholder="['Start Time', 'End Time']"
            size="default"
            style="width: 100%"
            format="YYYY-MM-DD"
            allow-clear
          />
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="handleSearch" :loading="loading">
            Search
          </a-button>
        </a-col>
        <a-col :span="4">
          <a-button @click="handleReset">
            Reset
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-table
        :columns="currentColumns"
        :dataSource="dataList"
        :pagination="pagination"
        :scroll="{ x: 1500 }"
        :loading="loading"
        rowKey="id"
        size="middle"
        @change="handleTableChange"
      >
        <!-- 自定义渲染列 -->
        <template slot="entityCountry" slot-scope="text, record">
          <span class="country-cell">
            {{ getCountryName(text) }}
          </span>
        </template>

        <template slot="status" slot-scope="text">
          <a-tag :color="getStatusColor(text)">
            {{ text }}
          </a-tag>
        </template>

        <template slot="action" slot-scope="text, record">
          <a-button
            v-if="activeTab === 'pending'"
            type="link"
            size="small"
            @click="handleProcess(record)"
          >
            Process
          </a-button>
          <a-button
            v-else
            type="link"
            size="small"
            @click="handleView(record)"
          >
            View
          </a-button>
        </template>
      </a-table>
    </div>

    <!-- 右侧抽屉详情 -->
    <a-drawer
      :title="drawerTitle"
      :width="600"
      :visible="drawerVisible"
      @close="closeDrawer"
      :bodyStyle="{ padding: '24px' }"
    >
      <!-- 加载状态 -->
      <div v-if="detailLoading" class="detail-loading">
        <a-spin size="large" />
        <div style="margin-top: 16px; text-align: center; color: #666;">
          Loading details...
        </div>
      </div>

      <!-- 详情内容 -->
      <div v-else-if="selectedRecord">
        <!-- Application Details -->
        <div class="detail-section">
          <h3 class="section-title">Application Details</h3>
          <a-row :gutter="[16, 16]">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Client ID</div>
                <div class="detail-value">{{ selectedRecord.id }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Client Name</div>
                <div class="detail-value">{{ selectedRecord.company_name }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Submit Time</div>
                <div class="detail-value">{{ formatTime(selectedRecord.created_at) }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Entity Country/Region</div>
                <div class="detail-value">
                  {{ getCountryName(selectedRecord.country_code) }}
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Account ID</div>
                <div class="detail-value">{{ selectedRecord.merchant_id }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Channel ID</div>
                <div class="detail-value">''</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Channel Name</div>
                <div class="detail-value">''</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Operator ID</div>
                <div class="detail-value">{{ selectedRecord.reviewed_by ? selectedRecord.reviewed_by.id : '-' }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Operator Name</div>
                <div class="detail-value">{{ selectedRecord.reviewed_by ? selectedRecord.reviewed_by.name : '-' }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Operate Time</div>
                <div class="detail-value">{{ formatTime(selectedRecord.reviewed_at) }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                  <a-tag :color="getStatusColor(selectedRecord.status_text)">
                    {{ selectedRecord.status_text }}
                  </a-tag>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>

        <!-- Basic Information -->
        <div class="detail-section">
          <h3 class="section-title">Basic Information</h3>
          <a-row :gutter="[16, 16]">
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Company Name</div>
                <div class="detail-value">{{ selectedRecord.company_name }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Business Email</div>
                <div class="detail-value">{{ selectedRecord.merchant ? selectedRecord.merchant.email : '' }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Business Phone Number</div>
                <div class="detail-value">{{ selectedRecord.legal_person_phone || '-' }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Entity Type</div>
                <div class="detail-value">{{ selectedRecord.company_type_text }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Registration Number</div>
                <div class="detail-value">{{ selectedRecord.registration_number }}</div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="detail-item">
                <div class="detail-label">Brief Introduction of Core Business</div>
                <div class="detail-value">{{ selectedRecord.business_scope }}</div>
              </div>
            </a-col>
          </a-row>
        </div>

        <!-- Documents -->
        <div class="detail-section">
          <h3 class="section-title">Documents</h3>
          <div class="documents-list">
            <div v-for="doc in getAllDocuments()" :key="doc.name" class="document-item">
              <!-- 文件类型标识 -->
              <div class="doc-type-badge">
                {{ doc.type.toUpperCase() }}
              </div>

              <!-- 文件信息 -->
              <div class="doc-info">
                <div class="doc-name">{{ doc.name }}</div>
                <div class="doc-size">{{ doc.size }}</div>
              </div>

              <!-- 操作按钮 -->
              <div class="doc-actions">
                <a-button
                  type="link"
                  size="small"
                  @click="downloadDoc(doc)"
                  class="action-btn"
                >
                  <a-icon type="download" />
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  @click="viewDoc(doc)"
                  class="action-btn"
                >
                  <a-icon type="eye" />
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 审批操作区域 - 仅待审核状态显示 -->
        <div v-if="activeTab === 'pending' && selectedRecord.status === 0" class="approval-section">
          <h3 class="section-title">Approval Actions</h3>
          <div class="approval-actions">
            <a-button
              type="primary"
              @click="handleApprove(selectedRecord)"
              :loading="approveLoading"
              style="margin-right: 12px;"
            >
              Approve
            </a-button>
            <a-button
              type="danger"
              @click="handleReject(selectedRecord)"
              :loading="rejectLoading"
            >
              Reject
            </a-button>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { request } from '@/api/_service'
import _ from 'lodash'

export default {
  name: 'AdmissionApproval',
  data () {
    return {
      activeTab: 'pending',
      drawerVisible: false,
      selectedRecord: null,
      loading: false,
      detailLoading: false, // 详情加载状态
      approveLoading: false,
      rejectLoading: false,
      rejectReason: '', // 拒绝原因
      filters: {
        merchant_no: '',
        merchant_name: '',
        country_code: '',
        dateRange: []
      },
      pagination: {
        current: 1,
        pageSize: 15,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        pageSizeOptions: ['10', '15', '20', '50']
      },
      // 数据列表
      dataList: []
    }
  },

  computed: {
    drawerTitle () {
      return this.activeTab === 'pending' ? 'Process Application' : 'Details'
    },

    currentColumns () {
      const baseColumns = [
        {
          title: 'Merchant No',
          dataIndex: ['merchant', 'merchant_no'],
          key: 'merchant_no',
          width: 180
        },
        {
          title: 'Merchant Name',
          dataIndex: ['merchant', 'merchant_name'],
          key: 'merchant_name',
          width: 150
        },
        {
          title: 'Company Name',
          dataIndex: 'company_name',
          key: 'company_name',
          width: 150
        },
        {
          title: 'Submit Time',
          dataIndex: 'created_at',
          key: 'created_at',
          width: 160,
          customRender: (text) => this.formatTime(text)
        },
        {
          title: 'Entity Country/Region',
          dataIndex: 'country_code',
          key: 'country_code',
          width: 160,
          scopedSlots: { customRender: 'entityCountry' }
        },
        {
          title: 'Company Type',
          dataIndex: 'company_type_text',
          key: 'company_type_text',
          width: 140
        }
      ]

      if (this.activeTab === 'pending') {
        return [
          ...baseColumns,
          {
            title: 'Status',
            dataIndex: 'status_text',
            key: 'status_text',
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
          ...baseColumns,
          {
            title: 'Reviewed Time',
            dataIndex: 'reviewed_at',
            key: 'reviewed_at',
            width: 160,
            customRender: (text) => this.formatTime(text)
          },
          {
            title: 'Reviewed By',
            dataIndex: ['reviewed_by', 'name'],
            key: 'reviewed_by',
            width: 120
          },
          {
            title: 'Status',
            dataIndex: 'status_text',
            key: 'status_text',
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
      this.pagination.current = 1 // 搜索时重置到第一页
      this.fetchData()
    }, 300),

    // API调用方法
    async fetchData () {
      this.loading = true
      try {
        const params = this.buildRequestParams()

        const response = await request({
          url: '/admin/merchant/kyb/v2/list',
          method: 'GET',
          params
        })

        if (response.code === 200) {
          this.dataList = response.data.list || []
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
        per_page: this.pagination.pageSize
      }

      // 根据标签页设置状态筛选
      if (this.activeTab === 'pending') {
        params.status = 0 // 待审核
      } else if (this.activeTab === 'approved') {
        params.status = 1 // 已通过
      }

      // 添加搜索条件
      if (this.filters.merchant_no?.trim()) {
        params.merchant_no = this.filters.merchant_no.trim()
      }

      if (this.filters.merchant_name?.trim()) {
        params.merchant_name = this.filters.merchant_name.trim()
      }

      // 日期范围处理
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        params.start_time = this.filters.dateRange[0].format('YYYY-MM-DD')
        params.end_time = this.filters.dateRange[1].format('YYYY-MM-DD')
      }

      return params
    },

    // 标签页切换
    onTabChange (key) {
      this.activeTab = key
      this.drawerVisible = false
      this.pagination.current = 1 // 切换标签页时重置到第一页
      this.fetchData()
    },

    // 重置搜索
    handleReset () {
      this.filters = {
        merchant_no: '',
        merchant_name: '',
        country_code: '',
        dateRange: []
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

    // 处理待审批记录
    async handleProcess (record) {
      this.selectedRecord = null
      this.drawerVisible = true
      this.detailLoading = true
      await this.loadKybDetail(record.id)
      this.detailLoading = false
    },

    // 查看详情
    async handleView (record) {
      this.selectedRecord = null
      this.drawerVisible = true
      this.detailLoading = true
      await this.loadKybDetail(record.id)
      this.detailLoading = false
    },

    // 加载KYB详情
    async loadKybDetail (kybId) {
      try {
        this.selectedRecord = null // 清空之前的数据

        const response = await request({
          url: `/admin/merchant/kyb/v2/${kybId}`,
          method: 'GET'
        })

        if (response.code === 200 && response.data?.kyb) {
          this.selectedRecord = response.data.kyb
          console.log('KYB详情加载成功:', this.selectedRecord)
        } else {
          this.$message.error(response.message || '获取详情失败')
        }
      } catch (error) {
        console.error('获取KYB详情失败:', error)
        this.$message.error('网络错误，请稍后重试')
      }
    },

    // 关闭抽屉
    closeDrawer () {
      this.drawerVisible = false
      this.selectedRecord = null
      this.detailLoading = false
    },

    // 审批通过
    async handleApprove (record) {
      this.approveLoading = true
      try {
        const response = await request({
          url: `/admin/merchant/kyb/v2/${record.id}/approve`,
          method: 'POST',
          data: {
            merchant_id: record.merchant_id
          }
        })

        if (response.code === 200) {
          this.$message.success('Application approved successfully')
          this.closeDrawer()
          this.fetchData() // 刷新列表
        } else {
          this.$message.error(response.message || 'Approval failed')
        }
      } catch (error) {
        console.error('审批失败:', error)
        this.$message.error('Network error, please try again')
      } finally {
        this.approveLoading = false
      }
    },

    // 审批拒绝
    async handleReject (record) {
      // 弹出输入框获取拒绝原因
      this.$confirm({
        title: 'Reject Application',
        content: (h) => {
          return h('div', [
            h('p', { style: { marginBottom: '12px' } }, 'Please enter the reason for rejection:'),
            h('a-textarea', {
              props: {
                rows: 4,
                placeholder: 'Enter rejection reason...',
                maxLength: 500
              },
              on: {
                input: (e) => {
                  this.rejectReason = e.target.value
                }
              }
            })
          ])
        },
        okText: 'Confirm Reject',
        okType: 'danger',
        cancelText: 'Cancel',
        width: 500,
        onOk: async () => {
          if (!this.rejectReason || !this.rejectReason.trim()) {
            this.$message.error('Please enter rejection reason')
            return Promise.reject()
          }

          this.rejectLoading = true
          try {
            const response = await request({
              url: `/admin/merchant/kyb/v2/${record.id}/reject`,
              method: 'POST',
              data: {
                merchant_id: record.merchant_id,
                reject_reason: this.rejectReason.trim()
              }
            })

            if (response.code === 200) {
              this.$message.success('Application rejected successfully')
              this.closeDrawer()
              this.fetchData() // 刷新列表
              this.rejectReason = '' // 清空拒绝原因
            } else {
              this.$message.error(response.message || 'Operation failed')
              return Promise.reject()
            }
          } catch (error) {
            console.error('拒绝操作失败:', error)
            this.$message.error('Network error, please try again')
            return Promise.reject()
          } finally {
            this.rejectLoading = false
          }
        },
        onCancel: () => {
          this.rejectReason = '' // 清空拒绝原因
        }
      })
    },

    // 获取国家名称
    getCountryName (countryCode) {
      const countryMap = {
        'HK': 'Hong Kong',
        'SG': 'Singapore',
        'US': 'USA',
        'CN': 'China'
      }
      return countryMap[countryCode] || countryCode || '-'
    },

    // 获取状态颜色
    getStatusColor (status) {
      const colors = {
        'Pending': 'orange',
        'Approved': 'green',
        'Rejected': 'red'
      }
      return colors[status] || 'default'
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

    // 解析文件URL（处理JSON字符串格式）
    getFileUrls (urlString) {
      if (!urlString) return []

      try {
        // 如果是JSON字符串，解析它
        if (typeof urlString === 'string' && urlString.startsWith('[')) {
          return JSON.parse(urlString).filter(url => url && url.trim())
        }

        // 如果是普通字符串，直接返回
        if (typeof urlString === 'string' && urlString.trim()) {
          return [urlString.trim()]
        }

        // 如果已经是数组，直接返回
        if (Array.isArray(urlString)) {
          return urlString.filter(url => url && url.trim())
        }

        return []
      } catch (error) {
        console.error('解析文件URL失败:', error, urlString)
        return []
      }
    },

    // 根据文件URL判断文件类型
    getFileType (url) {
      if (!url) return 'file'

      const lowerUrl = url.toLowerCase()

      if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') ||
          lowerUrl.includes('.png') || lowerUrl.includes('.gif') ||
          lowerUrl.includes('.bmp') || lowerUrl.includes('.webp')) {
        return 'image'
      }

      if (lowerUrl.includes('.pdf')) {
        return 'pdf'
      }

      if (lowerUrl.includes('.zip') || lowerUrl.includes('.rar')) {
        return 'zip'
      }

      return 'file'
    },

    // 获取所有文档（保持原有格式）
    getAllDocuments () {
      if (!this.selectedRecord) return []

      const documents = []

      // CR证书
      const crUrls = this.getFileUrls(this.selectedRecord.cr_certificate_url)
      crUrls.forEach((url, index) => {
        const fileType = this.getFileType(url)
        documents.push({
          name: `Company Registration Certificate CI ${index + 1}`,
          type: fileType,
          size: fileType === 'image' ? '.image | 1.2MB' : '.pdf | 1.2MB',
          url: url
        })
      })

      // BR证书
      const brUrls = this.getFileUrls(this.selectedRecord.br_certificate_url)
      brUrls.forEach((url, index) => {
        const fileType = this.getFileType(url)
        documents.push({
          name: `Business Registration Certificate BR ${index + 1}`,
          type: fileType,
          size: fileType === 'image' ? '.image | 1.5MB' : '.pdf | 1.5MB',
          url: url
        })
      })

      // 公司章程
      const constitutionUrls = this.getFileUrls(this.selectedRecord.company_constitution_url)
      constitutionUrls.forEach((url, index) => {
        const fileType = this.getFileType(url)
        documents.push({
          name: `Articles of Association ${index + 1}`,
          type: fileType,
          size: fileType === 'image' ? '.image | 1.5MB' : '.pdf | 1.5MB',
          url: url
        })
      })

      // 年度申报
      const annualUrls = this.getFileUrls(this.selectedRecord.annual_return_url)
      annualUrls.forEach((url, index) => {
        const fileType = this.getFileType(url)
        documents.push({
          name: `NNC1 / NAR1 ${index + 1}`,
          type: fileType,
          size: fileType === 'image' ? '.image | 1.2MB' : '.pdf | 1.2MB',
          url: url
        })
      })

      // 股权结构证明
      const equityUrls = this.getFileUrls(this.selectedRecord.proof_of_equity_structure)
      equityUrls.forEach((url, index) => {
        const fileType = this.getFileType(url)
        documents.push({
          name: `Structure of Members ${index + 1}`,
          type: fileType,
          size: fileType === 'zip' ? '.zip | 1.3MB' : (fileType === 'image' ? '.image | 1.3MB' : '.pdf | 1.3MB'),
          url: url
        })
      })

      // ID文档
      const idUrls = this.getFileUrls(this.selectedRecord.id_no)
      idUrls.forEach((url, index) => {
        const fileType = this.getFileType(url)
        documents.push({
          name: `Director's Docs ${index + 1}`,
          type: fileType,
          size: fileType === 'zip' ? '.zip | 1.5MB' : (fileType === 'image' ? '.image | 1.5MB' : '.pdf | 1.5MB'),
          url: url
        })
      })

      // 其他文件
      const otherUrls = this.getFileUrls(this.selectedRecord.other_files)
      otherUrls.forEach((url, index) => {
        const fileType = this.getFileType(url)
        documents.push({
          name: `Member's Docs (Ownership exceeds 25%) ${index + 1}`,
          type: fileType,
          size: fileType === 'image' ? '.image | 1.2MB' : '.pdf | 1.2MB',
          url: url
        })
      })

      return documents
    },

    // 下载文档
    downloadDoc (doc) {
      console.log('Download document:', doc.name)
      if (!doc.url) return

      const link = document.createElement('a')
      link.href = doc.url
      link.download = doc.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      this.$message.success(`Downloading ${doc.name}`)
    },

    // 查看文档
    viewDoc (doc) {
      console.log('View document:', doc.name)
      if (!doc.url) return

      if (doc.type === 'image') {
        // 图片预览
        this.previewImage(doc)
      } else {
        // 其他文件在新窗口打开
        window.open(doc.url, '_blank')
      }
    },

    // 图片预览
    previewImage (doc) {
      const imageUrl = doc.url || 'https://via.placeholder.com/800x600?text=' + encodeURIComponent(doc.name)

      this.$confirm({
        title: doc.name,
        width: 800,
        icon: () => null,
        content: (h) => {
          return h('div', {
            style: {
              textAlign: 'center',
              padding: '20px'
            }
          }, [
            h('img', {
              attrs: {
                src: imageUrl,
                alt: doc.name
              },
              style: {
                maxWidth: '100%',
                maxHeight: '500px',
                objectFit: 'contain',
                border: '1px solid #f0f0f0',
                borderRadius: '4px'
              }
            })
          ])
        },
        okText: 'Close',
        showCancelButton: false, // 隐藏取消按钮（下载按钮）
        onOk: () => {
          console.log('Preview closed')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.admission-approval-page {
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

  /deep/ .ant-tabs {
    margin-bottom: 24px;

    .ant-tabs-tab {
      font-size: 16px;
      font-weight: 500;
    }

    .ant-tabs-tab-active {
      border-bottom: 2px solid #1890ff;
    }
  }

  .filter-section {
    background: #fafafa;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 24px;

    .ant-btn {
      width: 100%;
    }
  }

  .table-section {
    .country-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .detail-section {
    margin-bottom: 32px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
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
  }

  .approval-section {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 16px;
    }

    .approval-actions {
      display: flex;
      gap: 12px;
    }
  }

  .detail-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    min-height: 200px;
  }

.documents-list {
  .document-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .doc-type-badge {
      width: 70px;
      height: 50px;
      background: #f5f5f5;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
      color: #666;
      margin-right: 12px;
      flex-shrink: 0;
      text-align: center;
      line-height: 1.2;
    }

    .doc-info {
      flex: 1;
      margin-right: 12px;

      .doc-name {
        font-size: 14px;
        color: #262626;
        margin-bottom: 4px;
        font-weight: 400;
        line-height: 1.4;
      }

      .doc-size {
        font-size: 12px;
        color: #8c8c8c;
      }
    }

    .doc-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      .action-btn {
        width: 24px !important;
        height: 24px !important;
        border: 1px solid #d9d9d9 !important;
        border-radius: 4px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: #666 !important;
        padding: 0 !important;
        min-width: 24px !important;

        &:hover {
          border-color: #1890ff !important;
          color: #1890ff !important;
        }

        .anticon {
          font-size: 12px !important;
          margin: 0 !important;
        }
      }
    }
  }
}

/deep/ .ant-table {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f0f0f0;
  }
}

/deep/ .ant-drawer-header {
  border-bottom: 1px solid #f0f0f0;
}
</style>
