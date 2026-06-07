import { Card, CardFormOptions, OptionalCardField } from '../core/domain/card';
import {
  FIELD_METADATA,
  getFieldDisplayText,
  resolveActiveFields,
} from '../core/domain/optional-fields';
import { getCardLogoSvg } from '../core/domain/card-brand-logos';
import { CARD_FORM_TEXT_EN } from '../lang/en';
import { detectCardBrand } from '../core/domain/brand';
import {
  formatCardNumber,
  formatExpiry,
  formatCvc,
} from '../core/formatters/card-formatter';
import {
  luhnCheck,
  validateExpiry,
  validateCvc,
  validateName,
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateCountry,
  validateGeneric,
} from '../core/domain/validation';
import { escapeHtml } from './internal/security';

export class CardForm {
  private readonly element: HTMLElement;
  private readonly options: CardFormOptions;
  private formEl!: HTMLFormElement;

  constructor(container: HTMLElement | string, options: CardFormOptions) {
    if (typeof container === 'string') {
      const el = document.querySelector(container);
      if (!el) {
        throw new Error(
          `Container element not found for selector: ${container}`,
        );
      }
      this.element = el as HTMLElement;
    } else {
      this.element = container;
    }

    this.options = {
      preset: 'none',
      submitButtonText: CARD_FORM_TEXT_EN.submitDefault,
      ...options,
    };

    if (!this.options.submitButtonText) {
      this.options.submitButtonText = CARD_FORM_TEXT_EN.submitDefault;
    }

    this.render();
  }

  private getActiveFields(): OptionalCardField[] {
    const preset = this.options.preset || 'none';
    const fieldsFromOptions = this.options.fields || [];
    return resolveActiveFields(preset, fieldsFromOptions);
  }

