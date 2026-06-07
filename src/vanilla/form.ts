import { Card, CardFormOptions, OptionalCardField } from '../core/domain/card';
import { detectCardBrand } from '../core/domain/brand';
import { formatCardNumber, formatExpiry, formatCvc } from '../core/formatters/card-formatter';
import {
  luhnCheck,
  validateExpiry,
  validateCvc,
  validateName,
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateCountry,
  validateGeneric
} from '../core/domain/validation';

// Vector inline SVGs for premium look without external dependencies
const BRAND_LOGOS: Record<string, string> = {
  visa: `<svg viewBox="0 0 24 24"><path fill="#0a84ff" d="M12.8 15.6h1.7l1-6.5h-1.7zm5.5-6.5c-.4-.1-.9-.2-1.4-.2-1.5 0-2.6.8-2.6 1.9 0 .8.8 1.3 1.3 1.6.6.3.8.5.8.7 0 .4-.5.6-1 .6-.6 0-1.1-.2-1.6-.4l-.2-.1-.3 1.8c.5.2 1.4.4 2.2.4 1.6 0 2.6-.8 2.6-2 0-.7-.4-1.2-1.4-1.7-.6-.3-.9-.5-.9-.7 0-.3.3-.5.8-.5.5 0 .9.1 1.2.3l.1.1.3-1.8zM9.5 9.1h-1.6c-.5 0-.9.3-1.1.7L4 15.6h1.8l.4-1h2.2l.2 1H10l-.5-6.5zm-2.7 4.1.8-2.3.5 2.3H6.8zm7.9-4.1h-1.4c-.4 0-.8.2-.9.6l-2.6 5.8h1.8l.4-1h2.2l.2 1H16l-1.3-6.4z"/></svg>`,
  mastercard: `<svg viewBox="0 0 24 24"><circle cx="9" cy="12" r="6" fill="#ff453a" opacity="0.95"/><circle cx="15" cy="12" r="6" fill="#ff9f0a" opacity="0.95"/></svg>`,
  amex: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#0a84ff"/><path fill="#fff" d="M4 17h1.6l.8-2.3h2.3l.8 2.3H11l-2.7-7H7.7L4 17zm3.6-4.2.7-2.1.7 2.1H7.6zm5 4.2h1.5v-4.1l1.8 4.1h1.3l1.8-4.1v4.1h1.5v-7h-1.8l-2.1 4.8-2.1-4.8h-1.8v7z"/></svg>`,
  jcb: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#0b4e9f"/><path fill="#ff453a" d="M4 7h16v10H4z"/><path fill="#fff" d="M7 15h1.5v-4.1l1.8 4.1h1.3l1.8-4.1v4.1H15v-7h-1.8l-2.1 4.8-2.1-4.8H7v7z"/></svg>`
};

const DEFAULT_CARD_LOGO = `<svg viewBox="0 0 48 48"><path fill="#8e8e93" d="M37,40H11c-1.65,0-3-1.35-3-3V11c0-1.65,1.35-3,3-3h26c1.65,0,3,1.35,3,3v26C40,38.65,38.65,40,37,40z"/><path fill="#2c2c2e" d="M8,14h32v4H8V14z"/></svg>`;

const FIELD_METADATA: Record<OptionalCardField, { label: string; placeholder: string; type: string; autocomplete: string }> = {
  addressLine1: { label: 'Address', placeholder: 'Street address', type: 'text', autocomplete: 'address-line1' },
  addressLine2: { label: 'Apt, Suite', placeholder: 'Apt, Suite, Unit (optional)', type: 'text', autocomplete: 'address-line2' },
  city: { label: 'City', placeholder: 'City', type: 'text', autocomplete: 'address-level2' },
  state: { label: 'State', placeholder: 'State or Province', type: 'text', autocomplete: 'address-level1' },
  postalCode: { label: 'Postal Code', placeholder: 'Postal/ZIP Code', type: 'text', autocomplete: 'postal-code' },
  country: { label: 'Country', placeholder: 'Country Code (e.g. US, TH)', type: 'text', autocomplete: 'country' },
  phone: { label: 'Phone', placeholder: '+668 1234 567', type: 'tel', autocomplete: 'tel' },
  email: { label: 'Email', placeholder: 'name@example.com', type: 'email', autocomplete: 'email' }
};

