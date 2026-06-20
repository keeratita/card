import { describe, it, expect, vi } from 'vitest';
import { createCardFormGroup, CardFormGroupConfig } from '../../src/angular/form-group';
import { FormControl, FormGroup } from '@angular/forms';

// Mock Angular Forms
vi.mock('@angular/forms', async () => {
  const actual = await vi.importActual('@angular/forms');
  return {
    ...actual,
    FormGroup: class MockFormGroup {
      controls: Record<string, FormControl>;
      constructor(controls: Record<string, FormControl>) {
        this.controls = controls;
      }
      get value() {
        return Object.entries(this.controls).reduce((acc, [key, ctrl]) => {
          acc[key] = ctrl.value;
          return acc;
        }, {} as Record<string, unknown>);
      }
      get valid() {
        return Object.values(this.controls).every(ctrl => ctrl.valid);
      }
      get invalid() {
        return !this.valid;
      }
    },
    FormControl: class MockFormControl {
      value: unknown;
      validators: unknown[];
      constructor(value: unknown = '', validators: unknown[] = []) {
        this.value = value;
        this.validators = validators;
      }
      get valid() {
        return true;
      }
      get invalid() {
        return false;
      }
    },
    Validators: {
      required: { required: true },
      minLength: (min: number) => ({ minLength: min }),
      email: { email: true }
    }
  };
});

describe('Angular Form Group', () => {
  describe('CardFormGroupConfig interface', () => {
    it('should accept empty config', () => {
      const config: CardFormGroupConfig = {};
      expect(config).toBeDefined();
    });

    it('should accept config with preset', () => {
      const config: CardFormGroupConfig = {
        preset: 'billing'
      };
      expect(config.preset).toBe('billing');
    });

    it('should accept config with fields', () => {
      const config: CardFormGroupConfig = {
        fields: ['phone', 'email']
      };
      expect(config.fields).toEqual(['phone', 'email']);
    });

    it('should accept config with both preset and fields', () => {
      const config: CardFormGroupConfig = {
        preset: 'us',
        fields: ['phone']
      };
      expect(config.preset).toBe('us');
      expect(config.fields).toEqual(['phone']);
    });
  });

  describe('createCardFormGroup function', () => {
    it('should create form group with default config', () => {
      const formGroup = createCardFormGroup();
      
      expect(formGroup).toBeDefined();
      expect(formGroup.controls).toBeDefined();
    });

    it('should create form group with core required fields', () => {
      const formGroup = createCardFormGroup();
      
      expect(formGroup.controls.number).toBeDefined();
      expect(formGroup.controls.expiry).toBeDefined();
      expect(formGroup.controls.cvc).toBeDefined();
      expect(formGroup.controls.name).toBeDefined();
    });

    it('should create form group with none preset', () => {
      const formGroup = createCardFormGroup({ preset: 'none' });
      
      const controls = Object.keys(formGroup.controls);
      expect(controls).toEqual(['number', 'expiry', 'cvc', 'name']);
      expect(controls).toHaveLength(4);
    });

    it('should create form group with us preset including postalCode', () => {
      const formGroup = createCardFormGroup({ preset: 'us' });
      
      const controls = Object.keys(formGroup.controls);
      expect(controls).toContain('postalCode');
    });

    it('should create form group with billing preset', () => {
      const formGroup = createCardFormGroup({ preset: 'billing' });
      
      const controls = Object.keys(formGroup.controls);
      expect(controls).toContain('addressLine1');
      expect(controls).toContain('city');
      expect(controls).toContain('state');
      expect(controls).toContain('postalCode');
      expect(controls).toContain('country');
    });

    it('should create form group with contact preset', () => {
      const formGroup = createCardFormGroup({ preset: 'contact' });
      
      const controls = Object.keys(formGroup.controls);
      expect(controls).toContain('email');
      expect(controls).toContain('phone');
    });

    it('should create form group with custom fields', () => {
      const formGroup = createCardFormGroup({ 
        fields: ['phone', 'email'] 
      });
      
      const controls = Object.keys(formGroup.controls);
      expect(controls).toContain('phone');
      expect(controls).toContain('email');
    });

    it('should create form group with merged preset and custom fields', () => {
      const formGroup = createCardFormGroup({ 
        preset: 'us',
        fields: ['phone']
      });
      
      const controls = Object.keys(formGroup.controls);
      expect(controls).toContain('postalCode');
      expect(controls).toContain('phone');
    });

    it('should handle addressLine2 as completely optional', () => {
      const formGroup = createCardFormGroup({ 
        fields: ['addressLine2']
      });
      
      const controls = Object.keys(formGroup.controls);
      expect(controls).toContain('addressLine2');
    });

    it('should create form group with undefined config', () => {
      const formGroup = createCardFormGroup(undefined as CardFormGroupConfig | undefined);
      
      expect(formGroup).toBeDefined();
      expect(formGroup.controls.number).toBeDefined();
    });

    it('should create form group with empty fields array', () => {
      const formGroup = createCardFormGroup({ fields: [] });
      
      const controls = Object.keys(formGroup.controls);
      expect(controls).toEqual(['number', 'expiry', 'cvc', 'name']);
    });

    it('should return FormGroup instance', () => {
      const formGroup = createCardFormGroup();
      
      expect(formGroup instanceof FormGroup).toBe(true);
    });

    it('should create FormControl for number field', () => {
      const formGroup = createCardFormGroup();
      
      expect(formGroup.controls.number instanceof FormControl).toBe(true);
    });

    it('should create FormControl for expiry field', () => {
      const formGroup = createCardFormGroup();
      
      expect(formGroup.controls.expiry instanceof FormControl).toBe(true);
    });

    it('should create FormControl for cvc field', () => {
      const formGroup = createCardFormGroup();
      
      expect(formGroup.controls.cvc instanceof FormControl).toBe(true);
    });

    it('should create FormControl for name field', () => {
      const formGroup = createCardFormGroup();
      
      expect(formGroup.controls.name instanceof FormControl).toBe(true);
    });

    it('should handle all optional field types', () => {
      const formGroup = createCardFormGroup({ 
        fields: ['addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country', 'phone', 'email']
      });
      
      const controls = Object.keys(formGroup.controls);
      expect(controls).toContain('addressLine1');
      expect(controls).toContain('addressLine2');
      expect(controls).toContain('city');
      expect(controls).toContain('state');
      expect(controls).toContain('postalCode');
      expect(controls).toContain('country');
      expect(controls).toContain('phone');
      expect(controls).toContain('email');
    });
  });
});