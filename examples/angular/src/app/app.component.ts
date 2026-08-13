/**
 * Main App Component - Angular Examples
 *
 * This component serves as the navigation hub for all example components.
 */

import { Component, signal } from '@angular/core';
import { BasicCardFormComponent } from '../components/basic-card-form.component';
import { FormWithPresetsComponent } from '../components/form-with-presets.component';
import { DirectivesDemoComponent } from '../components/directives-demo.component';
import { CustomValidatorsComponent } from '../components/custom-validators.component';
import { MultiStepCheckoutComponent } from '../components/multi-step-checkout.component';
import { CardFormWithOmiseComponent } from '../components/with-omise-adapter.component';
import { CardFormWithLivePreviewComponent } from '../components/with-card-preview.component';
import {
  DarkThemeCardFormComponent,
  CorporateCardFormComponent,
  GradientCardFormComponent,
  MinimalCardFormComponent,
} from '../components/with-custom-styling.component';
import { FlipCardDemoComponent } from '../components/flip-card-demo.component';
import { CountryDropdownDemoComponent } from '../components/country-dropdown-demo.component';

type ExampleView =
  | 'home'
  | 'basic'
  | 'presets'
  | 'directives'
  | 'validators'
  | 'checkout'
  | 'omise'
  | 'preview'
  | 'dark-theme'
  | 'corporate'
  | 'gradient'
  | 'minimal'
  | 'flip-card'
  | 'country-dropdown';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BasicCardFormComponent,
    FormWithPresetsComponent,
    DirectivesDemoComponent,
    CustomValidatorsComponent,
    MultiStepCheckoutComponent,
    CardFormWithOmiseComponent,
    CardFormWithLivePreviewComponent,
    DarkThemeCardFormComponent,
    CorporateCardFormComponent,
    GradientCardFormComponent,
    MinimalCardFormComponent,
    FlipCardDemoComponent,
    CountryDropdownDemoComponent,
  ],
  styles: [
    `
      .container {
        min-height: 100vh;
        display: flex;
        background-color: #050608;
        font-family:
          'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          sans-serif;
      }
      .sidebar {
        width: 220px;
        background-color: rgba(255, 255, 255, 0.02);
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        padding: 24px 16px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      .sidebar-header {
        padding: 0 8px 20px 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 16px;
      }
      .sidebar-header h1 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
      }
      .sidebar-header p {
        margin: 4px 0 0 0;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.55);
      }
      .nav {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .nav-button {
        padding: 8px 12px;
        text-align: left;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.15s ease;
        color: rgba(255, 255, 255, 0.55);
        background-color: transparent;
        white-space: nowrap;
      }
      .nav-button:hover {
        color: #ffffff;
        background-color: rgba(255, 255, 255, 0.04);
      }
      .nav-button.active {
        color: #0a84ff;
        background-color: rgba(10, 132, 255, 0.12);
      }
      .main {
        flex: 1;
        padding: 40px 48px;
        overflow-y: auto;
        background-color: #050608;
      }
      .content {
        max-width: 800px;
      }
      .header {
        padding: 16px 0 48px 0;
      }
      .header h2 {
        font-size: 32px;
        margin-bottom: 16px;
        color: #ffffff;
        font-weight: 600;
        margin: 0;
        line-height: 1.2;
      }
      .header p {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.55);
        margin: 0;
        line-height: 1.6;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
      }
      .card {
        background-color: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      .card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        border-color: rgba(255, 255, 255, 0.16);
      }
      .card h3 {
        margin: 0 0 8px 0;
        font-size: 15px;
        color: #ffffff;
        font-weight: 600;
      }
      .card p {
        margin: 0;
        color: rgba(255, 255, 255, 0.55);
        font-size: 13px;
        line-height: 1.5;
      }
      .content-card {
        background-color: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
        padding: 32px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
    `,
  ],
  template: `
    <div class="container">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1>Card Form</h1>
          <p>Angular Examples</p>
        </div>
        <nav class="nav">
          @for (item of navItems(); track item.id) {
            <button
              class="nav-button"
              [class.active]="currentView() === item.id"
              (click)="currentView.set(item.id)"
            >
              {{ item.label }}
            </button>
          }
        </nav>
      </aside>
      <main class="main">
        @if (currentView() === 'home') {
          <div class="content">
            <div class="header">
              <h2>Card Form Examples</h2>
              <p>
                Explore different ways to integrate the card form library in
                your Angular applications.
              </p>
            </div>
            <div class="grid">
              @for (example of examples(); track example.id) {
                <div class="card" (click)="currentView.set(example.id)">
                  <h3>{{ example.title }}</h3>
                  <p>{{ example.description }}</p>
                </div>
              }
            </div>
          </div>
        }
        @if (currentView() !== 'home') {
          <div class="content-card">
            @if (currentView() === 'basic') {
              <app-basic-card-form />
            }
            @if (currentView() === 'presets') {
              <app-form-with-presets />
            }
            @if (currentView() === 'directives') {
              <app-directives-demo />
            }
            @if (currentView() === 'validators') {
              <app-custom-validators />
            }
            @if (currentView() === 'checkout') {
              <app-multi-step-checkout />
            }
            @if (currentView() === 'omise') {
              <app-card-form-with-omise />
            }
            @if (currentView() === 'preview') {
              <app-card-form-with-live-preview />
            }
            @if (currentView() === 'dark-theme') {
              <app-dark-theme-card-form />
            }
            @if (currentView() === 'corporate') {
              <app-corporate-card-form />
            }
            @if (currentView() === 'gradient') {
              <app-gradient-card-form />
            }
            @if (currentView() === 'minimal') {
              <app-minimal-card-form />
            }
            @if (currentView() === 'flip-card') {
              <app-flip-card-demo />
            }
            @if (currentView() === 'country-dropdown') {
              <app-country-dropdown-demo />
            }
          </div>
        }
      </main>
    </div>
  `,
})
export class AppComponent {
  currentView = signal<ExampleView>('home');