const PRESET_FIELDS: Record<string, OptionalCardField[]> = {
  none: [],
  us: ['postalCode'],
  billing: ['addressLine1', 'city', 'state', 'postalCode', 'country'],
  contact: ['email', 'phone']
};

export class CardForm {
  private readonly element: HTMLElement;
  private readonly options: CardFormOptions;
  private formEl!: HTMLFormElement;

  constructor(container: HTMLElement | string, options: CardFormOptions) {
    if (typeof container === 'string') {
      const el = document.querySelector(container);
      if (!el) {
        throw new Error(`Container element not found for selector: ${container}`);
      }
      this.element = el as HTMLElement;
    } else {
      this.element = container;
    }

    this.options = {
      preset: 'none',
      submitButtonText: 'Pay Now',
      ...options
    };

    if (!this.options.submitButtonText) {
      this.options.submitButtonText = 'Pay Now';
    }

    this.render();
  }

  private getActiveFields(): OptionalCardField[] {
    const preset = this.options.preset || 'none';
    const fieldsFromPreset = PRESET_FIELDS[preset] || [];
    const fieldsFromOptions = this.options.fields || [];
    // Combine unique optional fields
    const set = new Set<OptionalCardField>([...fieldsFromPreset, ...fieldsFromOptions]);
    return Array.from(set);
  }

  private render(): void {
    this.element.innerHTML = '';
    
    const containerWrapper = document.createElement('div');
    containerWrapper.className = 'kg-card-container';

    // Renders the 3D card layout
    const cardLabelText = this.options.cardLabel || this.options.adapter.name.toUpperCase();
    
    containerWrapper.innerHTML = `
      <div class="card-perspective">
        <div class="card-inner credit-card-element">
          <!-- Front of Card -->
          <div class="card-front">
            <div class="card-header">
              <div class="card-chip"></div>
              <div class="card-type-label card-gateway-label">${cardLabelText}</div>
            </div>
            <div class="card-number-display card-num-preview">•••• •••• •••• ••••</div>
            <div class="card-footer">
              <div class="card-meta-block">
                <span class="card-meta-label">Cardholder</span>
                <span class="card-meta-value card-holder-preview">CARDHOLDER NAME</span>
              </div>
              <div class="card-meta-block">
                <span class="card-meta-label">Expires</span>
                <span class="card-meta-value card-expiry-preview">MM/YY</span>
              </div>
              <div class="brand-logo card-brand-logo">
                ${DEFAULT_CARD_LOGO}
              </div>
            </div>
          </div>

          <!-- Back of Card -->
          <div class="card-back">
            <div class="card-magnetic-strip"></div>
            <div class="card-signature-area">
              <span class="card-meta-label" style="margin-left: 4px;">Security Code</span>
              <div class="card-signature-strip">
                <div class="card-cvc-display card-cvc-preview">•••</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Inputs Group -->
      <div>
        <h3 class="form-section-header">Payment Method</h3>
        <form class="payment-form-el">
          <div class="ios-grouped-list">
            <!-- Card Number Row -->
            <div class="ios-input-row row-number">
              <label class="ios-label" for="card-number">Card Number</label>
              <input 
                type="text" 
                id="card-number"
                class="ios-input card-number-input" 
                placeholder="•••• •••• •••• ••••"
                inputmode="numeric"
                autocomplete="cc-number"
                required
              >
            </div>

            <!-- Expiry & CVC row wrapper -->
            <div class="ios-input-row-half">
              <div class="ios-input-row row-expiry">
                <label class="ios-label" for="card-expiry" style="width: 55px;">Expires</label>
                <input 
                  type="text" 
                  id="card-expiry"
                  class="ios-input card-expiry-input" 
                  placeholder="MM/YY"
                  inputmode="numeric"
                  autocomplete="cc-exp"
                  required
                >
              </div>
              
              <div class="ios-input-row row-cvc">
                <label class="ios-label" for="card-cvc" style="width: 50px;">CVC</label>
                <input 
                  type="password" 
                  id="card-cvc"
                  class="ios-input card-cvc-input" 
                  placeholder="•••"
                  inputmode="numeric"
                  maxlength="4"
                  autocomplete="cc-csc"
                  required
                >
              </div>
            </div>

            <!-- Anchor point for optional fields. Cardholder Name is last in list. -->
            <div class="ios-input-row row-name">
              <label class="ios-label" for="card-name">Cardholder</label>
              <input 
                type="text" 
                id="card-name"
                class="ios-input card-name-input" 
                placeholder="Full Name"
                autocomplete="cc-name"
                required
              >
            </div>
          </div>
          
          <div class="error-text validation-error-msg">Please correct the invalid fields above.</div>

          <button type="submit" class="pay-btn submit-btn" style="margin-top: 28px;">
            <div class="spinner btn-spinner"></div>
            <span class="btn-text">${this.options.submitButtonText}</span>
          </button>
        </form>
      </div>

      <!-- Success tokenized status -->
      <div class="status-panel token-status">
        <div class="status-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Tokenized Successfully
        </div>
        <div class="status-detail token-detail"></div>
      </div>
    `;

    this.element.appendChild(containerWrapper);
    this.formEl = containerWrapper.querySelector('.payment-form-el') as HTMLFormElement;

    // Inject optional fields dynamically before the Cardholder Name row
    const groupedList = containerWrapper.querySelector('.ios-grouped-list') as HTMLElement;
    const cardholderRow = containerWrapper.querySelector('.row-name') as HTMLElement;
    const activeFields = this.getActiveFields();

    activeFields.forEach(field => {
      const row = this.createDynamicRow(field);
      groupedList.insertBefore(row, cardholderRow);
    });

    this.bindEvents();
  }

