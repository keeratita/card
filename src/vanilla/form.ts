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
  validateField,
  getFieldErrorMessage,
  buildCard,
  getCardNumberMaxLength,
  restoreCaret,
  buildSuccessSummary,
} from '../core/form';
import type { CardFormValuesLike } from '../core/form';
import { isThenable } from '../core/form/is-thenable';
import { escapeHtml } from './internal/security';
import { CountryAutocomplete } from './components/country-autocomplete';

export class CardForm {
  private readonly element: HTMLElement;
  private readonly options: CardFormOptions;
  private readonly activeFields: OptionalCardField[];
  private formEl!: HTMLFormElement;
  private countryAutocomplete: CountryAutocomplete | null = null;
  private isSubmitting = false;
  private listeners: Array<{ el: EventTarget | null; event: string; handler: EventListenerOrEventListenerObject | null }> = [];

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

    this.activeFields = resolveActiveFields(
      this.options.preset || 'none',
      this.options.fields || [],
    );

    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    const containerWrapper = document.createElement('div');
    containerWrapper.className = 'kg-card-container';

    const cardLabelText =
      this.options.cardLabel || this.options.adapter.name.toUpperCase();
    const safeCardLabelText = escapeHtml(cardLabelText);
    const safeSubmitButtonText = escapeHtml(
      this.options.submitButtonText || CARD_FORM_TEXT_EN.submitDefault,
    );