  navItems = signal([
    { id: 'home' as const, label: 'Intro' },
    { id: 'basic' as const, label: 'Basic Form' },
    { id: 'presets' as const, label: 'Presets' },
    { id: 'directives' as const, label: 'Directives' },
    { id: 'validators' as const, label: 'Validators' },
    { id: 'checkout' as const, label: 'Multi-Step' },
    { id: 'preview' as const, label: 'Live Preview' },
    { id: 'omise' as const, label: 'Omise Adapter' },
    { id: 'dark-theme' as const, label: 'Dark Theme' },
    { id: 'corporate' as const, label: 'Corporate' },
    { id: 'gradient' as const, label: 'Gradient' },
    { id: 'minimal' as const, label: 'Minimal' },
    { id: 'flip-card' as const, label: 'Flip Card' },
    { id: 'country-dropdown' as const, label: 'Country Dropdown' },
  ]);

  examples = signal([
    {
      id: 'basic' as const,
      title: 'Basic Card Form',
      description:
        'Quick start with pre-built form group and minimal configuration.',
    },
    {
      id: 'presets' as const,
      title: 'Form with Presets',
      description:
        'Experiment with billing, contact, and US cardholder presets.',
    },
    {
      id: 'directives' as const,
      title: 'Directives Demo',
      description: 'Individual directives for custom form layouts.',
    },
    {
      id: 'validators' as const,
      title: 'Custom Validators',
      description: 'Built-in and custom validation logic for payment forms.',
    },
    {
      id: 'checkout' as const,
      title: 'Multi-Step Checkout',
      description: 'Complete checkout flow with cart, shipping, and payment.',
    },
    {
      id: 'omise' as const,
      title: 'Omise Adapter',
      description: 'Integration with Omise payment gateway.',
    },
    {
      id: 'preview' as const,
      title: 'Live Card Preview',
      description: 'Real-time card preview as users enter details.',
    },
    {
      id: 'dark-theme' as const,
      title: 'Dark Theme',
      description: 'Dark mode support for modern applications.',
    },
    {
      id: 'corporate' as const,
      title: 'Corporate Theme',
      description: 'Enterprise-style payment form with security indicators.',
    },
    {
      id: 'gradient' as const,
      title: 'Gradient Theme',
      description: 'Modern gradient background with clean styling.',
    },
    {
      id: 'minimal' as const,
      title: 'Minimal Theme',
      description: 'Clean design with focus on simplicity.',
    },
    {
      id: 'flip-card' as const,
      title: 'Flip Card Demo',
      description: 'Interactive 3D flip card animation with brand detection.',
    },
    {
      id: 'country-dropdown' as const,
      title: 'Country Dropdown',
      description: 'Searchable country selection with flags and dial codes.',
    },
  ]);
}
