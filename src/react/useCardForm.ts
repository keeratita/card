import { useState, useCallback, useMemo, useRef } from 'react';
import { Card, PaymentGateway, Token } from '../core/domain/card';
import { detectCardBrand } from '../core/domain/brand';
import {
  cleanDigits,
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
} from '../core/domain/validation';
import { OPTIONAL_FIELD_KEYS } from '../core/domain/optional-fields';

export interface CardFormValues {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
}


export interface UseCardFormParams {
  adapter: PaymentGateway;
  initialValues?: Partial<CardFormValues>;
  onSubmit?: (data: { token: Token }) => Promise<void> | void;
  onError?: (error: Error) => void;
}

const ERROR_LABELS: Record<string, string> = {
  number: 'Card number',
  expiry: 'Expiry date',
  cvc: 'CVC',
  name: 'Cardholder name',
  email: 'Email',
  phone: 'Phone',
  postalCode: 'Postal code',
  country: 'Country',
};

export function useCardForm(params: UseCardFormParams) {
  const [values, setValues] = useState<CardFormValues>({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    ...params.initialValues,
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // Use a ref to always access the latest card number for CVC formatting
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Memoize brand detection to avoid recomputing on every render
  const brand = useMemo(() => detectCardBrand(values.number), [values.number]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvc') {
      // Use the ref to get the latest card number, avoiding stale closures
      formattedValue = formatCvc(value, valuesRef.current.number);
    }

    setValues((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  }, []);

  const handleCvcFocus = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const validateField = useCallback((name: string, value: string): boolean => {
    let isValid = true;

    if (name === 'number') {
      const cleanNum = cleanDigits(value);
      isValid = luhnCheck(cleanNum);
    } else if (name === 'expiry') {
      const cleanExp = cleanDigits(value);
      if (cleanExp.length !== 4) {
        isValid = false;
      } else {
        isValid = validateExpiry(
          cleanExp.substring(0, 2),
          cleanExp.substring(2, 4),
        );
      }
    } else if (name === 'cvc') {
      const cleanCvc = cleanDigits(value);
      isValid = validateCvc(cleanCvc, valuesRef.current.number);
    } else if (name === 'name') {
      isValid = validateName(value);
    } else if (name === 'email') {
      isValid = validateEmail(value);
    } else if (name === 'phone') {
      isValid = validatePhone(value);
    } else if (name === 'postalCode') {
      isValid = validatePostalCode(value);
    } else if (name === 'country') {
      isValid = validateCountry(value);
    } else {
      isValid = value.trim().length > 0;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: isValid ? null : `Invalid ${ERROR_LABELS[name] || name}.`,
    }));

    return isValid;
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  }, [validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Use ref to access latest values, preventing unstable closure over `values` state
    const current = valuesRef.current;

    // Validate standard fields
    const isNumValid = validateField('number', current.number);
    const isExpValid = validateField('expiry', current.expiry);
    const isCvcValid = validateField('cvc', current.cvc);
    const isNameValid = validateField('name', current.name);

    // Validate active optional fields using type-safe accessors
    let areOptionalValid = true;
    for (const key of OPTIONAL_FIELD_KEYS) {
      const val = current[key];
      if (val) {
        const isValid = validateField(key, val);
        if (!isValid) {
          areOptionalValid = false;
        }
      }
    }

    if (
      !isNumValid ||
      !isExpValid ||
      !isCvcValid ||
      !isNameValid ||
      !areOptionalValid
    ) {
      setPaymentError('Please correct the invalid fields.');
      return;
    }

    setIsTokenizing(true);
    setPaymentError(null);

    const cleanExp = cleanDigits(current.expiry);
    const expMonth = cleanExp.substring(0, 2);
    const expYear = cleanExp.substring(2, 4);

    // Build card data with type-safe optional field handling
    const baseCard: Card = {
      number: cleanDigits(current.number),
      expMonth,
      expYear,
      cvc: cleanDigits(current.cvc),
      name: current.name.trim(),
    };

    // Conditionally spread optional fields into result
    const optionalEntries = OPTIONAL_FIELD_KEYS.map(key => {
      const val = current[key as keyof CardFormValues];
      return val ? { [key]: val } : null;
    }).filter(Boolean);

    const cardData: Card = Object.assign(baseCard, ...optionalEntries);

    try {
      const token = await params.adapter.tokenize(cardData);

      setIsTokenizing(false);
      setIsProcessing(true);

      if (params.onSubmit) {
        const result = params.onSubmit({ token });
        if (result instanceof Promise) {
          await result;
        }
      }

      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err) {
      setIsTokenizing(false);
      setIsProcessing(false);
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed.';
      setPaymentError(errorMessage);

      if (params.onError) {
        params.onError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
    // validateField is stable (no deps), params are passed in
  }, [validateField, params.adapter, params.onSubmit, params.onError]);

  return {
    values,
    brand,
    errors,
    isTokenizing,
    isProcessing,
    isSuccess,
    paymentError,
    isFlipped,
    handleChange,
    handleBlur,
    handleCvcFocus,
    handleSubmit,
  };
}