    containerWrapper.innerHTML = `
      <div class="card-perspective">
        <div class="card-inner credit-card-element">
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
        <form class="payment-form-el" novalidate aria-label="Credit card payment form">
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
                aria-required="true"
                aria-invalid="false"
                aria-describedby="card-number-error"
              >
              <span class="field-error" id="card-number-error" role="alert"></span>
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
                  aria-required="true"
                  aria-invalid="false"
                  aria-describedby="card-expiry-error"
                >
                <span class="field-error" id="card-expiry-error" role="alert"></span>
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
                  aria-required="true"
                  aria-invalid="false"
                  aria-describedby="card-cvc-error"
                >
                <span class="field-error" id="card-cvc-error" role="alert"></span>
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
                aria-required="true"
                aria-invalid="false"
                aria-describedby="card-name-error"
              >
              <span class="field-error" id="card-name-error" role="alert"></span>
            </div>
          </div>

          <div class="error-text validation-error-msg" id="form-error-msg" role="alert" aria-live="assertive">${escapeHtml(CARD_FORM_TEXT_EN.validationError)}</div>

          <button type="submit" class="pay-btn submit-btn" style="margin-top: 28px;" aria-label="Submit payment">
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

    this.activeFields.forEach((field) => {
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

    if (fieldKey === 'country') {
      const container = document.createElement('div');
      container.className = 'country-autocomplete-container';
      container.id = `card-${fieldKey}-container`;

      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.className = 'country-value-input';
      hiddenInput.name = 'card-country';
      hiddenInput.required = true;

      // Set innerHTML first, then append children — otherwise the innerHTML
      // assignment wipes out any previously appended nodes.
      row.innerHTML = `
        <label class="ios-label" for="card-${fieldKey}">${safeLabelText}</label>
        <span class="field-error" id="card-${fieldKey}-error" role="alert"></span>
      `;
      row.appendChild(hiddenInput);
      row.appendChild(container);

      this.countryAutocomplete = new CountryAutocomplete({
        container: container,
        placeholder: placeholder,
        searchPlaceholder: CARD_FORM_TEXT_EN.searchCountries,
        onSelect: (countryCode: string, _country) => {
          hiddenInput.value = countryCode;
          row.classList.remove('invalid');
        }
      });

      // Associate the visible autocomplete input with the label's `for` attribute.
      const autocompleteInput = container.querySelector(
        '.autocomplete-input',
      ) as HTMLInputElement | null;
      if (autocompleteInput) {
        autocompleteInput.id = `card-${fieldKey}`;
      }

      return row;
    }

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
        aria-required="true"
        aria-invalid="false"
        aria-describedby="card-${fieldKey}-error"
      >
      <span class="field-error" id="card-${fieldKey}-error" role="alert"></span>
    `;
    return row;
  }

  private on(
    el: EventTarget | null,
    event: string,
    handler: EventListener,
  ): void {
    if (el) {
      el.addEventListener(event, handler);
      this.listeners.push({ el, event, handler });
    }
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

    this.on(numInput, 'input', (e) => {
      const target = e.target as HTMLInputElement;
      const selectionStart = target.selectionStart;
      const val = target.value;
      const formatted = formatCardNumber(val);
      target.value = formatted;
      restoreCaret(target, formatted, selectionStart);

      const brand = detectCardBrand(val);
      target.maxLength = getCardNumberMaxLength(val);

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

    this.on(expInput, 'input', (e) => {
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

    this.on(cvcInput, 'input', (e) => {
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

    this.on(nameInput, 'input', (e) => {
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

    this.activeFields.forEach((field) => {
      const input = this.formEl.querySelector(
        `.card-${field}-input`,
      ) as HTMLInputElement;
      this.on(input, 'input', () => {
        input.closest('.ios-input-row')?.classList.remove('invalid');
      });
    });

    this.on(cvcInput, 'focus', () => {
      cardInner.classList.add('flipped');
    });
    this.on(cvcInput, 'blur', () => {
      cardInner.classList.remove('flipped');
    });

    const removeFlip = () => cardInner.classList.remove('flipped');
    this.on(numInput, 'focus', removeFlip);
    this.on(expInput, 'focus', removeFlip);
    this.on(nameInput, 'focus', removeFlip);

    this.activeFields.forEach((field) => {
      const input = this.formEl.querySelector(
        `.card-${field}-input`,
      ) as HTMLInputElement;
      this.on(input, 'focus', removeFlip);
    });

    this.on(numInput, 'blur', () => this.validateField('card-number'));
    this.on(expInput, 'blur', () => this.validateField('card-expiry'));
    this.on(cvcInput, 'blur', () => this.validateField('card-cvc'));
    this.on(nameInput, 'blur', () => this.validateField('card-name'));

    this.activeFields.forEach((field) => {
      const input = this.formEl.querySelector(
        `.card-${field}-input`,
      ) as HTMLInputElement;
      this.on(input, 'blur', () => this.validateField(field));
    });

    this.on(this.formEl, 'submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  private validateField(fieldId: string): boolean {
    let el: HTMLInputElement | null;
    if (fieldId === 'country') {
      el = this.formEl.querySelector(
        '.country-value-input',
      ) as HTMLInputElement;
    } else if (
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
    const val = el.value;

    const fieldName = this.toCoreFieldName(fieldId);
    const numInput = this.formEl.querySelector(
      '.card-number-input',
    ) as HTMLInputElement;
    const { isValid } = validateField(fieldName, val, {
      cardNumber: numInput?.value,
    });

    if (row) {
      row.classList.toggle('invalid', !isValid);
    }
    el.setAttribute('aria-invalid', String(!isValid));

    const errorEl = this.formEl.querySelector(
      `#${fieldId}-error`,
    ) as HTMLElement | null;
    if (errorEl) {
      errorEl.textContent = isValid ? '' : getFieldErrorMessage(fieldName);
    }

    return isValid;
  }

  private toCoreFieldName(fieldId: string): string {
    switch (fieldId) {
      case 'card-number':
        return 'number';
      case 'card-expiry':
        return 'expiry';
      case 'card-cvc':
        return 'cvc';
      case 'card-name':
        return 'name';
      default:
        return fieldId;
    }
  }

  private async handleSubmit(): Promise<void> {
    // Ignore re-entrant submits (Enter key / double-click) while a tokenize
    // request is in flight, preventing duplicate charges.
    if (this.isSubmitting) return;

    let isFormValid = true;

    if (!this.validateField('card-number')) isFormValid = false;
    if (!this.validateField('card-expiry')) isFormValid = false;
    if (!this.validateField('card-cvc')) isFormValid = false;
    if (!this.validateField('card-name')) isFormValid = false;

    this.activeFields.forEach((field) => {
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
      // Per the documented contract, onError fires for client-side
      // validation failures as well as gateway/network failures
      if (this.options.onError) {
        this.options.onError(new Error(CARD_FORM_TEXT_EN.validationError));
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

    this.isSubmitting = true;
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

    const values: CardFormValuesLike = {
      number: numInput.value,
      expiry: expInput.value,
      cvc: cvcInput.value,
      name: nameInput.value,
    };

    this.activeFields.forEach((field) => {
      if (field === 'country') {
        const hiddenInput = this.formEl.querySelector(
          '.country-value-input',
        ) as HTMLInputElement;
        values.country = hiddenInput?.value || '';
        return;
      }
      const input = this.formEl.querySelector(
        `.card-${field}-input`,
      ) as HTMLInputElement;
      if (input) {
        values[field] = input.value;
      }
    });

    const cardData: Card = buildCard(values, this.activeFields);

    try {
      const token = await this.options.adapter.tokenize(cardData);

      btnText.innerText = CARD_FORM_TEXT_EN.processing;

      if (this.options.onSubmit) {
        const result = this.options.onSubmit({ token });
        // Await thenables (incl. cross-realm promises) so the double-loading
        // lifecycle waits for the host backend
        if (isThenable(result)) {
          await result;
        }
      }

      spinner.style.display = 'none';
      submitBtn.classList.add('success');
      btnText.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align: middle; margin-right: 4px;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ${escapeHtml(CARD_FORM_TEXT_EN.paymentSuccess)}
      `;

      const fullNumber = numInput.value.replace(/\D/g, '');
      const lastFour = fullNumber.slice(-4);
      numInput.value = `•••• •••• •••• ${lastFour || ''}`;
      numInput.setAttribute('readonly', 'true');

      // Dereference the CVC (and keep expiry non-sensitive) after success,
      // mirroring the React binding's cleanup.
      cvcInput.value = '';

      const allInputs = this.formEl.querySelectorAll('input, button');
      allInputs.forEach((el) => {
        el.setAttribute('disabled', 'true');
      });

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
          <strong>${escapeHtml(CARD_FORM_TEXT_EN.cardBrand)}:</strong> ${escapeHtml((detectCardBrand(fullNumber) || 'unknown').toUpperCase())}<br>
          <strong>${escapeHtml(CARD_FORM_TEXT_EN.tokenId)}:</strong> <code>${escapeHtml(token.id)}</code>
        `;

        const summary = buildSuccessSummary(
          this.activeFields,
          (f) => {
            const input =
              f === 'country'
                ? (this.formEl.querySelector(
                    '.country-value-input',
                  ) as HTMLInputElement)
                : (this.formEl.querySelector(
                    `.card-${f}-input`,
                  ) as HTMLInputElement);
            return input?.value || '';
          },
          this.options.preset || 'none',
        );

        summary.forEach((item) => {
          detailsHtml += `<br><strong>${escapeHtml(item.label)}:</strong> ${item.value}`;
        });

        tokenDetail.innerHTML = detailsHtml;
        statusPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      this.isSubmitting = false;
    } catch (err: unknown) {
      this.isSubmitting = false;
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

  /**
   * Remove all event listeners and clean up the form instance.
   * Call this when the form is no longer needed to prevent memory leaks.
   */
  public destroy(): void {
    for (const { el, event, handler } of this.listeners) {
      el?.removeEventListener(event, handler);
    }
    this.listeners = [];

    if (this.countryAutocomplete) {
      this.countryAutocomplete.destroy();
      this.countryAutocomplete = null;
    }

    this.element.innerHTML = '';
  }
}
