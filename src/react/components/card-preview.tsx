import React, { memo } from 'react';
import { getCardLogoSvg } from '../../core/domain/card-brand-logos';
import { CARD_FORM_TEXT_EN } from '../../lang/en';
import type { CardBrand } from '../../core/domain/brand';

export interface CreditCardPreviewProps {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  brand: CardBrand;
  isFlipped: boolean;
  cardLabel?: string;
}

const CreditCardPreviewMemo = memo(function CreditCardPreview({
  number,
  expiry,
  cvc,
  name,
  brand,
  isFlipped,
  cardLabel,
}: CreditCardPreviewProps) {
  return (
    <div className='card-perspective'>
      <div
        className={`card-inner credit-card-element ${isFlipped ? 'flipped' : ''}`}
      >
        {/* Front of Card */}
        <div className='card-front'>
          <div className='card-header'>
            <div className='card-chip' />
            <div className='card-type-label card-gateway-label'>
              {cardLabel}
            </div>
          </div>
          <div className='card-number-display card-num-preview'>
            {number || CARD_FORM_TEXT_EN.cardNumberPlaceholder}
          </div>
          <div className='card-footer'>
            <div className='card-meta-block'>
              <span className='card-meta-label'>
                {CARD_FORM_TEXT_EN.cardholder}
              </span>
              <span className='card-meta-value card-holder-preview'>
                {name ? name.toUpperCase() : CARD_FORM_TEXT_EN.cardholderPreviewFallback}
              </span>
            </div>
            <div className='card-meta-block'>
              <span className='card-meta-label'>
                {CARD_FORM_TEXT_EN.expires}
              </span>
              <span className='card-meta-value card-expiry-preview'>
                {expiry || CARD_FORM_TEXT_EN.expiryPlaceholder}
              </span>
            </div>
            <div
              className='brand-logo card-brand-logo'
              dangerouslySetInnerHTML={{ __html: getCardLogoSvg(brand) }}
            />
          </div>
        </div>

        {/* Back of Card */}
        <div className='card-back'>
          <div className='card-magnetic-strip' />
          <div className='card-signature-area'>
            <span className='card-meta-label' style={{ marginLeft: '4px' }}>
              {CARD_FORM_TEXT_EN.securityCode}
            </span>
            <div className='card-signature-strip'>
              <div className='card-cvc-display card-cvc-preview'>
                {''.repeat(cvc.length) || CARD_FORM_TEXT_EN.cvcPlaceholder}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const CreditCardPreview = CreditCardPreviewMemo;