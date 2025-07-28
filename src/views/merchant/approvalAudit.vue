<template>
  <div class="approval-review-page">
    <div class="page-content">
      <!-- 左侧内容区域 -->
      <div class="left-section">
        <!-- 公司标题 -->
        <div class="company-header">
          <h2>Solutions Inc</h2>
          <div class="status-indicators">
            <span class="status-dot client-id"></span>
            <span class="status-text">CLI-001</span>
            <span class="status-dot pending"></span>
            <span class="status-text">Pending</span>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="section">
          <h3 class="section-title">Basic Information</h3>

          <!-- Company Name -->
          <div class="field-item">
            <div class="field-content">
              <div class="field-label">Company Name</div>
              <div class="field-value">Solutions Inc</div>
            </div>

            <!-- 拒绝原因预览 (确认后显示) -->
            <div v-if="fields.companyName.status === 'rejected' && fields.companyName.confirmed" class="rejection-preview">
              <div class="rejection-preview-content">
                <div class="rejection-title">
                  <span class="rejection-label">Rejection Reason:</span>
                  <div class="preview-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="editRejection('companyName')"
                      class="edit-preview-btn"
                    >
                      <a-icon type="edit" />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="clearRejection('companyName')"
                      class="close-preview-btn"
                    >
                      <a-icon type="close" />
                    </a-button>
                  </div>
                </div>
                <div class="rejection-reason-text">{{ getReasonText('companyName', fields.companyName.selectedReason) }}</div>
                <div v-if="fields.companyName.comments" class="rejection-comments-text">{{ fields.companyName.comments }}</div>
              </div>
            </div>

            <div class="field-actions">
              <div class="action-buttons">
                <a-button
                  :type="fields.companyName.status === 'approved' ? 'primary' : 'default'"
                  @click="handleApprove('companyName')"
                  size="default"
                  class="approve-btn"
                >
                  Approve
                </a-button>
                <a-button
                  :type="fields.companyName.status === 'rejected' ? 'danger' : 'default'"
                  @click="handleReject('companyName')"
                  size="default"
                  class="reject-btn"
                >
                  Reject
                </a-button>
              </div>
              <div class="status-icon">
                <a-icon
                  v-if="fields.companyName.status === 'approved'"
                  type="check-circle"
                  class="success-icon"
                />
                <a-icon
                  v-if="fields.companyName.status === 'rejected'"
                  type="close-circle"
                  class="error-icon"
                />
              </div>
            </div>

            <!-- 拒绝原因编辑区域 -->
            <div v-if="fields.companyName.status === 'rejected' && !fields.companyName.confirmed" class="rejection-section">
              <div class="rejection-content">
                <div class="rejection-field">
                  <div class="field-label">Rejection Reason</div>
                  <a-select
                    v-model="fields.companyName.selectedReason"
                    placeholder="Select a reason"
                    style="width: 100%;"
                    size="large"
                  >
                    <a-select-option value="invalid_company_name">Invalid company name format</a-select-option>
                    <a-select-option value="name_mismatch">Name doesn't match registration</a-select-option>
                    <a-select-option value="reserved_name">Company name is reserved</a-select-option>
                    <a-select-option value="inconsistent_situation">Inconsistent with the actual situation</a-select-option>
                    <a-select-option value="other">Other</a-select-option>
                  </a-select>
                </div>

                <div class="comments-field">
                  <div class="field-label">Comments</div>
                  <div class="textarea-wrapper">
                    <a-textarea
                      v-model="fields.companyName.comments"
                      placeholder="Specify modifications required, 200 chars max"
                      :rows="4"
                      :maxLength="200"
                      class="comments-textarea"
                    />
                    <div class="char-count">{{ fields.companyName.comments ? fields.companyName.comments.length : 0 }}/200 character</div>
                  </div>
                </div>

                <div class="rejection-actions">
                  <a-button @click="cancelFieldRejection('companyName')" class="cancel-btn">
                    Cancel
                  </a-button>
                  <a-button
                    type="primary"
                    @click="confirmFieldRejection('companyName')"
                    :disabled="!fields.companyName.selectedReason"
                    class="confirm-btn"
                  >
                    Confirm Rejection
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Business Email -->
          <div class="field-item">
            <div class="field-content">
              <div class="field-label">Business Email</div>
              <div class="field-value">solutionsinc@example.com</div>
            </div>

            <div v-if="fields.businessEmail.status === 'rejected' && fields.businessEmail.confirmed" class="rejection-preview">
              <div class="rejection-preview-content">
                <div class="rejection-title">
                  <span class="rejection-label">Rejection Reason:</span>
                  <div class="preview-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="editRejection('businessEmail')"
                      class="edit-preview-btn"
                    >
                      <a-icon type="edit" />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="clearRejection('businessEmail')"
                      class="close-preview-btn"
                    >
                      <a-icon type="close" />
                    </a-button>
                  </div>
                </div>
                <div class="rejection-reason-text">{{ getReasonText('businessEmail', fields.businessEmail.selectedReason) }}</div>
                <div v-if="fields.businessEmail.comments" class="rejection-comments-text">{{ fields.businessEmail.comments }}</div>
              </div>
            </div>

            <div class="field-actions">
              <div class="action-buttons">
                <a-button
                  :type="fields.businessEmail.status === 'approved' ? 'primary' : 'default'"
                  @click="handleApprove('businessEmail')"
                  size="default"
                  class="approve-btn"
                >
                  Approve
                </a-button>
                <a-button
                  :type="fields.businessEmail.status === 'rejected' ? 'danger' : 'default'"
                  @click="handleReject('businessEmail')"
                  size="default"
                  class="reject-btn"
                >
                  Reject
                </a-button>
              </div>
              <div class="status-icon">
                <a-icon
                  v-if="fields.businessEmail.status === 'approved'"
                  type="check-circle"
                  class="success-icon"
                />
                <a-icon
                  v-if="fields.businessEmail.status === 'rejected'"
                  type="close-circle"
                  class="error-icon"
                />
              </div>
            </div>

            <div v-if="fields.businessEmail.status === 'rejected' && !fields.businessEmail.confirmed" class="rejection-section">
              <div class="rejection-content">
                <div class="rejection-field">
                  <div class="field-label">Rejection Reason</div>
                  <a-select
                    v-model="fields.businessEmail.selectedReason"
                    placeholder="Select a reason"
                    style="width: 100%;"
                    size="large"
                  >
                    <a-select-option value="invalid_email_format">Invalid email format</a-select-option>
                    <a-select-option value="domain_not_verified">Domain not verified</a-select-option>
                    <a-select-option value="personal_email">Personal email not allowed</a-select-option>
                    <a-select-option value="other">Other</a-select-option>
                  </a-select>
                </div>

                <div class="comments-field">
                  <div class="field-label">Comments</div>
                  <div class="textarea-wrapper">
                    <a-textarea
                      v-model="fields.businessEmail.comments"
                      placeholder="Specify modifications required, 200 chars max"
                      :rows="4"
                      :maxLength="200"
                      class="comments-textarea"
                    />
                    <div class="char-count">{{ fields.businessEmail.comments ? fields.businessEmail.comments.length : 0 }}/200 character</div>
                  </div>
                </div>

                <div class="rejection-actions">
                  <a-button @click="cancelFieldRejection('businessEmail')" class="cancel-btn">
                    Cancel
                  </a-button>
                  <a-button
                    type="primary"
                    @click="confirmFieldRejection('businessEmail')"
                    :disabled="!fields.businessEmail.selectedReason"
                    class="confirm-btn"
                  >
                    Confirm Rejection
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Business Phone Number -->
          <div class="field-item">
            <div class="field-content">
              <div class="field-label">Business Phone Number</div>
              <div class="field-value">18827171727</div>
            </div>

            <div v-if="fields.businessPhone.status === 'rejected' && fields.businessPhone.confirmed" class="rejection-preview">
              <div class="rejection-preview-content">
                <div class="rejection-title">
                  <span class="rejection-label">Rejection Reason:</span>
                  <div class="preview-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="editRejection('businessPhone')"
                      class="edit-preview-btn"
                    >
                      <a-icon type="edit" />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="clearRejection('businessPhone')"
                      class="close-preview-btn"
                    >
                      <a-icon type="close" />
                    </a-button>
                  </div>
                </div>
                <div class="rejection-reason-text">{{ getReasonText('businessPhone', fields.businessPhone.selectedReason) }}</div>
                <div v-if="fields.businessPhone.comments" class="rejection-comments-text">{{ fields.businessPhone.comments }}</div>
              </div>
            </div>

            <div class="field-actions">
              <div class="action-buttons">
                <a-button
                  :type="fields.businessPhone.status === 'approved' ? 'primary' : 'default'"
                  @click="handleApprove('businessPhone')"
                  size="default"
                  class="approve-btn"
                >
                  Approve
                </a-button>
                <a-button
                  :type="fields.businessPhone.status === 'rejected' ? 'danger' : 'default'"
                  @click="handleReject('businessPhone')"
                  size="default"
                  class="reject-btn"
                >
                  Reject
                </a-button>
              </div>
              <div class="status-icon">
                <a-icon
                  v-if="fields.businessPhone.status === 'approved'"
                  type="check-circle"
                  class="success-icon"
                />
                <a-icon
                  v-if="fields.businessPhone.status === 'rejected'"
                  type="close-circle"
                  class="error-icon"
                />
              </div>
            </div>

            <div v-if="fields.businessPhone.status === 'rejected' && !fields.businessPhone.confirmed" class="rejection-section">
              <div class="rejection-content">
                <div class="rejection-field">
                  <div class="field-label">Rejection Reason</div>
                  <a-select
                    v-model="fields.businessPhone.selectedReason"
                    placeholder="Select a reason"
                    style="width: 100%;"
                    size="large"
                  >
                    <a-select-option value="invalid_phone_format">Invalid phone number format</a-select-option>
                    <a-select-option value="number_not_verified">Phone number not verified</a-select-option>
                    <a-select-option value="region_not_supported">Region not supported</a-select-option>
                    <a-select-option value="other">Other</a-select-option>
                  </a-select>
                </div>

                <div class="comments-field">
                  <div class="field-label">Comments</div>
                  <div class="textarea-wrapper">
                    <a-textarea
                      v-model="fields.businessPhone.comments"
                      placeholder="Specify modifications required, 200 chars max"
                      :rows="4"
                      :maxLength="200"
                      class="comments-textarea"
                    />
                    <div class="char-count">{{ fields.businessPhone.comments ? fields.businessPhone.comments.length : 0 }}/200 character</div>
                  </div>
                </div>

                <div class="rejection-actions">
                  <a-button @click="cancelFieldRejection('businessPhone')" class="cancel-btn">
                    Cancel
                  </a-button>
                  <a-button
                    type="primary"
                    @click="confirmFieldRejection('businessPhone')"
                    :disabled="!fields.businessPhone.selectedReason"
                    class="confirm-btn"
                  >
                    Confirm Rejection
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Entity Type -->
          <div class="field-item">
            <div class="field-content">
              <div class="field-label">Entity Type</div>
              <div class="field-value">Limited Liability Company</div>
            </div>

            <div v-if="fields.entityType.status === 'rejected' && fields.entityType.confirmed" class="rejection-preview">
              <div class="rejection-preview-content">
                <div class="rejection-title">
                  <span class="rejection-label">Rejection Reason:</span>
                  <div class="preview-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="editRejection('entityType')"
                      class="edit-preview-btn"
                    >
                      <a-icon type="edit" />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="clearRejection('entityType')"
                      class="close-preview-btn"
                    >
                      <a-icon type="close" />
                    </a-button>
                  </div>
                </div>
                <div class="rejection-reason-text">{{ getReasonText('entityType', fields.entityType.selectedReason) }}</div>
                <div v-if="fields.entityType.comments" class="rejection-comments-text">{{ fields.entityType.comments }}</div>
              </div>
            </div>

            <div class="field-actions">
              <div class="action-buttons">
                <a-button
                  :type="fields.entityType.status === 'approved' ? 'primary' : 'default'"
                  @click="handleApprove('entityType')"
                  size="default"
                  class="approve-btn"
                >
                  Approve
                </a-button>
                <a-button
                  :type="fields.entityType.status === 'rejected' ? 'danger' : 'default'"
                  @click="handleReject('entityType')"
                  size="default"
                  class="reject-btn"
                >
                  Reject
                </a-button>
              </div>
              <div class="status-icon">
                <a-icon
                  v-if="fields.entityType.status === 'approved'"
                  type="check-circle"
                  class="success-icon"
                />
                <a-icon
                  v-if="fields.entityType.status === 'rejected'"
                  type="close-circle"
                  class="error-icon"
                />
              </div>
            </div>

            <div v-if="fields.entityType.status === 'rejected' && !fields.entityType.confirmed" class="rejection-section">
              <div class="rejection-content">
                <div class="rejection-field">
                  <div class="field-label">Rejection Reason</div>
                  <a-select
                    v-model="fields.entityType.selectedReason"
                    placeholder="Select a reason"
                    style="width: 100%;"
                    size="large"
                  >
                    <a-select-option value="unsupported_entity_type">Entity type not supported</a-select-option>
                    <a-select-option value="high_risk_entity">High risk entity type</a-select-option>
                    <a-select-option value="requires_additional_docs">Requires additional documentation</a-select-option>
                    <a-select-option value="other">Other</a-select-option>
                  </a-select>
                </div>

                <div class="comments-field">
                  <div class="field-label">Comments</div>
                  <div class="textarea-wrapper">
                    <a-textarea
                      v-model="fields.entityType.comments"
                      placeholder="Specify modifications required, 200 chars max"
                      :rows="4"
                      :maxLength="200"
                      class="comments-textarea"
                    />
                    <div class="char-count">{{ fields.entityType.comments ? fields.entityType.comments.length : 0 }}/200 character</div>
                  </div>
                </div>

                <div class="rejection-actions">
                  <a-button @click="cancelFieldRejection('entityType')" class="cancel-btn">
                    Cancel
                  </a-button>
                  <a-button
                    type="primary"
                    @click="confirmFieldRejection('entityType')"
                    :disabled="!fields.entityType.selectedReason"
                    class="confirm-btn"
                  >
                    Confirm Rejection
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Registration Number -->
          <div class="field-item">
            <div class="field-content">
              <div class="field-label">Registration Number</div>
              <div class="field-value">12345678-XXX-XX-XX</div>
            </div>

            <div v-if="fields.registrationNumber.status === 'rejected' && fields.registrationNumber.confirmed" class="rejection-preview">
              <div class="rejection-preview-content">
                <div class="rejection-title">
                  <span class="rejection-label">Rejection Reason:</span>
                  <div class="preview-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="editRejection('registrationNumber')"
                      class="edit-preview-btn"
                    >
                      <a-icon type="edit" />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="clearRejection('registrationNumber')"
                      class="close-preview-btn"
                    >
                      <a-icon type="close" />
                    </a-button>
                  </div>
                </div>
                <div class="rejection-reason-text">{{ getReasonText('registrationNumber', fields.registrationNumber.selectedReason) }}</div>
                <div v-if="fields.registrationNumber.comments" class="rejection-comments-text">{{ fields.registrationNumber.comments }}</div>
              </div>
            </div>

            <div class="field-actions">
              <div class="action-buttons">
                <a-button
                  :type="fields.registrationNumber.status === 'approved' ? 'primary' : 'default'"
                  @click="handleApprove('registrationNumber')"
                  size="default"
                  class="approve-btn"
                >
                  Approve
                </a-button>
                <a-button
                  :type="fields.registrationNumber.status === 'rejected' ? 'danger' : 'default'"
                  @click="handleReject('registrationNumber')"
                  size="default"
                  class="reject-btn"
                >
                  Reject
                </a-button>
              </div>
              <div class="status-icon">
                <a-icon
                  v-if="fields.registrationNumber.status === 'approved'"
                  type="check-circle"
                  class="success-icon"
                />
                <a-icon
                  v-if="fields.registrationNumber.status === 'rejected'"
                  type="close-circle"
                  class="error-icon"
                />
              </div>
            </div>

            <div v-if="fields.registrationNumber.status === 'rejected' && !fields.registrationNumber.confirmed" class="rejection-section">
              <div class="rejection-content">
                <div class="rejection-field">
                  <div class="field-label">Rejection Reason</div>
                  <a-select
                    v-model="fields.registrationNumber.selectedReason"
                    placeholder="Select a reason"
                    style="width: 100%;"
                    size="large"
                  >
                    <a-select-option value="invalid_format">Invalid registration number format</a-select-option>
                    <a-select-option value="number_not_found">Registration number not found</a-select-option>
                    <a-select-option value="expired_registration">Registration has expired</a-select-option>
                    <a-select-option value="other">Other</a-select-option>
                  </a-select>
                </div>

                <div class="comments-field">
                  <div class="field-label">Comments</div>
                  <div class="textarea-wrapper">
                    <a-textarea
                      v-model="fields.registrationNumber.comments"
                      placeholder="Specify modifications required, 200 chars max"
                      :rows="4"
                      :maxLength="200"
                      class="comments-textarea"
                    />
                    <div class="char-count">{{ fields.registrationNumber.comments ? fields.registrationNumber.comments.length : 0 }}/200 character</div>
                  </div>
                </div>

                <div class="rejection-actions">
                  <a-button @click="cancelFieldRejection('registrationNumber')" class="cancel-btn">
                    Cancel
                  </a-button>
                  <a-button
                    type="primary"
                    @click="confirmFieldRejection('registrationNumber')"
                    :disabled="!fields.registrationNumber.selectedReason"
                    class="confirm-btn"
                  >
                    Confirm Rejection
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Brief Introduction -->
          <div class="field-item">
            <div class="field-content">
              <div class="field-label">Brief Introduction of Core Business/Products and Projected Transaction/Volume / Amount per Deal</div>
              <div class="field-value">Software,IT Development, and Consultancy Services</div>
            </div>

            <div v-if="fields.businessIntroduction.status === 'rejected' && fields.businessIntroduction.confirmed" class="rejection-preview">
              <div class="rejection-preview-content">
                <div class="rejection-title">
                  <span class="rejection-label">Rejection Reason:</span>
                  <div class="preview-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="editRejection('businessIntroduction')"
                      class="edit-preview-btn"
                    >
                      <a-icon type="edit" />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="clearRejection('businessIntroduction')"
                      class="close-preview-btn"
                    >
                      <a-icon type="close" />
                    </a-button>
                  </div>
                </div>
                <div class="rejection-reason-text">{{ getReasonText('businessIntroduction', fields.businessIntroduction.selectedReason) }}</div>
                <div v-if="fields.businessIntroduction.comments" class="rejection-comments-text">{{ fields.businessIntroduction.comments }}</div>
              </div>
            </div>

            <div class="field-actions">
              <div class="action-buttons">
                <a-button
                  :type="fields.businessIntroduction.status === 'approved' ? 'primary' : 'default'"
                  @click="handleApprove('businessIntroduction')"
                  size="default"
                  class="approve-btn"
                >
                  Approve
                </a-button>
                <a-button
                  :type="fields.businessIntroduction.status === 'rejected' ? 'danger' : 'default'"
                  @click="handleReject('businessIntroduction')"
                  size="default"
                  class="reject-btn"
                >
                  Reject
                </a-button>
              </div>
              <div class="status-icon">
                <a-icon
                  v-if="fields.businessIntroduction.status === 'approved'"
                  type="check-circle"
                  class="success-icon"
                />
                <a-icon
                  v-if="fields.businessIntroduction.status === 'rejected'"
                  type="close-circle"
                  class="error-icon"
                />
              </div>
            </div>

            <div v-if="fields.businessIntroduction.status === 'rejected' && !fields.businessIntroduction.confirmed" class="rejection-section">
              <div class="rejection-content">
                <div class="rejection-field">
                  <div class="field-label">Rejection Reason</div>
                  <a-select
                    v-model="fields.businessIntroduction.selectedReason"
                    placeholder="Select a reason"
                    style="width: 100%;"
                    size="large"
                  >
                    <a-select-option value="insufficient_detail">Insufficient business detail</a-select-option>
                    <a-select-option value="high_risk_business">High risk business model</a-select-option>
                    <a-select-option value="unclear_description">Business description unclear</a-select-option>
                    <a-select-option value="prohibited_business">Prohibited business type</a-select-option>
                    <a-select-option value="inconsistent_situation">Inconsistent with the actual situation</a-select-option>
                    <a-select-option value="other">Other</a-select-option>
                  </a-select>
                </div>

                <div class="comments-field">
                  <div class="field-label">Comments</div>
                  <div class="textarea-wrapper">
                    <a-textarea
                      v-model="fields.businessIntroduction.comments"
                      placeholder="Specify modifications required, 200 chars max"
                      :rows="4"
                      :maxLength="200"
                      class="comments-textarea"
                    />
                    <div class="char-count">{{ fields.businessIntroduction.comments ? fields.businessIntroduction.comments.length : 0 }}/200 character</div>
                  </div>
                </div>

                <div class="rejection-actions">
                  <a-button @click="cancelFieldRejection('businessIntroduction')" class="cancel-btn">
                    Cancel
                  </a-button>
                  <a-button
                    type="primary"
                    @click="confirmFieldRejection('businessIntroduction')"
                    :disabled="!fields.businessIntroduction.selectedReason"
                    class="confirm-btn"
                  >
                    Confirm Rejection
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents Section -->
        <div class="section">
          <h3 class="section-title">Documents</h3>

          <!-- Company Registration Certificate CI -->
          <div class="document-item">
            <div class="doc-header">
              <h4 class="doc-title">Company Registration Certificate CI</h4>
            </div>

            <!-- 文档图片预览区域 -->
            <div class="doc-images">
              <div class="image-preview" @click="previewDocument('companyRegistration', 0)">
                <img src="https://picsum.photos/120/90?random=1" alt="Company Registration Certificate - Page 1" />
              </div>
              <div class="image-preview" @click="previewDocument('companyRegistration', 1)">
                <img src="https://picsum.photos/120/90?random=11" alt="Company Registration Certificate - Page 2" />
              </div>
              <div class="image-preview" @click="previewDocument('companyRegistration', 2)">
                <img src="https://picsum.photos/120/90?random=21" alt="Company Registration Certificate - Page 3" />
              </div>
            </div>

            <!-- 拒绝原因预览 -->
            <div v-if="documents.companyRegistration.status === 'rejected' && documents.companyRegistration.confirmed" class="rejection-preview">
              <div class="rejection-preview-content">
                <div class="rejection-title">
                  <span class="rejection-label">Rejection Reason:</span>
                  <div class="preview-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="editDocumentRejection('companyRegistration')"
                      class="edit-preview-btn"
                    >
                      <a-icon type="edit" />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="clearDocumentRejection('companyRegistration')"
                      class="close-preview-btn"
                    >
                      <a-icon type="close" />
                    </a-button>
                  </div>
                </div>
                <div class="rejection-reason-text">{{ getDocumentReasonText(documents.companyRegistration.selectedReason) }}</div>
                <div v-if="documents.companyRegistration.comments" class="rejection-comments-text">{{ documents.companyRegistration.comments }}</div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="doc-actions">
              <div class="action-buttons">
                <a-button
                  :type="documents.companyRegistration.status === 'approved' ? 'primary' : 'default'"
                  @click="handleDocumentApprove('companyRegistration')"
                  size="default"
                  class="approve-btn"
                >
                  Approve
                </a-button>
                <a-button
                  :type="documents.companyRegistration.status === 'rejected' ? 'danger' : 'default'"
                  @click="handleDocumentReject('companyRegistration')"
                  size="default"
                  class="reject-btn"
                >
                  Reject
                </a-button>
              </div>
              <div class="status-icon">
                <a-icon
                  v-if="documents.companyRegistration.status === 'approved'"
                  type="check-circle"
                  class="success-icon"
                />
                <a-icon
                  v-if="documents.companyRegistration.status === 'rejected'"
                  type="close-circle"
                  class="error-icon"
                />
              </div>
            </div>

            <!-- 拒绝原因编辑区域 -->
            <div v-if="documents.companyRegistration.status === 'rejected' && !documents.companyRegistration.confirmed" class="rejection-section">
              <div class="rejection-content">
                <div class="rejection-field">
                  <div class="field-label">Rejection Reason</div>
                  <a-select
                    v-model="documents.companyRegistration.selectedReason"
                    placeholder="Select a reason"
                    style="width: 100%;"
                    size="large"
                  >
                    <a-select-option value="unclear_document">Document is unclear or unreadable</a-select-option>
                    <a-select-option value="missing_information">Missing required information</a-select-option>
                    <a-select-option value="invalid_format">Invalid document format</a-select-option>
                    <a-select-option value="expired_document">Document has expired</a-select-option>
                    <a-select-option value="other">Other</a-select-option>
                  </a-select>
                </div>

                <div class="comments-field">
                  <div class="field-label">Comments</div>
                  <div class="textarea-wrapper">
                    <a-textarea
                      v-model="documents.companyRegistration.comments"
                      placeholder="Specify modifications required, 200 chars max"
                      :rows="4"
                      :maxLength="200"
                      class="comments-textarea"
                    />
                    <div class="char-count">{{ documents.companyRegistration.comments ? documents.companyRegistration.comments.length : 0 }}/200 character</div>
                  </div>
                </div>

                <div class="rejection-actions">
                  <a-button @click="cancelDocumentRejection('companyRegistration')" class="cancel-btn">
                    Cancel
                  </a-button>
                  <a-button
                    type="primary"
                    @click="confirmDocumentRejection('companyRegistration')"
                    :disabled="!documents.companyRegistration.selectedReason"
                    class="confirm-btn"
                  >
                    Confirm Rejection
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Business Registration Certificate BR -->
          <div class="document-item">
            <div class="doc-header">
              <h4 class="doc-title">Business Registration Certificate BR</h4>
            </div>

            <div class="doc-images">
              <div class="image-preview" @click="previewDocument('businessRegistration', 0)">
                <img src="https://picsum.photos/120/90?random=2" alt="Business Registration Certificate" />
              </div>
            </div>

            <div v-if="documents.businessRegistration.status === 'rejected' && documents.businessRegistration.confirmed" class="rejection-preview">
              <div class="rejection-preview-content">
                <div class="rejection-title">
                  <span class="rejection-label">Rejection Reason:</span>
                  <div class="preview-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="editDocumentRejection('businessRegistration')"
                      class="edit-preview-btn"
                    >
                      <a-icon type="edit" />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="clearDocumentRejection('businessRegistration')"
                      class="close-preview-btn"
                    >
                      <a-icon type="close" />
                    </a-button>
                  </div>
                </div>
                <div class="rejection-reason-text">{{ getDocumentReasonText(documents.businessRegistration.selectedReason) }}</div>
                <div v-if="documents.businessRegistration.comments" class="rejection-comments-text">{{ documents.businessRegistration.comments }}</div>
              </div>
            </div>

            <div class="doc-actions">
              <div class="action-buttons">
                <a-button
                  :type="documents.businessRegistration.status === 'approved' ? 'primary' : 'default'"
                  @click="handleDocumentApprove('businessRegistration')"
                  size="default"
                  class="approve-btn"
                >
                  Approve
                </a-button>
                <a-button
                  :type="documents.businessRegistration.status === 'rejected' ? 'danger' : 'default'"
                  @click="handleDocumentReject('businessRegistration')"
                  size="default"
                  class="reject-btn"
                >
                  Reject
                </a-button>
              </div>
              <div class="status-icon">
                <a-icon
                  v-if="documents.businessRegistration.status === 'approved'"
                  type="check-circle"
                  class="success-icon"
                />
                <a-icon
                  v-if="documents.businessRegistration.status === 'rejected'"
                  type="close-circle"
                  class="error-icon"
                />
              </div>
            </div>

            <div v-if="documents.businessRegistration.status === 'rejected' && !documents.businessRegistration.confirmed" class="rejection-section">
              <div class="rejection-content">
                <div class="rejection-field">
                  <div class="field-label">Rejection Reason</div>
                  <a-select
                    v-model="documents.businessRegistration.selectedReason"
                    placeholder="Select a reason"
                    style="width: 100%;"
                    size="large"
                  >
                    <a-select-option value="unclear_document">Document is unclear or unreadable</a-select-option>
                    <a-select-option value="missing_information">Missing required information</a-select-option>
                    <a-select-option value="invalid_format">Invalid document format</a-select-option>
                    <a-select-option value="expired_document">Document has expired</a-select-option>
                    <a-select-option value="other">Other</a-select-option>
                  </a-select>
                </div>

                <div class="comments-field">
                  <div class="field-label">Comments</div>
                  <div class="textarea-wrapper">
                    <a-textarea
                      v-model="documents.businessRegistration.comments"
                      placeholder="Specify modifications required, 200 chars max"
                      :rows="4"
                      :maxLength="200"
                      class="comments-textarea"
                    />
                    <div class="char-count">{{ documents.businessRegistration.comments ? documents.businessRegistration.comments.length : 0 }}/200 character</div>
                  </div>
                </div>

                <div class="rejection-actions">
                  <a-button @click="cancelDocumentRejection('businessRegistration')" class="cancel-btn">
                    Cancel
                  </a-button>
                  <a-button
                    type="primary"
                    @click="confirmDocumentRejection('businessRegistration')"
                    :disabled="!documents.businessRegistration.selectedReason"
                    class="confirm-btn"
                  >
                    Confirm Rejection
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- NNC1 / NAR1 -->
          <div class="document-item">
            <div class="doc-header">
              <h4 class="doc-title">NNC1 / NAR1</h4>
            </div>

            <div class="doc-images">
              <div class="image-preview" @click="previewDocument('nnc1', 0)">
                <img src="https://picsum.photos/120/90?random=3" alt="NNC1 / NAR1 - Page 1" />
              </div>
              <div class="image-preview" @click="previewDocument('nnc1', 1)">
                <img src="https://picsum.photos/120/90?random=13" alt="NNC1 / NAR1 - Page 2" />
              </div>
            </div>

            <div v-if="documents.nnc1.status === 'rejected' && documents.nnc1.confirmed" class="rejection-preview">
              <div class="rejection-preview-content">
                <div class="rejection-title">
                  <span class="rejection-label">Rejection Reason:</span>
                  <div class="preview-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="editDocumentRejection('nnc1')"
                      class="edit-preview-btn"
                    >
                      <a-icon type="edit" />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="clearDocumentRejection('nnc1')"
                      class="close-preview-btn"
                    >
                      <a-icon type="close" />
                    </a-button>
                  </div>
                </div>
                <div class="rejection-reason-text">{{ getDocumentReasonText(documents.nnc1.selectedReason) }}</div>
                <div v-if="documents.nnc1.comments" class="rejection-comments-text">{{ documents.nnc1.comments }}</div>
              </div>
            </div>

            <div class="doc-actions">
              <div class="action-buttons">
                <a-button
                  :type="documents.nnc1.status === 'approved' ? 'primary' : 'default'"
                  @click="handleDocumentApprove('nnc1')"
                  size="default"
                  class="approve-btn"
                >
                  Approve
                </a-button>
                <a-button
                  :type="documents.nnc1.status === 'rejected' ? 'danger' : 'default'"
                  @click="handleDocumentReject('nnc1')"
                  size="default"
                  class="reject-btn"
                >
                  Reject
                </a-button>
              </div>
              <div class="status-icon">
                <a-icon
                  v-if="documents.nnc1.status === 'approved'"
                  type="check-circle"
                  class="success-icon"
                />
                <a-icon
                  v-if="documents.nnc1.status === 'rejected'"
                  type="close-circle"
                  class="error-icon"
                />
              </div>
            </div>

            <div v-if="documents.nnc1.status === 'rejected' && !documents.nnc1.confirmed" class="rejection-section">
              <div class="rejection-content">
                <div class="rejection-field">
                  <div class="field-label">Rejection Reason</div>
                  <a-select
                    v-model="documents.nnc1.selectedReason"
                    placeholder="Select a reason"
                    style="width: 100%;"
                    size="large"
                  >
                    <a-select-option value="unclear_document">Document is unclear or unreadable</a-select-option>
                    <a-select-option value="missing_information">Missing required information</a-select-option>
                    <a-select-option value="invalid_format">Invalid document format</a-select-option>
                    <a-select-option value="expired_document">Document has expired</a-select-option>
                    <a-select-option value="other">Other</a-select-option>
                  </a-select>
                </div>

                <div class="comments-field">
                  <div class="field-label">Comments</div>
                  <div class="textarea-wrapper">
                    <a-textarea
                      v-model="documents.nnc1.comments"
                      placeholder="Specify modifications required, 200 chars max"
                      :rows="4"
                      :maxLength="200"
                      class="comments-textarea"
                    />
                    <div class="char-count">{{ documents.nnc1.comments ? documents.nnc1.comments.length : 0 }}/200 character</div>
                  </div>
                </div>

                <div class="rejection-actions">
                  <a-button @click="cancelDocumentRejection('nnc1')" class="cancel-btn">
                    Cancel
                  </a-button>
                  <a-button
                    type="primary"
                    @click="confirmDocumentRejection('nnc1')"
                    :disabled="!documents.nnc1.selectedReason"
                    class="confirm-btn"
                  >
                    Confirm Rejection
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Articles of Association -->
          <div class="document-item">
            <div class="doc-header">
              <h4 class="doc-title">Articles of Association</h4>
            </div>

            <div class="doc-images">
              <div class="image-preview" @click="previewDocument('articles', 0)">
                <img src="https://picsum.photos/120/90?random=4" alt="Articles of Association" />
              </div>
            </div>

            <div v-if="documents.articles.status === 'rejected' && documents.articles.confirmed" class="rejection-preview">
              <div class="rejection-preview-content">
                <div class="rejection-title">
                  <span class="rejection-label">Rejection Reason:</span>
                  <div class="preview-actions">
                    <a-button
                      type="link"
                      size="small"
                      @click="editDocumentRejection('articles')"
                      class="edit-preview-btn"
                    >
                      <a-icon type="edit" />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      @click="clearDocumentRejection('articles')"
                      class="close-preview-btn"
                    >
                      <a-icon type="close" />
                    </a-button>
                  </div>
                </div>
                <div class="rejection-reason-text">{{ getDocumentReasonText(documents.articles.selectedReason) }}</div>
                <div v-if="documents.articles.comments" class="rejection-comments-text">{{ documents.articles.comments }}</div>
              </div>
            </div>

            <div class="doc-actions">
              <div class="action-buttons">
                <a-button
                  :type="documents.articles.status === 'approved' ? 'primary' : 'default'"
                  @click="handleDocumentApprove('articles')"
                  size="default"
                  class="approve-btn"
                >
                  Approve
                </a-button>
                <a-button
                  :type="documents.articles.status === 'rejected' ? 'danger' : 'default'"
                  @click="handleDocumentReject('articles')"
                  size="default"
                  class="reject-btn"
                >
                  Reject
                </a-button>
              </div>
              <div class="status-icon">
                <a-icon
                  v-if="documents.articles.status === 'approved'"
                  type="check-circle"
                  class="success-icon"
                />
                <a-icon
                  v-if="documents.articles.status === 'rejected'"
                  type="close-circle"
                  class="error-icon"
                />
              </div>
            </div>

            <div v-if="documents.articles.status === 'rejected' && !documents.articles.confirmed" class="rejection-section">
              <div class="rejection-content">
                <div class="rejection-field">
                  <div class="field-label">Rejection Reason</div>
                  <a-select
                    v-model="documents.articles.selectedReason"
                    placeholder="Select a reason"
                    style="width: 100%;"
                    size="large"
                  >
                    <a-select-option value="unclear_document">Document is unclear or unreadable</a-select-option>
                    <a-select-option value="missing_information">Missing required information</a-select-option>
                    <a-select-option value="invalid_format">Invalid document format</a-select-option>
                    <a-select-option value="expired_document">Document has expired</a-select-option>
                    <a-select-option value="other">Other</a-select-option>
                  </a-select>
                </div>

                <div class="comments-field">
                  <div class="field-label">Comments</div>
                  <div class="textarea-wrapper">
                    <a-textarea
                      v-model="documents.articles.comments"
                      placeholder="Specify modifications required, 200 chars max"
                      :rows="4"
                      :maxLength="200"
                      class="comments-textarea"
                    />
                    <div class="char-count">{{ documents.articles.comments ? documents.articles.comments.length : 0 }}/200 character</div>
                  </div>
                </div>

                <div class="rejection-actions">
                  <a-button @click="cancelDocumentRejection('articles')" class="cancel-btn">
                    Cancel
                  </a-button>
                  <a-button
                    type="primary"
                    @click="confirmDocumentRejection('articles')"
                    :disabled="!documents.articles.selectedReason"
                    class="confirm-btn"
                  >
                    Confirm Rejection
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="final-actions">
          <a-button @click="goBack" class="back-btn">
            <a-icon type="left" />
            Back to List
          </a-button>
          <a-button type="default" @click="saveProgress">
            Save Progress
          </a-button>
          <a-button
            type="primary"
            @click="confirmReview"
            :disabled="!allFieldsReviewed"
          >
            Confirm Review
          </a-button>
        </div>
      </div>

      <!-- 右侧统计区域 -->
      <div class="right-section">
        <!-- Approval Summary -->
        <div class="summary-card">
          <h3 class="card-title">Approval Summary</h3>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Total Fields</span>
              <span class="stat-value">{{ totalFields }}</span>
            </div>
            <div class="stat-item approved">
              <span class="stat-label">Approved</span>
              <span class="stat-value">{{ approvedCount }}</span>
            </div>
            <div class="stat-item rejected">
              <span class="stat-label">Rejected</span>
              <span class="stat-value">{{ rejectedCount }}</span>
            </div>
            <div class="stat-item pending">
              <span class="stat-label">Pending</span>
              <span class="stat-value">{{ pendingCount }}</span>
            </div>
          </div>
        </div>

        <!-- Application Details -->
        <div class="details-card">
          <h3 class="card-title">Application Details</h3>
          <div class="detail-items">
            <div class="detail-row">
              <span class="detail-label">Client ID:</span>
              <span class="detail-value">CLI-001</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Submit Time:</span>
              <span class="detail-value">2025/02/10 12:20:32</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Account ID:</span>
              <span class="detail-value">ACC-2001</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Channel:</span>
              <span class="detail-value">Direct Channel</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <a-modal
      :visible="previewVisible"
      :footer="null"
      @cancel="previewVisible = false"
      :width="800"
      :title="previewTitle"
      centered
    >
      <div class="preview-content">
        <img :src="previewImageUrl" :alt="previewTitle" class="preview-image" />
      </div>
    </a-modal>
  </div>
