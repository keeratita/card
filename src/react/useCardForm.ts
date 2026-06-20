import { useState, useCallback, useMemo, useRef } from 'react';
import { Card, PaymentGateway, Token } from '../core/domain/card';
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
} from '../core/domain/validation';

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

const OPTIONAL_FIELD_KEYS = [
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'country',
  'phone',
  'email',
] as const;

type OptionalFieldKey = typeof OPTIONAL_FIELD_KEYS[number];

function getOptionalFieldValue(values: CardFormValues, key: OptionalFieldKey): string | undefined {
  return values[key];
}

function setOptionalFieldOnCard(
  card: Card,
  key: OptionalFieldKey,
  value: string
): Card {
  return { ...card, [key]: value };
}

export interface UseCardFormParams {
  adapter: PaymentGateway;
  initialValues?: Partial<CardFormValues>;
  onSubmit?: (data: { token: Token }) => Promise<void> | void;
  onError?: (error: Error) => void;
}

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

  const handleCvcBlur = useCallback(() => {
    setIsFlipped(false);
  }, []);

  const validateField = useCallback((name: string, value: string): boolean => {
    let isValid = true;

    if (name === 'number') {
      const cleanNum = value.replace(/\D/g, '');
      isValid = luhnCheck(cleanNum);
    } else if (name === 'expiry') {
      const cleanExp = value.replace(/\D/g, '');
      if (cleanExp.length !== 4) {
        isValid = false;
      } else {
        isValid = validateExpiry(
          cleanExp.substring(0, 2),
          cleanExp.substring(2, 4),
        );
      }
    } else if (name === 'cvc') {
      const cleanCvc = value.replace(/\D/g, '');
      // Use the ref to get the latest card number
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
      [name]: isValid ? null : `Invalid ${name}`,
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
      const val = getOptionalFieldValue(current, key);
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

    const cleanExp = current.expiry.replace(/\D/g, '');
    const expMonth = cleanExp.substring(0, 2);
    const expYear = cleanExp.substring(2, 4);

    // Build card data with type-safe optional field handling
    let cardData: Card = {
      number: current.number.replace(/\D/g, ''),
      expMonth,
      expYear,
      cvc: current.cvc.replace(/\D/g, ''),
      name: current.name.trim(),
    };

    // Safely copy optional fields
    for (const key of OPTIONAL_FIELD_KEYS) {
      const val = getOptionalFieldValue(current, key);
      if (val) {
        cardData = setOptionalFieldOnCard(cardData, key, val);
      }
    }

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
    handleCvcBlur,
    handleSubmit,
  };
}