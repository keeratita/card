const BRAND_LOGO_SVGS: Record<string, string> = {
  visa: `<svg viewBox="0 0 24 24"><path fill="#0a84ff" d="M12.8 15.6h1.7l1-6.5h-1.7zm5.5-6.5c-.4-.1-.9-.2-1.4-.2-1.5 0-2.6.8-2.6 1.9 0 .8.8 1.3 1.3 1.6.6.3.8.5.8.7 0 .4-.5.6-1 .6-.6 0-1.1-.2-1.6-.4l-.2-.1-.3 1.8c.5.2 1.4.4 2.2.4 1.6 0 2.6-.8 2.6-2 0-.7-.4-1.2-1.4-1.7-.6-.3-.9-.5-.9-.7 0-.3.3-.5.8-.5.5 0 .9.1 1.2.3l.1.1.3-1.8zM9.5 9.1h-1.6c-.5 0-.9.3-1.1.7L4 15.6h1.8l.4-1h2.2l.2 1H10l-.5-6.5zm-2.7 4.1.8-2.3.5 2.3H6.8zm7.9-4.1h-1.4c-.4 0-.8.2-.9.6l-2.6 5.8h1.8l.4-1h2.2l.2 1H16l-1.3-6.4z"/></svg>`,
  mastercard: `<svg viewBox="0 0 24 24"><circle cx="9" cy="12" r="6" fill="#ff453a" opacity="0.95"/><circle cx="15" cy="12" r="6" fill="#ff9f0a" opacity="0.95"/></svg>`,
  amex: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#0a84ff"/><path fill="#fff" d="M4 17h1.6l.8-2.3h2.3l.8 2.3H11l-2.7-7H7.7L4 17zm3.6-4.2.7-2.1.7 2.1H7.6zm5 4.2h1.5v-4.1l1.8 4.1h1.3l1.8-4.1v4.1h1.5v-7h-1.8l-2.1 4.8-2.1-4.8h-1.8v7z"/></svg>`,
  jcb: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#0b4e9f"/><path fill="#ff453a" d="M4 7h16v10H4z"/><path fill="#fff" d="M7 15h1.5v-4.1l1.8 4.1h1.3l1.8-4.1v4.1H15v-7h-1.8l-2.1 4.8-2.1-4.8H7v7z"/></svg>`,
};

const DEFAULT_CARD_LOGO_SVG = `<svg viewBox="0 0 48 48"><path fill="#8e8e93" d="M37,40H11c-1.65,0-3-1.35-3-3V11c0-1.65,1.35-3,3-3h26c1.65,0,3,1.35,3,3v26C40,38.65,38.65,40,37,40z"/><path fill="#2c2c2e" d="M8,14h32v4H8V14z"/></svg>`;

export function getCardLogoSvg(brand: string): string {
  return BRAND_LOGO_SVGS[brand] || DEFAULT_CARD_LOGO_SVG;
}
