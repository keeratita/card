import { describe, it, expect } from 'vitest';
import { OPTIONAL_FIELD_TEXT_EN, CARD_FORM_TEXT_EN } from '../../src/lang/en';

describe('English Language Module', () => {
  describe('OPTIONAL_FIELD_TEXT_EN', () => {
    it('should contain all optional field translations', () => {
      expect(OPTIONAL_FIELD_TEXT_EN).toBeDefined();
      expect(Object.keys(OPTIONAL_FIELD_TEXT_EN)).toHaveLength(8);
    });

    it('should have addressLine1 translations', () => {
      expect(OPTIONAL_FIELD_TEXT_EN.addressLine1.label).toBe('Address');
      expect(OPTIONAL_FIELD_TEXT_EN.addressLine1.placeholder).toBe('Street address');
    });

    it('should have addressLine2 translations', () => {
      expect(OPTIONAL_FIELD_TEXT_EN.addressLine2.label).toBe('Apt, Suite');
      expect(OPTIONAL_FIELD_TEXT_EN.addressLine2.placeholder).toBe('Apt, Suite, Unit (optional)');
    });

    it('should have city translations', () => {
      expect(OPTIONAL_FIELD_TEXT_EN.city.label).toBe('City');
      expect(OPTIONAL_FIELD_TEXT_EN.city.placeholder).toBe('City');
    });

    it('should have state translations', () => {
      expect(OPTIONAL_FIELD_TEXT_EN.state.label).toBe('State');
      expect(OPTIONAL_FIELD_TEXT_EN.state.placeholder).toBe('State or Province');
    });

    it('should have postalCode translations', () => {
      expect(OPTIONAL_FIELD_TEXT_EN.postalCode.label).toBe('Postal Code');
      expect(OPTIONAL_FIELD_TEXT_EN.postalCode.placeholder).toBe('Postal/ZIP Code');
    });

    it('should have country translations', () => {
      expect(OPTIONAL_FIELD_TEXT_EN.country.label).toBe('Country');
      expect(OPTIONAL_FIELD_TEXT_EN.country.placeholder).toBe('Country Code (e.g. US, TH)');
    });

    it('should have phone translations', () => {
      expect(OPTIONAL_FIELD_TEXT_EN.phone.label).toBe('Phone');
      expect(OPTIONAL_FIELD_TEXT_EN.phone.placeholder).toBe('+668 1234 567');
    });

    it('should have email translations', () => {
      expect(OPTIONAL_FIELD_TEXT_EN.email.label).toBe('Email');
      expect(OPTIONAL_FIELD_TEXT_EN.email.placeholder).toBe('name@example.com');
    });
  });

  describe('CARD_FORM_TEXT_EN', () => {
    it('should have submitDefault text', () => {
      expect(CARD_FORM_TEXT_EN.submitDefault).toBe('Pay Now');
    });

    it('should have paymentMethod text', () => {
      expect(CARD_FORM_TEXT_EN.paymentMethod).toBe('Payment Method');
    });

    it('should have cardNumber text', () => {
      expect(CARD_FORM_TEXT_EN.cardNumber).toBe('Card Number');
    });

    it('should have cardNumberPlaceholder text', () => {
      expect(CARD_FORM_TEXT_EN.cardNumberPlaceholder).toBe('•••• •••• •••• ••••');
    });

    it('should have expires text', () => {
      expect(CARD_FORM_TEXT_EN.expires).toBe('Expires');
    });

    it('should have expiryPlaceholder text', () => {
      expect(CARD_FORM_TEXT_EN.expiryPlaceholder).toBe('MM/YY');
    });

    it('should have cvc text', () => {
      expect(CARD_FORM_TEXT_EN.cvc).toBe('CVC');
    });

    it('should have cvcPlaceholder text', () => {
      expect(CARD_FORM_TEXT_EN.cvcPlaceholder).toBe('•••');
    });

    it('should have cardholder text', () => {
      expect(CARD_FORM_TEXT_EN.cardholder).toBe('Cardholder');
    });

    it('should have cardholderPlaceholder text', () => {
      expect(CARD_FORM_TEXT_EN.cardholderPlaceholder).toBe('Full Name');
    });

    it('should have securityCode text', () => {
      expect(CARD_FORM_TEXT_EN.securityCode).toBe('Security Code');
    });

    it('should have cardholderPreviewFallback text', () => {
      expect(CARD_FORM_TEXT_EN.cardholderPreviewFallback).toBe('CARDHOLDER NAME');
    });

    it('should have validationError text', () => {
      expect(CARD_FORM_TEXT_EN.validationError).toBe('Please correct the invalid fields above.');
    });

    it('should have tokenizing text', () => {
      expect(CARD_FORM_TEXT_EN.tokenizing).toBe('Tokenizing card...');
    });

    it('should have processing text', () => {
      expect(CARD_FORM_TEXT_EN.processing).toBe('Processing Payment...');
    });

    it('should have paymentSuccess text', () => {
      expect(CARD_FORM_TEXT_EN.paymentSuccess).toBe('Payment Success!');
    });

    it('should have tokenizedSuccessfully text', () => {
      expect(CARD_FORM_TEXT_EN.tokenizedSuccessfully).toBe('Tokenized Successfully');
    });

    it('should have paymentFailed text', () => {
      expect(CARD_FORM_TEXT_EN.paymentFailed).toBe('Payment processing failed. Please try again.');
    });

    it('should have zipCode text', () => {
      expect(CARD_FORM_TEXT_EN.zipCode).toBe('ZIP Code');
    });

    it('should have zipCodePlaceholder text', () => {
      expect(CARD_FORM_TEXT_EN.zipCodePlaceholder).toBe('12345');
    });

    it('should have gateway text', () => {
      expect(CARD_FORM_TEXT_EN.gateway).toBe('Gateway');
    });

    it('should have cardBrand text', () => {
      expect(CARD_FORM_TEXT_EN.cardBrand).toBe('Card Brand');
    });

    it('should have tokenId text', () => {
      expect(CARD_FORM_TEXT_EN.tokenId).toBe('Token ID');
    });

    it('should have searchCountries text', () => {
      expect(CARD_FORM_TEXT_EN.searchCountries).toBe('Search countries...');
    });
  });
});