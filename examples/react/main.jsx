import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BasicCardForm } from './src/basic/basic-card-form';
import { CustomFormWithPresets } from './src/forms/custom-form-with-presets';
import { FormWithCustomValidation } from './src/forms/form-with-custom-validation';
import { MultiStepCheckout } from './src/checkout/multi-step-checkout';
import { ModalCheckout } from './src/checkout/modal-checkout';
import { CardFormWithLivePreview } from './src/features/with-card-preview';
import { CardFormWithOmiseAdapter } from './src/adapters/with-omise-adapter';
import { DirectivesDemo } from './src/features/with-directives';
import { DarkThemeCardForm } from './src/themes/dark-theme';
import { CorporateCardForm } from './src/themes/corporate';
import { GradientCardForm } from './src/themes/gradient-theme';
import { MinimalCardForm } from './src/themes/minimal-theme';
import { FlipCardDemo } from './src/features/flip-card-demo';
import { CountryDropdownDemo } from './src/features/country-dropdown-demo';

const examples = {
  basic: BasicCardForm,
  presets: CustomFormWithPresets,
  validation: FormWithCustomValidation,
  multistep: MultiStepCheckout,
  modal: ModalCheckout,
  preview: CardFormWithLivePreview,
  omise: CardFormWithOmiseAdapter,
  directives: DirectivesDemo,
  'dark-theme': DarkThemeCardForm,
  corporate: CorporateCardForm,
  gradient: GradientCardForm,
  minimal: MinimalCardForm,
  'flip-card': FlipCardDemo,
  'country-dropdown': CountryDropdownDemo,
};

const exampleGroups = [
  {
    category: 'Basic',
    items: [
      { id: 'basic', title: 'Basic Card Form', description: 'Quick start with pre-built form group and minimal configuration.' },
    ],
  },
  {
    category: 'Forms',
    items: [
      { id: 'presets', title: 'Form with Presets', description: 'Experiment with billing, contact, and US cardholder presets.' },
      { id: 'directives', title: 'Directives Demo', description: 'Individual directives for custom form layouts.' },
      { id: 'validation', title: 'Custom Validators', description: 'Built-in and custom validation logic for payment forms.' },
    ],
  },
  {
    category: 'Features',
    items: [
      { id: 'preview', title: 'Live Card Preview', description: 'Real-time card preview as users enter details.' },
      { id: 'flip-card', title: 'Flip Card Demo', description: 'Interactive 3D flip card animation with brand detection.' },
      { id: 'country-dropdown', title: 'Country Dropdown', description: 'Searchable country selection with flags and dial codes.' },
    ],
  },
  {
    category: 'Adapters',
    items: [
      { id: 'omise', title: 'Omise Adapter', description: 'Integration with Omise payment gateway.' },
    ],
  },
  {
    category: 'Checkout',
    items: [
      { id: 'multistep', title: 'Multi-Step Checkout', description: 'Complete checkout flow with cart, shipping, and payment.' },
      { id: 'modal', title: 'Modal Checkout', description: 'Payment form inside a modal dialog.' },
    ],
  },
  {
    category: 'Themes',
    items: [
      { id: 'dark-theme', title: 'Dark Theme', description: 'Dark mode support for modern applications.' },
      { id: 'corporate', title: 'Corporate Theme', description: 'Enterprise-style payment form with security indicators.' },
      { id: 'gradient', title: 'Gradient Theme', description: 'Modern gradient background with clean styling.' },
      { id: 'minimal', title: 'Minimal Theme', description: 'Clean design with focus on simplicity.' },
    ],
  },
];

function App() {
  const [currentView, setCurrentView] = useState(() => window.location.hash.slice(1) || 'home');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(window.location.hash.slice(1) || 'home');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update active nav button on hash change
  useEffect(() => {
    const buttons = document.querySelectorAll('.nav button');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.example === currentView);
    });
  }, [currentView]);

  if (currentView === 'home') {
    return (
      <div className="content">
        <div style={{ padding: '16px 0 48px 0' }}>
          <h2 style={{ fontSize: '32px', color: '#24292e', fontWeight: '600', margin: 0, lineHeight: 1.2 }}>
            Card Form Examples
          </h2>
          <p style={{ fontSize: '16px', color: '#586069', margin: '8px 0 0 0', lineHeight: 1.6 }}>
            Explore different ways to integrate the card form library in your React applications.
          </p>
        </div>

        {exampleGroups.map((group) => (
          <div key={group.category} style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#586069',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 12px 0',
            }}>
              {group.category}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {group.items.map((example) => (
                <div
                  key={example.id}
                  onClick={() => (window.location.hash = example.id)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid #e1e4e8',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#24292e', fontWeight: '600' }}>
                    {example.title}
                  </h3>
                  <p style={{ margin: 0, color: '#586069', fontSize: '13px', lineHeight: 1.5 }}>
                    {example.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const ExampleComponent = examples[currentView] || BasicCardForm;

  return (
    <div className="content">
      <div className="content-card">
        <ExampleComponent />
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