</template>

<script>
// 引入viewerjs图片预览插件
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'

export default {
  name: 'ApprovalReview',
  data () {
    return {
      previewVisible: false,
      previewImageUrl: '',
      previewTitle: '',
      fields: {
        companyName: {
          status: null, // null, 'approved', 'rejected'
          selectedReason: '',
          comments: '',
          confirmed: false // 是否已确认拒绝
        },
        businessEmail: {
          status: null,
          selectedReason: '',
          comments: '',
          confirmed: false
        },
        businessPhone: {
          status: null,
          selectedReason: '',
          comments: '',
          confirmed: false
        },
        entityType: {
          status: null,
          selectedReason: '',
          comments: '',
          confirmed: false
        },
        registrationNumber: {
          status: null,
          selectedReason: '',
          comments: '',
          confirmed: false
        },
        businessIntroduction: {
          status: null,
          selectedReason: '',
          comments: '',
          confirmed: false
        }
      },
      documents: {
        companyRegistration: {
          status: null,
          selectedReason: '',
          comments: '',
          confirmed: false,
          images: [
            'https://picsum.photos/800/600?random=1',
            'https://picsum.photos/800/600?random=11',
            'https://picsum.photos/800/600?random=21'
          ]
        },
        businessRegistration: {
          status: null,
          selectedReason: '',
          comments: '',
          confirmed: false,
          images: [
            'https://picsum.photos/800/600?random=2'
          ]
        },
        nnc1: {
          status: null,
          selectedReason: '',
          comments: '',
          confirmed: false,
          images: [
            'https://picsum.photos/800/600?random=3',
            'https://picsum.photos/800/600?random=13'
          ]
        },
        articles: {
          status: null,
          selectedReason: '',
          comments: '',
          confirmed: false,
          images: [
            'https://picsum.photos/800/600?random=4'
          ]
        }
      }
    }
  },

  computed: {
    totalFields () {
      return Object.keys(this.fields).length + Object.keys(this.documents).length
    },

    approvedCount () {
      const fieldsApproved = Object.values(this.fields).filter(field => field.status === 'approved').length
      const docsApproved = Object.values(this.documents).filter(doc => doc.status === 'approved').length
      return fieldsApproved + docsApproved
    },

    rejectedCount () {
      const fieldsRejected = Object.values(this.fields).filter(field => field.status === 'rejected').length
      const docsRejected = Object.values(this.documents).filter(doc => doc.status === 'rejected').length
      return fieldsRejected + docsRejected
    },

    pendingCount () {
      const fieldsPending = Object.values(this.fields).filter(field => field.status === null).length
      const docsPending = Object.values(this.documents).filter(doc => doc.status === null).length
      return fieldsPending + docsPending
    },

    allFieldsReviewed () {
      const allFieldsReviewed = Object.values(this.fields).every(field => field.status !== null)
      const allDocsReviewed = Object.values(this.documents).every(doc => doc.status !== null)
      return allFieldsReviewed && allDocsReviewed
    }
  },

  methods: {
    handleApprove (fieldName) {
      this.fields[fieldName].status = 'approved'
      // 清空拒绝相关数据
      this.fields[fieldName].selectedReason = ''
      this.fields[fieldName].comments = ''
      this.fields[fieldName].confirmed = false
      this.$message.success(`${this.getFieldDisplayName(fieldName)} approved`)
    },

    handleReject (fieldName) {
      this.fields[fieldName].status = 'rejected'
      this.fields[fieldName].confirmed = false // 重置确认状态，显示编辑界面
      this.$message.warning(`${this.getFieldDisplayName(fieldName)} rejected`)
    },

    cancelFieldRejection (fieldName) {
      this.fields[fieldName].status = null
      this.fields[fieldName].selectedReason = ''
      this.fields[fieldName].comments = ''
      this.fields[fieldName].confirmed = false
    },

    confirmFieldRejection (fieldName) {
      if (!this.fields[fieldName].selectedReason) {
        this.$message.warning('Please select a rejection reason')
        return
      }
      this.fields[fieldName].confirmed = true
      this.$message.success(`${this.getFieldDisplayName(fieldName)} rejection confirmed`)
    },

    editRejection (fieldName) {
      this.fields[fieldName].confirmed = false
    },

    clearRejection (fieldName) {
      this.fields[fieldName].status = null
      this.fields[fieldName].selectedReason = ''
      this.fields[fieldName].comments = ''
      this.fields[fieldName].confirmed = false
    },

    handleDocumentApprove (docName) {
      this.documents[docName].status = 'approved'
      // 清空拒绝相关数据
      this.documents[docName].selectedReason = ''
      this.documents[docName].comments = ''
      this.documents[docName].confirmed = false
      this.$message.success(`${this.getDocumentDisplayName(docName)} approved`)
    },

    handleDocumentReject (docName) {
      this.documents[docName].status = 'rejected'
      this.documents[docName].confirmed = false
      this.$message.warning(`${this.getDocumentDisplayName(docName)} rejected`)
    },

    cancelDocumentRejection (docName) {
      this.documents[docName].status = null
      this.documents[docName].selectedReason = ''
      this.documents[docName].comments = ''
      this.documents[docName].confirmed = false
    },

    confirmDocumentRejection (docName) {
      if (!this.documents[docName].selectedReason) {
        this.$message.warning('Please select a rejection reason')
        return
      }
      this.documents[docName].confirmed = true
      this.$message.success(`${this.getDocumentDisplayName(docName)} rejection confirmed`)
    },

    editDocumentRejection (docName) {
      this.documents[docName].confirmed = false
    },

    clearDocumentRejection (docName) {
      this.documents[docName].status = null
      this.documents[docName].selectedReason = ''
      this.documents[docName].comments = ''
      this.documents[docName].confirmed = false
    },

    getFieldDisplayName (fieldName) {
      const displayNames = {
        companyName: 'Company Name',
        businessEmail: 'Business Email',
        businessPhone: 'Business Phone Number',
        entityType: 'Entity Type',
        registrationNumber: 'Registration Number',
        businessIntroduction: 'Business Introduction'
      }
      return displayNames[fieldName] || fieldName
    },

    getDocumentDisplayName (docName) {
      const displayNames = {
        companyRegistration: 'Company Registration Certificate',
        businessRegistration: 'Business Registration Certificate',
        nnc1: 'NNC1 / NAR1',
        articles: 'Articles of Association'
      }
      return displayNames[docName] || docName
    },

    getReasonText (fieldName, reasonCode) {
      const reasons = {
        companyName: {
          invalid_company_name: 'Invalid company name format',
          name_mismatch: "Name doesn't match registration",
          reserved_name: 'Company name is reserved',
          inconsistent_situation: 'Inconsistent with the actual situation',
          other: 'Other'
        },
        businessEmail: {
          invalid_email_format: 'Invalid email format',
          domain_not_verified: 'Domain not verified',
          personal_email: 'Personal email not allowed',
          other: 'Other'
        },
        businessPhone: {
          invalid_phone_format: 'Invalid phone number format',
          number_not_verified: 'Phone number not verified',
          region_not_supported: 'Region not supported',
          other: 'Other'
        },
        entityType: {
          unsupported_entity_type: 'Entity type not supported',
          high_risk_entity: 'High risk entity type',
          requires_additional_docs: 'Requires additional documentation',
          other: 'Other'
        },
        registrationNumber: {
          invalid_format: 'Invalid registration number format',
          number_not_found: 'Registration number not found',
          expired_registration: 'Registration has expired',
          other: 'Other'
        },
        businessIntroduction: {
          insufficient_detail: 'Insufficient business detail',
          high_risk_business: 'High risk business model',
          unclear_description: 'Business description unclear',
          prohibited_business: 'Prohibited business type',
          inconsistent_situation: 'Inconsistent with the actual situation',
          other: 'Other'
        }
      }
      return reasons[fieldName]?.[reasonCode] || reasonCode
    },

    getDocumentReasonText (reasonCode) {
      const reasons = {
        unclear_document: 'Document is unclear or unreadable',
        missing_information: 'Missing required information',
        invalid_format: 'Invalid document format',
        expired_document: 'Document has expired',
        other: 'Other'
      }
      return reasons[reasonCode] || reasonCode
    },

    previewDocument (docName, imageIndex = 0) {
      const docTitles = {
        companyRegistration: 'Company Registration Certificate CI',
        businessRegistration: 'Business Registration Certificate BR',
        nnc1: 'NNC1 / NAR1',
        articles: 'Articles of Association'
      }

      this.previewTitle = `${docTitles[docName]} - Page ${imageIndex + 1}`
      this.previewImageUrl = this.documents[docName].images[imageIndex]
      this.previewVisible = true
    },

    goBack () {
      this.$router.go(-1)
    },

    saveProgress () {
      console.log('Saving progress...', { fields: this.fields, documents: this.documents })
      this.$message.success('Progress saved successfully')
    },

    confirmReview () {
      if (!this.allFieldsReviewed) {
        this.$message.warning('Please review all fields and documents before confirming')
        return
      }

      this.$confirm({
        title: 'Confirm Review',
        content: 'Are you sure you want to submit this review? This action cannot be undone.',
        onOk: () => {
          console.log('Review confirmed:', { fields: this.fields, documents: this.documents })
          this.$message.success('Review submitted successfully')
          // 这里可以调用提交接口
          this.goBack()
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.approval-review-page {
  padding: 24px 100px;
  background: #fff;
  min-height: 100vh;

  .page-content {
    display: flex;
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .left-section {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .right-section {
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .company-header {
    margin-bottom: 32px;

    h2 {
      font-size: 24px;
      font-weight: 600;
      color: #262626;
      margin: 0 0 8px 0;
    }

    .status-indicators {
      display: flex;
      align-items: center;
      gap: 8px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.client-id {
          background: #ff4d4f;
        }

        &.pending {
          background: #faad14;
        }
      }

      .status-text {
        font-size: 14px;
        color: #666;
      }
    }
  }

  .section {
    margin-bottom: 32px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
    }
  }

  .field-item {
    margin-bottom: 24px;
    padding: 16px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .field-content {
      margin-bottom: 12px;

      .field-label {
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 4px;
        line-height: 1.4;
      }

      .field-value {
        font-size: 14px;
        color: #262626;
        line-height: 1.5;
      }
    }

    .field-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .action-buttons {
        display: flex;
        gap: 12px;

        .approve-btn, .reject-btn {
          min-width: 100px;
        }
      }

      .status-icon {
        width: 24px;
        display: flex;
        justify-content: center;

        .success-icon {
          color: #52c41a;
          font-size: 18px;
        }

        .error-icon {
          color: #ff4d4f;
          font-size: 18px;
        }
      }
    }

    .rejection-preview {
      margin-bottom: 16px;

      .rejection-preview-content {
        background: #fff2f0;
        border: 1px solid #ffccc7;
        border-radius: 8px;
        padding: 16px;

        .rejection-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .rejection-label {
            font-size: 14px;
            font-weight: 600;
            color: #ff4d4f;
          }

          .preview-actions {
            display: flex;
            gap: 8px;

            .edit-preview-btn, .close-preview-btn {
              padding: 4px;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;

              .anticon {
                font-size: 12px;
              }
            }

            .edit-preview-btn {
              color: #ff4d4f;

              &:hover {
                color: #ff7875;
              }
            }

            .close-preview-btn {
              color: #8c8c8c;

              &:hover {
                color: #595959;
              }
            }
          }
        }

        .rejection-reason-text {
          font-size: 14px;
          color: #262626;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .rejection-comments-text {
          font-size: 14px;
          color: #595959;
          line-height: 1.5;
        }
      }
    }

    .rejection-section {
      margin-top: 16px;
      padding: 20px;
      background: #fff2f0;
      border: 1px solid #ffccc7;
      border-radius: 8px;

      .rejection-content {
        .rejection-field {
          margin-bottom: 20px;

          .field-label {
            font-size: 14px;
            font-weight: 600;
            color: #262626;
            margin-bottom: 8px;
          }
        }

        .comments-field {
          margin-bottom: 20px;

          .field-label {
            font-size: 14px;
            font-weight: 600;
            color: #262626;
            margin-bottom: 8px;
          }

          .textarea-wrapper {
            position: relative;

            .comments-textarea {
              border-radius: 6px;
              resize: none;

              /deep/ .ant-input {
                border-radius: 6px;
                padding-bottom: 30px;
              }
            }

            .char-count {
              position: absolute;
              bottom: 8px;
              right: 12px;
              font-size: 12px;
              color: #8c8c8c;
              background: #fff;
              padding: 2px 4px;
            }
          }
        }

        .rejection-actions {
          display: flex;
          gap: 12px;

          .cancel-btn {
            min-width: 100px;
            border-radius: 6px;
          }

          .confirm-btn {
            min-width: 140px;
            border-radius: 6px;
          }
        }
      }
    }
  }

  .document-item {
    margin-bottom: 32px;
    padding: 20px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fafafa;

    .doc-header {
      margin-bottom: 16px;

      .doc-title {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin: 0;
      }
    }

    .doc-images {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;

      .image-preview {
        width: 120px;
        height: 90px;
        border: 1px solid #e8e8e8;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .rejection-preview {
      margin-bottom: 16px;

      .rejection-preview-content {
        background: #fff2f0;
        border: 1px solid #ffccc7;
        border-radius: 8px;
        padding: 16px;

        .rejection-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .rejection-label {
            font-size: 14px;
            font-weight: 600;
            color: #ff4d4f;
          }

          .preview-actions {
            display: flex;
            gap: 8px;

            .edit-preview-btn, .close-preview-btn {
              padding: 4px;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;

              .anticon {
                font-size: 12px;
              }
            }

            .edit-preview-btn {
              color: #ff4d4f;

              &:hover {
                color: #ff7875;
              }
            }

            .close-preview-btn {
              color: #8c8c8c;

              &:hover {
                color: #595959;
              }
            }
          }
        }

        .rejection-reason-text {
          font-size: 14px;
          color: #262626;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .rejection-comments-text {
          font-size: 14px;
          color: #595959;
          line-height: 1.5;
        }
      }
    }

    .doc-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .action-buttons {
        display: flex;
        gap: 12px;

        .approve-btn, .reject-btn {
          min-width: 100px;
        }
      }

      .status-icon {
        width: 24px;
        display: flex;
        justify-content: center;

        .success-icon {
          color: #52c41a;
          font-size: 18px;
        }

        .error-icon {
          color: #ff4d4f;
          font-size: 18px;
        }
      }
    }

    .rejection-section {
      border-top: 1px solid #f0f0f0;
      padding-top: 16px;
      padding: 20px;
      background: #fff2f0;
      border: 1px solid #ffccc7;
      border-radius: 8px;

      .rejection-content {
        .rejection-field {
          margin-bottom: 20px;

          .field-label {
            font-size: 14px;
            font-weight: 600;
            color: #262626;
            margin-bottom: 8px;
          }
        }

        .comments-field {
          margin-bottom: 20px;

          .field-label {
            font-size: 14px;
            font-weight: 600;
            color: #262626;
            margin-bottom: 8px;
          }

          .textarea-wrapper {
            position: relative;

            .comments-textarea {
              border-radius: 6px;
              resize: none;

              /deep/ .ant-input {
                border-radius: 6px;
                padding-bottom: 30px;
              }
            }

            .char-count {
              position: absolute;
              bottom: 8px;
              right: 12px;
              font-size: 12px;
              color: #8c8c8c;
              background: #fff;
              padding: 2px 4px;
            }
          }
        }

        .rejection-actions {
          display: flex;
          gap: 12px;

          .cancel-btn {
            min-width: 100px;
            border-radius: 6px;
          }

          .confirm-btn {
            min-width: 140px;
            border-radius: 6px;
          }
        }
      }
    }
  }

  .final-actions {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    .back-btn {
      margin-right: auto;
    }
  }

  .summary-card, .details-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 16px;
    }
  }

  .summary-stats {
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
      }

      .stat-value {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }

      &.approved .stat-value {
        color: #52c41a;
      }

      &.rejected .stat-value {
        color: #ff4d4f;
      }

      &.pending .stat-value {
        color: #faad14;
      }
    }
  }

  .detail-items {
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;

      .detail-label {
        font-size: 12px;
        color: #8c8c8c;
      }

      .detail-value {
        font-size: 12px;
        color: #262626;
        font-weight: 500;
      }
    }
  }

  .preview-content {
    text-align: center;

    .preview-image {
      max-width: 100%;
      max-height: 500px;
      object-fit: contain;
      border-radius: 6px;
    }
  }
}