  private render(): void {
    this.element.innerHTML = '';

    const containerWrapper = document.createElement('div');
    containerWrapper.className = 'kg-card-container';

    // Renders the 3D card layout
    const cardLabelText =
      this.options.cardLabel || this.options.adapter.name.toUpperCase();
    const safeCardLabelText = escapeHtml(cardLabelText);
    const safeSubmitButtonText = escapeHtml(
      this.options.submitButtonText || CARD_FORM_TEXT_EN.submitDefault,
    );

    containerWrapper.innerHTML = `
      <div class="card-perspective">
        <div class="card-inner credit-card-element">
          <!-- Front of Card -->
          <div class="card-front">
            <div class="card-header">
              <div class="card-chip"></div>
                <div class="card-type-label card-gateway-label">${safeCardLabelText}</div>
            </div>
            <div class="card-number-display card-num-preview">${escapeHtml(CARD_FORM_TEXT_EN.cardNumberPlaceholder)}</div>
            <div class="card-footer">
              <div class="card-meta-block">
                <span class="card-meta-label">${escapeHtml(CARD_FORM_TEXT_EN.cardholder)}</span>
                <span class="card-meta-value card-holder-preview">${escapeHtml(CARD_FORM_TEXT_EN.cardholderPreviewFallback)}</span>
              </div>
              <div class="card-meta-block">
                <span class="card-meta-label">${escapeHtml(CARD_FORM_TEXT_EN.expires)}</span>
                <span class="card-meta-value card-expiry-preview">${escapeHtml(CARD_FORM_TEXT_EN.expiryPlaceholder)}</span>
              </div>
              <div class="brand-logo card-brand-logo">
                ${getCardLogoSvg('')}
              </div>
            </div>
          </div>

          <!-- Back of Card -->
          <div class="card-back">
            <div class="card-magnetic-strip"></div>
            <div class="card-signature-area">
              <span class="card-meta-label" style="margin-left: 4px;">${escapeHtml(CARD_FORM_TEXT_EN.securityCode)}</span>
              <div class="card-signature-strip">
                <div class="card-cvc-display card-cvc-preview">${escapeHtml(CARD_FORM_TEXT_EN.cvcPlaceholder)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Inputs Group -->
      <div>
        <h3 class="form-section-header">${escapeHtml(CARD_FORM_TEXT_EN.paymentMethod)}</h3>
        <form class="payment-form-el">
          <div class="ios-grouped-list">
            <!-- Card Number Row -->
            <div class="ios-input-row row-number">
              <label class="ios-label" for="card-number">${escapeHtml(CARD_FORM_TEXT_EN.cardNumber)}</label>
              <input 
                type="text" 
                id="card-number"
                class="ios-input card-number-input" 
                placeholder="${escapeHtml(CARD_FORM_TEXT_EN.cardNumberPlaceholder)}"
                inputmode="numeric"
                autocomplete="cc-number"
                required
              >
            </div>

            <!-- Expiry & CVC row wrapper -->
            <div class="ios-input-row-half">
              <div class="ios-input-row row-expiry">
                <label class="ios-label" for="card-expiry" style="width: 55px;">${escapeHtml(CARD_FORM_TEXT_EN.expires)}</label>
                <input 
                  type="text" 
                  id="card-expiry"
                  class="ios-input card-expiry-input" 
                  placeholder="${escapeHtml(CARD_FORM_TEXT_EN.expiryPlaceholder)}"
                  inputmode="numeric"
                  autocomplete="cc-exp"
                  required
                >
              </div>
              
              <div class="ios-input-row row-cvc">
                <label class="ios-label" for="card-cvc" style="width: 50px;">${escapeHtml(CARD_FORM_TEXT_EN.cvc)}</label>
                <input 
                  type="password" 
                  id="card-cvc"
                  class="ios-input card-cvc-input" 
                  placeholder="${escapeHtml(CARD_FORM_TEXT_EN.cvcPlaceholder)}"
                  inputmode="numeric"
                  maxlength="4"
                  autocomplete="cc-csc"
                  required
                >
              </div>
            </div>

            <!-- Anchor point for optional fields. Cardholder Name is last in list. -->
            <div class="ios-input-row row-name">
              <label class="ios-label" for="card-name">${escapeHtml(CARD_FORM_TEXT_EN.cardholder)}</label>
              <input 
                type="text" 
                id="card-name"
                class="ios-input card-name-input" 
                placeholder="${escapeHtml(CARD_FORM_TEXT_EN.cardholderPlaceholder)}"
                autocomplete="cc-name"
                required
              >
            </div>
          </div>
          
          <div class="error-text validation-error-msg">${escapeHtml(CARD_FORM_TEXT_EN.validationError)}</div>

          <button type="submit" class="pay-btn submit-btn" style="margin-top: 28px;">
            <div class="spinner btn-spinner"></div>
            <span class="btn-text">${safeSubmitButtonText}</span>
          </button>
        </form>
      </div>

      <!-- Success tokenized status -->
      <div class="status-panel token-status">
        <div class="status-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          ${escapeHtml(CARD_FORM_TEXT_EN.tokenizedSuccessfully)}
        </div>
        <div class="status-detail token-detail"></div>
      </div>
    `;

    this.element.appendChild(containerWrapper);
    this.formEl = containerWrapper.querySelector(
      '.payment-form-el',
    ) as HTMLFormElement;

    // Inject optional fields dynamically before the Cardholder Name row
    const groupedList = containerWrapper.querySelector(
      '.ios-grouped-list',
    ) as HTMLElement;
    const cardholderRow = containerWrapper.querySelector(
      '.row-name',
    ) as HTMLElement;
    const activeFields = this.getActiveFields();

    activeFields.forEach((field) => {
      const row = this.createDynamicRow(field);
      groupedList.insertBefore(row, cardholderRow);
    });

    this.bindEvents();
  }

  private createDynamicRow(fieldKey: OptionalCardField): HTMLElement {
    const meta = FIELD_METADATA[fieldKey];
    const row = document.createElement('div');
    row.className = `ios-input-row row-${fieldKey}`;

    const { label, placeholder } = getFieldDisplayText(
      fieldKey,
      this.options.preset || 'none',
    );
    const safeLabelText = escapeHtml(label);
    const safePlaceholderText = escapeHtml(placeholder);

    row.innerHTML = `
      <label class="ios-label" for="card-${fieldKey}">${safeLabelText}</label>
      <input 
        type="${meta.type}" 
        id="card-${fieldKey}"
        class="ios-input card-${fieldKey}-input" 
        placeholder="${safePlaceholderText}"
        autocomplete="${meta.autocomplete}"
        required
      >
    `;
    return row;
  }