  private createDynamicRow(fieldKey: OptionalCardField): HTMLElement {
    const meta = FIELD_METADATA[fieldKey];
    const row = document.createElement('div');
    row.className = `ios-input-row row-${fieldKey}`;

    let labelText = meta.label;
    let placeholderText = meta.placeholder;

    if (fieldKey === 'postalCode' && this.options.preset === 'us') {
      labelText = 'ZIP Code';
      placeholderText = '12345';
    }

    row.innerHTML = `
      <label class="ios-label" for="card-${fieldKey}">${labelText}</label>
      <input 
        type="${meta.type}" 
        id="card-${fieldKey}"
        class="ios-input card-${fieldKey}-input" 
        placeholder="${placeholderText}"
        autocomplete="${meta.autocomplete}"
        required
      >
    `;
    return row;
  }

  private bindEvents(): void {
    const numInput = this.formEl.querySelector('.card-number-input') as HTMLInputElement;
    const expInput = this.formEl.querySelector('.card-expiry-input') as HTMLInputElement;
    const cvcInput = this.formEl.querySelector('.card-cvc-input') as HTMLInputElement;
    const nameInput = this.formEl.querySelector('.card-name-input') as HTMLInputElement;
    const cardInner = this.element.querySelector('.credit-card-element') as HTMLElement;

    // Card formatting & previews
    numInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const val = target.value;
      const formatted = formatCardNumber(val);
      target.value = formatted;

      const brand = detectCardBrand(val);
      target.maxLength = brand === 'amex' ? 17 : 19;

      const numPreview = this.element.querySelector('.card-num-preview') as HTMLElement;
      if (numPreview) {
        numPreview.innerText = formatted || '•••• •••• •••• ••••';
      }

      const logoContainer = this.element.querySelector('.card-brand-logo') as HTMLElement;
      if (logoContainer) {
        logoContainer.innerHTML = BRAND_LOGOS[brand] || DEFAULT_CARD_LOGO;
      }

      target.closest('.ios-input-row')?.classList.remove('invalid');
    });

    expInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const formatted = formatExpiry(target.value);
      target.value = formatted;
      target.maxLength = 7;

      const expPreview = this.element.querySelector('.card-expiry-preview') as HTMLElement;
      if (expPreview) {
        expPreview.innerText = formatted || 'MM/YY';
      }

      target.closest('.ios-input-row')?.classList.remove('invalid');
    });

    cvcInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const formatted = formatCvc(target.value, numInput.value);
      target.value = formatted;

      const cvcPreview = this.element.querySelector('.card-cvc-preview') as HTMLElement;
      if (cvcPreview) {
        cvcPreview.innerText = '•'.repeat(formatted.length) || '•••';
      }

      target.closest('.ios-input-row')?.classList.remove('invalid');
    });

    nameInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const preview = this.element.querySelector('.card-holder-preview') as HTMLElement;
      if (preview) {
        preview.innerText = target.value.toUpperCase() || 'CARDHOLDER NAME';
      }
      target.closest('.ios-input-row')?.classList.remove('invalid');
    });

    // Optional fields listener to clear invalid outline on input
    this.getActiveFields().forEach(field => {
      const input = this.formEl.querySelector(`.card-${field}-input`) as HTMLInputElement;
      input?.addEventListener('input', () => {
        input.closest('.ios-input-row')?.classList.remove('invalid');
      });
    });

    // CVC Flip triggers
    cvcInput.addEventListener('focus', () => {
      cardInner.classList.add('flipped');
    });
    cvcInput.addEventListener('blur', () => {
      cardInner.classList.remove('flipped');
    });

    // Focus triggers for other fields to flip card back
    const removeFlip = () => cardInner.classList.remove('flipped');
    numInput.addEventListener('focus', removeFlip);
    expInput.addEventListener('focus', removeFlip);
    nameInput.addEventListener('focus', removeFlip);

    this.getActiveFields().forEach(field => {
      const input = this.formEl.querySelector(`.card-${field}-input`) as HTMLInputElement;
      input?.addEventListener('focus', removeFlip);
    });

    // Single-field validation on blur
    numInput.addEventListener('blur', () => this.validateField('card-number'));
    expInput.addEventListener('blur', () => this.validateField('card-expiry'));
    cvcInput.addEventListener('blur', () => this.validateField('card-cvc'));
    nameInput.addEventListener('blur', () => this.validateField('card-name'));

    this.getActiveFields().forEach(field => {
      const input = this.formEl.querySelector(`.card-${field}-input`) as HTMLInputElement;
      input?.addEventListener('blur', () => this.validateField(field));
    });

    // Submit listener
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  private validateField(fieldId: string): boolean {
    let el: HTMLInputElement | null;
    if (fieldId === 'card-number' || fieldId === 'card-expiry' || fieldId === 'card-cvc' || fieldId === 'card-name') {
      el = this.formEl.querySelector(`.${fieldId}-input`) as HTMLInputElement;
    } else {
      el = this.formEl.querySelector(`.card-${fieldId}-input`) as HTMLInputElement;
    }

    if (!el) return true;
    const row = el.closest('.ios-input-row');
    let isValid: boolean;
    const val = el.value;

    if (fieldId === 'card-number') {
      const cleanNum = val.replace(/\D/g, '');
      isValid = luhnCheck(cleanNum);
    } else if (fieldId === 'card-expiry') {
      const cleanExp = val.replace(/\D/g, '');
      if (cleanExp.length !== 4) {
        isValid = false;
      } else {
        const month = cleanExp.substring(0, 2);
        const year = cleanExp.substring(2, 4);
        isValid = validateExpiry(month, year);
      }
    } else if (fieldId === 'card-cvc') {
      const cleanCvc = val.replace(/\D/g, '');
      const numInput = this.formEl.querySelector('.card-number-input') as HTMLInputElement;
      isValid = validateCvc(cleanCvc, numInput.value);
    } else if (fieldId === 'card-name') {
      isValid = validateName(val);
    } else if (fieldId === 'email') {
      isValid = validateEmail(val);
    } else if (fieldId === 'phone') {
      isValid = validatePhone(val);
    } else if (fieldId === 'postalCode') {
      isValid = validatePostalCode(val);
    } else if (fieldId === 'country') {
      isValid = validateCountry(val);
    } else {
      isValid = validateGeneric(val);
    }

    if (row) {
      row.classList.toggle('invalid', !isValid);
    }
    return isValid;
  }

  private async handleSubmit(): Promise<void> {
    let isFormValid = true;

    // Validate all standard and optional fields
    if (!this.validateField('card-number')) isFormValid = false;
    if (!this.validateField('card-expiry')) isFormValid = false;
    if (!this.validateField('card-cvc')) isFormValid = false;
    if (!this.validateField('card-name')) isFormValid = false;

    this.getActiveFields().forEach(field => {
      if (!this.validateField(field)) isFormValid = false;
    });

    const errorMsg = this.formEl.querySelector('.validation-error-msg') as HTMLElement;
    if (!isFormValid) {
      if (errorMsg) {
        errorMsg.innerText = 'Please correct the invalid fields above.';
        errorMsg.style.display = 'block';
      }
      return;
    }

    if (errorMsg) {
      errorMsg.style.display = 'none';
    }

    const submitBtn = this.formEl.querySelector('.submit-btn') as HTMLButtonElement;
    const spinner = this.formEl.querySelector('.btn-spinner') as HTMLElement;
    const btnText = this.formEl.querySelector('.btn-text') as HTMLElement;

    // --- PHASE 1: TOKENIZATION ---
    submitBtn.disabled = true;
    spinner.style.display = 'block';
    btnText.innerText = 'Tokenizing card...';

    const numInput = this.formEl.querySelector('.card-number-input') as HTMLInputElement;
    const expInput = this.formEl.querySelector('.card-expiry-input') as HTMLInputElement;
    const cvcInput = this.formEl.querySelector('.card-cvc-input') as HTMLInputElement;
    const nameInput = this.formEl.querySelector('.card-name-input') as HTMLInputElement;

    const cleanExp = expInput.value.replace(/\D/g, '');
    const expMonth = cleanExp.substring(0, 2);
    const expYear = cleanExp.substring(2, 4);

    let cardData: Card | null = {
      number: numInput.value.replace(/\D/g, ''),
      expMonth,
      expYear,
      cvc: cvcInput.value.replace(/\D/g, ''),
      name: nameInput.value.trim()
    };

    // Populate optional fields
    this.getActiveFields().forEach(field => {
      const input = this.formEl.querySelector(`.card-${field}-input`) as HTMLInputElement;
      if (input && cardData) {
        cardData[field] = input.value;
      }
    });

    try {
      const token = await this.options.adapter.tokenize(cardData);
      
      // Dereference Card Data immediately for security
      cardData = null;

      // --- PHASE 2: PROCESSING (BACKEND VERIFICATION) ---
      btnText.innerText = 'Processing Payment...';

      if (this.options.onSubmit) {
        const result = this.options.onSubmit({ token });
        if (result instanceof Promise) {
          await result;
        }
      }

      // --- PHASE 3: SUCCESS STATE ---
      spinner.style.display = 'none';
      submitBtn.classList.add('success');
      btnText.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align: middle; margin-right: 4px;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Payment Success!
      `;

      // Disable form inputs
      const allInputs = this.formEl.querySelectorAll('input, button');
      allInputs.forEach(el => {
        el.setAttribute('disabled', 'true');
      });

      // Display Status Panel
      const statusPanel = this.element.querySelector('.token-status') as HTMLElement;
      const tokenDetail = this.element.querySelector('.token-detail') as HTMLElement;
      if (statusPanel && tokenDetail) {
        statusPanel.style.display = 'flex';
        
        let detailsHtml = `
          <strong>Gateway:</strong> ${this.options.adapter.name}<br>
          <strong>Card Brand:</strong> ${(detectCardBrand(numInput.value) || 'unknown').toUpperCase()}<br>
          <strong>Token ID:</strong> <code>${token.id}</code>
        `;

        this.getActiveFields().forEach(f => {
          const input = this.formEl.querySelector(`.card-${f}-input`) as HTMLInputElement;
          if (input) {
            const meta = FIELD_METADATA[f];
            const labelText = f === 'postalCode' && this.options.preset === 'us' ? 'ZIP Code' : meta.label;
            detailsHtml += `<br><strong>${labelText}:</strong> ${input.value}`;
          }
        });

        tokenDetail.innerHTML = detailsHtml;
        statusPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

    } catch (err: any) {
      // Clean up sensitive variables
      cardData = null;

      // --- ERROR ROLLBACK ---
      spinner.style.display = 'none';
      submitBtn.disabled = false;
      btnText.innerText = this.options.submitButtonText || 'Pay Now';

      if (errorMsg) {
        errorMsg.innerText = err.message || 'Payment processing failed. Please try again.';
        errorMsg.style.display = 'block';

        const listEl = this.formEl.querySelector('.ios-grouped-list') as HTMLElement;
        if (listEl) {
          listEl.animate([
            { transform: 'translateX(0px)' },
            { transform: 'translateX(-6px)' },
            { transform: 'translateX(6px)' },
            { transform: 'translateX(-6px)' },
            { transform: 'translateX(6px)' },
            { transform: 'translateX(0px)' }
          ], {
            duration: 400,
            easing: 'ease-in-out'
          });
        }
      }

      if (this.options.onError) {
        this.options.onError(err);
      }
    }
  }
}
