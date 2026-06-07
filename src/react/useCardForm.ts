import { useState } from 'react';
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

  const brand = detectCardBrand(values.number);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvc') {
      formattedValue = formatCvc(value, values.number);
    }

    setValues((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  const handleCvcFocus = () => {
    setIsFlipped(true);
  };

  const handleCvcBlur = () => {
    setIsFlipped(false);
  };

  const validateField = (name: string, value: string): boolean => {
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
      isValid = validateCvc(cleanCvc, values.number);
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
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validate standard fields
    const isNumValid = validateField('number', values.number);
    const isExpValid = validateField('expiry', values.expiry);
    const isCvcValid = validateField('cvc', values.cvc);
    const isNameValid = validateField('name', values.name);

    // Validate active optional fields
    let areOptionalValid = true;
    Object.keys(values).forEach((key) => {
      if (
        key !== 'number' &&
        key !== 'expiry' &&
        key !== 'cvc' &&
        key !== 'name'
      ) {
        const val = (values as any)[key] || '';
        const isValid = validateField(key, val);
        if (!isValid) {
          areOptionalValid = false;
        }
      }
    });

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

    const cleanExp = values.expiry.replace(/\D/g, '');
    const expMonth = cleanExp.substring(0, 2);
    const expYear = cleanExp.substring(2, 4);

    let cardData: Card | null = {
      number: values.number.replace(/\D/g, ''),
      expMonth,
      expYear,
      cvc: values.cvc.replace(/\D/g, ''),
      name: values.name.trim(),
    };

    // Populate optional fields
    Object.keys(values).forEach((key) => {
      if (
        key !== 'number' &&
        key !== 'expiry' &&
        key !== 'cvc' &&
        key !== 'name' &&
        cardData
      ) {
        (cardData as any)[key] = (values as any)[key];
      }
    });

    try {
      const token = await params.adapter.tokenize(cardData);

      // Dereference Card Data immediately for security
      cardData = null;

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
    } catch (err: any) {
      cardData = null;
      setIsTokenizing(false);
      setIsProcessing(false);
      setPaymentError(err.message || 'Payment processing failed.');

      if (params.onError) {
        params.onError(err);
      }
    }
  };

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