  private bindEvents(): void {
    const numInput = this.formEl.querySelector(
      '.card-number-input',
    ) as HTMLInputElement;
    const expInput = this.formEl.querySelector(
      '.card-expiry-input',
    ) as HTMLInputElement;
    const cvcInput = this.formEl.querySelector(
      '.card-cvc-input',
    ) as HTMLInputElement;
    const nameInput = this.formEl.querySelector(
      '.card-name-input',
    ) as HTMLInputElement;
    const cardInner = this.element.querySelector(
      '.credit-card-element',
    ) as HTMLElement;

    // Card formatting & previews
    numInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const val = target.value;
      const formatted = formatCardNumber(val);
      target.value = formatted;

      const brand = detectCardBrand(val);
      target.maxLength = brand === 'amex' ? 17 : 19;

      const numPreview = this.element.querySelector(
        '.card-num-preview',
      ) as HTMLElement;
      if (numPreview) {
        numPreview.innerText =
          formatted || CARD_FORM_TEXT_EN.cardNumberPlaceholder;
      }

      const logoContainer = this.element.querySelector(
        '.card-brand-logo',
      ) as HTMLElement;
      if (logoContainer) {
        logoContainer.innerHTML = getCardLogoSvg(brand);
      }

      target.closest('.ios-input-row')?.classList.remove('invalid');
    });

    expInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const formatted = formatExpiry(target.value);
      target.value = formatted;
      target.maxLength = 7;

      const expPreview = this.element.querySelector(
        '.card-expiry-preview',
      ) as HTMLElement;
      if (expPreview) {
        expPreview.innerText = formatted || CARD_FORM_TEXT_EN.expiryPlaceholder;
      }

      target.closest('.ios-input-row')?.classList.remove('invalid');
    });

    cvcInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const formatted = formatCvc(target.value, numInput.value);
      target.value = formatted;

      const cvcPreview = this.element.querySelector(
        '.card-cvc-preview',
      ) as HTMLElement;
      if (cvcPreview) {
        cvcPreview.innerText =
          '•'.repeat(formatted.length) || CARD_FORM_TEXT_EN.cvcPlaceholder;
      }

      target.closest('.ios-input-row')?.classList.remove('invalid');
    });

    nameInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const preview = this.element.querySelector(
        '.card-holder-preview',
      ) as HTMLElement;
      if (preview) {
        preview.innerText =
          target.value.toUpperCase() ||
          CARD_FORM_TEXT_EN.cardholderPreviewFallback;
      }
      target.closest('.ios-input-row')?.classList.remove('invalid');
    });

    // Optional fields listener to clear invalid outline on input
    this.getActiveFields().forEach((field) => {
      const input = this.formEl.querySelector(
        `.card-${field}-input`,
      ) as HTMLInputElement;
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

    this.getActiveFields().forEach((field) => {
      const input = this.formEl.querySelector(
        `.card-${field}-input`,
      ) as HTMLInputElement;
      input?.addEventListener('focus', removeFlip);
    });

    // Single-field validation on blur
    numInput.addEventListener('blur', () => this.validateField('card-number'));
    expInput.addEventListener('blur', () => this.validateField('card-expiry'));
    cvcInput.addEventListener('blur', () => this.validateField('card-cvc'));
    nameInput.addEventListener('blur', () => this.validateField('card-name'));

    this.getActiveFields().forEach((field) => {
      const input = this.formEl.querySelector(
        `.card-${field}-input`,
      ) as HTMLInputElement;
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
    if (
      fieldId === 'card-number' ||
      fieldId === 'card-expiry' ||
      fieldId === 'card-cvc' ||
      fieldId === 'card-name'
    ) {
      el = this.formEl.querySelector(`.${fieldId}-input`) as HTMLInputElement;
    } else {
      el = this.formEl.querySelector(
        `.card-${fieldId}-input`,
      ) as HTMLInputElement;
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
      const numInput = this.formEl.querySelector(
        '.card-number-input',
      ) as HTMLInputElement;
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

    this.getActiveFields().forEach((field) => {
      if (!this.validateField(field)) isFormValid = false;
    });

    const errorMsg = this.formEl.querySelector(
      '.validation-error-msg',
    ) as HTMLElement;
    if (!isFormValid) {
      if (errorMsg) {
        errorMsg.innerText = CARD_FORM_TEXT_EN.validationError;
        errorMsg.style.display = 'block';
      }
      return;
    }

    if (errorMsg) {
      errorMsg.style.display = 'none';
    }

    const submitBtn = this.formEl.querySelector(
      '.submit-btn',
    ) as HTMLButtonElement;
    const spinner = this.formEl.querySelector('.btn-spinner') as HTMLElement;
    const btnText = this.formEl.querySelector('.btn-text') as HTMLElement;

    // --- PHASE 1: TOKENIZATION ---
    submitBtn.disabled = true;
    spinner.style.display = 'block';
    btnText.innerText = CARD_FORM_TEXT_EN.tokenizing;

    const numInput = this.formEl.querySelector(
      '.card-number-input',
    ) as HTMLInputElement;
    const expInput = this.formEl.querySelector(
      '.card-expiry-input',
    ) as HTMLInputElement;
    const cvcInput = this.formEl.querySelector(
      '.card-cvc-input',
    ) as HTMLInputElement;
    const nameInput = this.formEl.querySelector(
      '.card-name-input',
    ) as HTMLInputElement;

    const cleanExp = expInput.value.replace(/\D/g, '');
    const expMonth = cleanExp.substring(0, 2);
    const expYear = cleanExp.substring(2, 4);

    let cardData: Card | null = {
      number: numInput.value.replace(/\D/g, ''),
      expMonth,
      expYear,
      cvc: cvcInput.value.replace(/\D/g, ''),
      name: nameInput.value.trim(),
    };

    // Populate optional fields
    this.getActiveFields().forEach((field) => {
      const input = this.formEl.querySelector(
        `.card-${field}-input`,
      ) as HTMLInputElement;
      if (input && cardData) {
        cardData[field] = input.value;
      }
    });

    try {
      const token = await this.options.adapter.tokenize(cardData);

      // Dereference Card Data immediately for security
      cardData = null;

      // --- PHASE 2: PROCESSING (BACKEND VERIFICATION) ---
      btnText.innerText = CARD_FORM_TEXT_EN.processing;

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
        ${escapeHtml(CARD_FORM_TEXT_EN.paymentSuccess)}
      `;

      // Disable form inputs
      const allInputs = this.formEl.querySelectorAll('input, button');
      allInputs.forEach((el) => {
        el.setAttribute('disabled', 'true');
      });

      // Display Status Panel
      const statusPanel = this.element.querySelector(
        '.token-status',
      ) as HTMLElement;
      const tokenDetail = this.element.querySelector(
        '.token-detail',
      ) as HTMLElement;
      if (statusPanel && tokenDetail) {
        statusPanel.style.display = 'flex';

        let detailsHtml = `
          <strong>${escapeHtml(CARD_FORM_TEXT_EN.gateway)}:</strong> ${escapeHtml(this.options.adapter.name)}<br>
          <strong>${escapeHtml(CARD_FORM_TEXT_EN.cardBrand)}:</strong> ${escapeHtml((detectCardBrand(numInput.value) || 'unknown').toUpperCase())}<br>
          <strong>${escapeHtml(CARD_FORM_TEXT_EN.tokenId)}:</strong> <code>${escapeHtml(token.id)}</code>
        `;

        this.getActiveFields().forEach((f) => {
          const input = this.formEl.querySelector(
            `.card-${f}-input`,
          ) as HTMLInputElement;
          if (input) {
            const { label } = getFieldDisplayText(
              f,
              this.options.preset || 'none',
            );
            detailsHtml += `<br><strong>${escapeHtml(label)}:</strong> ${escapeHtml(input.value)}`;
          }
        });

        tokenDetail.innerHTML = detailsHtml;
        statusPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err: unknown) {
      // Clean up sensitive variables
      cardData = null;

      // --- ERROR ROLLBACK ---
      spinner.style.display = 'none';
      submitBtn.disabled = false;
      btnText.innerText =
        this.options.submitButtonText || CARD_FORM_TEXT_EN.submitDefault;

      if (errorMsg) {
        const errMessage = err instanceof Error ? err.message : '';
        errorMsg.innerText = errMessage || CARD_FORM_TEXT_EN.paymentFailed;
        errorMsg.style.display = 'block';

        const listEl = this.formEl.querySelector(
          '.ios-grouped-list',
        ) as HTMLElement;
        if (listEl) {
          listEl.animate(
            [
              { transform: 'translateX(0px)' },
              { transform: 'translateX(-6px)' },
              { transform: 'translateX(6px)' },
              { transform: 'translateX(-6px)' },
              { transform: 'translateX(6px)' },
              { transform: 'translateX(0px)' },
            ],
            {
              duration: 400,
              easing: 'ease-in-out',
            },
          );
        }
      }

      if (this.options.onError) {
        this.options.onError(err as Error);
      }
    }
  }
}