@media (max-width: 1200px) {
  .approval-review-page .page-content {
    flex-direction: column;

    .right-section {
      width: 100%;
      flex-direction: row;
    }
  }
}

@media (max-width: 768px) {
  .approval-review-page {
    padding: 16px 0;

    .right-section {
      flex-direction: column;
    }

    .field-actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .action-buttons {
      order: 2;
    }

    .status-icon {
      order: 1;
      align-self: flex-end;
    }

    .document-item {
      .doc-images {
        .image-preview {
          width: 100px;
          height: 75px;
        }
      }

      .doc-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;

        .action-buttons {
          justify-content: flex-start;
        }

        .status-icon {
          align-self: flex-end;
        }
      }

      .rejection-section {
        .rejection-actions {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }
      }
    }
  }
}
</style>

<!--
安装viewerjs图片预览插件：
npm install viewerjs

使用说明：
1. 已在组件中引入并配置了viewerjs
2. 点击图片文件的查看按钮将使用viewerjs打开高清预览
3. 支持缩放、旋转、全屏、下载等功能
4. 预览窗口支持键盘操作和鼠标拖拽

功能特性：
- 缩放：鼠标滚轮或工具栏按钮
- 拖拽：鼠标拖拽移动图片
- 旋转：工具栏旋转按钮
- 全屏：ESC键或点击退出
- 下载：工具栏下载按钮

如果项目中还需要安装v-viewer的Vue封装版本：
npm install v-viewer
-->
