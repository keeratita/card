/**
 * Country Dropdown Demo Example
 *
 * This example demonstrates a searchable country dropdown with
 * flag icons and country code display using the library's COUNTRIES data.
 * The card form below uses the core library's CardForm component with
 * built-in validation for all fields including the country field.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { COUNTRIES, type Country, StripeAdapter } from '@keeratita/card';
import { CardForm } from '@keeratita/card/react';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_demo_key',
});

export function CountryDropdownDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = COUNTRIES.filter(c => {
    const query = (countrySearchQuery || searchQuery).toLowerCase();
    if (!query) return true;
    return c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query);
  });

  const selectCountry = useCallback((country: Country) => {
    setSelectedCountry(country);
    setSearchQuery('');
    setCountrySearchQuery('');
    setIsDropdownOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
    setCountrySearchQuery('');
  }, []);

  // Close dropdown on ESC key
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
        setCountrySearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setCountrySearchQuery('');
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>
        Country Dropdown Demo
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 24px 0', fontSize: '15px' }}>
        Interactive country selection with flags and dial codes.
      </p>

      {/* Info Box */}
      <div style={{
        backgroundColor: 'rgba(255,204,0,0.08)',
        border: '1px solid rgba(255,204,0,0.25)',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#ffd60a', fontSize: '14px' }}>
          Using Library's Country Data
        </h4>
        <p style={{ margin: 0, color: 'rgba(255,214,10,0.8)', fontSize: '13px', lineHeight: '1.5' }}>
          This demo uses the <code>COUNTRIES</code> array exported from{' '}
          <code>@keeratita/card</code>. It includes 60+ countries with flags, ISO codes, and dial codes.
        </p>
      </div>

      {/* Search Box */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
          Search Countries
        </h3>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by country name or code..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1.5px solid rgba(255,255,255,0.1)',
              fontSize: '15px',
              boxSizing: 'border-box',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Filtered Country List */}
        {filteredCountries.length > 0 ? (
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)'
          }}>
            {filteredCountries.map((country) => (
              <div
                key={country.code}
                onClick={() => selectCountry(country)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  backgroundColor: selectedCountry?.code === country.code ? 'rgba(10,132,255,0.12)' : 'transparent',
                  borderLeft: selectedCountry?.code === country.code ? '3px solid #0a84ff' : 'none',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedCountry?.code !== country.code) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCountry?.code !== country.code) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>{country.emoji}</span>
                <span style={{ flex: 1, color: '#ffffff', fontSize: '14px' }}>{country.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>{country.code}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', padding: '20px' }}>
            No countries found matching "{searchQuery}"
          </p>
        )}
      </div>

      {/* Selected Country Display */}
      {selectedCountry && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: 'rgba(10,132,255,0.08)',
          border: '1px solid rgba(10,132,255,0.25)',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <span style={{ fontSize: '32px' }}>{selectedCountry.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '16px' }}>{selectedCountry.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>ISO Code: {selectedCountry.code}</div>
          </div>
          {selectedCountry.dialCode && (
            <span style={{
              backgroundColor: '#0a84ff',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {selectedCountry.dialCode}
            </span>
          )}
        </div>
      )}

      {/* Card Form with Country Select - Uses core library CardForm with full validation */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: '24px',
        borderRadius: '16px',
        marginTop: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
          Card Form with Country Select
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 16px 0', fontSize: '13px' }}>
          This form uses the core library's <code>CardForm</code> component with built-in validation for card number (Luhn check), expiry, CVC, cardholder name, and country fields.
        </p>
        <CardForm
          adapter={stripeAdapter}
          preset="contact"
          fields={['country', 'postalCode', 'name']}
          submitButtonText="Pay Securely"
          onSubmit={(data) => {
            console.log('Payment token received:', data.token);
            alert('Payment successful! Token: ' + data.token.id);
          }}
          onError={(error) => {
            console.error('Payment error:', error);
            alert('Payment failed: ' + error.message);
          }}
        />
      </div>
    </div>
  );
}

export default CountryDropdownDemo;
