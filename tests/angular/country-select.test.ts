import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { CountrySelectComponent } from '../../src/angular/components';
import { COUNTRIES } from '../../src/data/countries';

// JIT test environment for standalone component tests (once per file).
// Note: this environment's JIT does not register signal `input()` bindings
// (template `[value]` bindings and `setInput()` both report the input as
// unknown), so the "selected country" display path is covered at the core
// level instead (`findCountryByCode` in tests/core/form.test.ts).
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

describe('Angular Components - CountrySelectComponent', () => {
  let fixture: ComponentFixture<CountrySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountrySelectComponent],
    }).compileComponents();
  });

  function createComponent(): ComponentFixture<CountrySelectComponent> {
    fixture = TestBed.createComponent(CountrySelectComponent);
    fixture.detectChanges();
    return fixture;
  }

  function openDropdown(): void {
    const trigger = fixture.nativeElement.querySelector(
      '.country-select-trigger',
    ) as HTMLElement;
    trigger.click();
    fixture.detectChanges();
  }

  describe('rendering', () => {
    it('should render the placeholder when no country is selected', () => {
      createComponent();
      const trigger = fixture.nativeElement.querySelector(
        '.country-select-trigger',
      ) as HTMLElement;
      expect(trigger.textContent).toContain('Country Code (e.g. US, TH)');
    });

    it('should expose the country list with a listbox role when open', () => {
      createComponent();
      openDropdown();
      const list = fixture.nativeElement.querySelector(
        '.country-select-list',
      ) as HTMLElement;
      expect(list).not.toBeNull();
      expect(list.getAttribute('role')).toBe('listbox');
    });
  });

  describe('open/close behavior', () => {
    it('should open the dropdown when the trigger is clicked', () => {
      createComponent();
      openDropdown();
      const list = fixture.nativeElement.querySelector(
        '.country-select-list',
      );
      expect(list).not.toBeNull();
    });

    it('should close the dropdown when clicking outside the component', () => {
      createComponent();
      openDropdown();
      document.dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      const list = fixture.nativeElement.querySelector(
        '.country-select-list',
      );
      expect(list).toBeNull();
    });

    it('should close the dropdown on Escape and restore focus to the trigger', () => {
      createComponent();
      openDropdown();
      const trigger = fixture.nativeElement.querySelector(
        '.country-select-trigger',
      ) as HTMLElement;
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      fixture.detectChanges();
      const list = fixture.nativeElement.querySelector(
        '.country-select-list',
      );
      expect(list).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('selection', () => {
    it('should emit the selected country code via countrySelected', () => {
      createComponent();
      const spy = vi.fn();
      const sub = fixture.componentInstance.countrySelected.subscribe(spy);
      openDropdown();
      const firstItem = fixture.nativeElement.querySelector(
        '.country-select-item',
      ) as HTMLElement;
      // Derive the expected code from the rendered row rather than
      // hardcoding the first entry of COUNTRIES.
      const firstCode = firstItem.getAttribute('data-code');
      firstItem.click();
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(firstCode);
      sub.unsubscribe();
    });

    it('should close the dropdown and return focus to the trigger after selecting', () => {
      createComponent();
      openDropdown();
      const trigger = fixture.nativeElement.querySelector(
        '.country-select-trigger',
      ) as HTMLElement;
      const firstItem = fixture.nativeElement.querySelector(
        '.country-select-item',
      ) as HTMLElement;
      firstItem.click();
      fixture.detectChanges();
      const list = fixture.nativeElement.querySelector(
        '.country-select-list',
      );
      expect(list).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('keyboard navigation', () => {
    it('should highlight the first option on ArrowDown and expose it via aria-activedescendant', () => {
      createComponent();
      openDropdown();
      const trigger = fixture.nativeElement.querySelector(
        '.country-select-trigger',
      ) as HTMLElement;
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      const highlighted = fixture.nativeElement.querySelector(
        '.country-select-item.highlighted',
      ) as HTMLElement;
      expect(highlighted).not.toBeNull();
      // The active option is announced from the focused combobox (the search
      // input while open), so the IDREF lives there rather than on the
      // trigger button.
      const search = fixture.nativeElement.querySelector(
        '.country-select-search-input',
      ) as HTMLElement;
      expect(search.getAttribute('role')).toBe('combobox');
      expect(search.getAttribute('aria-activedescendant')).toBe(
        highlighted.id,
      );
    });

    it('should select the filtered highlighted option on Enter', () => {
      createComponent();
      const spy = vi.fn();
      const sub = fixture.componentInstance.countrySelected.subscribe(spy);
      openDropdown();
      const search = fixture.nativeElement.querySelector(
        '.country-select-search-input',
      ) as HTMLInputElement;
      search.value = 'thailan';
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      search.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      search.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      fixture.detectChanges();

      // A regression that resolves the highlight against the unfiltered list
      // emits a different code here.
      expect(spy).toHaveBeenCalledWith('TH');
      sub.unsubscribe();
    });

    it('should type-ahead from the collapsed trigger (open + pre-apply the filter)', () => {
      createComponent();
      const trigger = fixture.nativeElement.querySelector(
        '.country-select-trigger',
      ) as HTMLElement;
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 't', bubbles: true }),
      );
      fixture.detectChanges();

      const list = fixture.nativeElement.querySelector('.country-select-list');
      expect(list).not.toBeNull();
      const search = fixture.nativeElement.querySelector(
        '.country-select-search-input',
      ) as HTMLInputElement;
      expect(search.value).toBe('t');
      const codes = [...fixture.nativeElement.querySelectorAll(
        '.country-select-item',
      )].map((el: HTMLElement) => el.getAttribute('data-code'));
      expect(codes).toContain('TH');
      // Exact-code semantics: "t" matches codes beginning with T, never the
      // "TD" substring inside Chad's name.
      expect(codes).not.toContain('TD');
    });

    it('should announce a no-results state instead of an empty listbox', () => {
      createComponent();
      openDropdown();
      const search = fixture.nativeElement.querySelector(
        '.country-select-search-input',
      ) as HTMLInputElement;
      search.value = 'zzzzz';
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('.country-select-item'),
      ).toBeNull();
      const empty = fixture.nativeElement.querySelector(
        '.country-select-no-results',
      ) as HTMLElement;
      expect(empty?.textContent).toContain('zzzzz');
    });

    it('should keep every rendered row reachable by arrowing through a filter', () => {
      createComponent();
      openDropdown();
      const search = fixture.nativeElement.querySelector(
        '.country-select-search-input',
      ) as HTMLInputElement;
      search.value = 'land';
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const rendered = () =>
        fixture.nativeElement.querySelectorAll('.country-select-item').length;
      const count = rendered();
      expect(count).toBeGreaterThan(1);
      for (let i = 0; i < count; i++) {
        search.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
        );
        fixture.detectChanges();
        expect(
          fixture.nativeElement.querySelector('.country-select-item.highlighted'),
        ).not.toBeNull();
      }
    });
  });

  describe('search', () => {
    it('should filter the list by the search query', () => {
      createComponent();
      openDropdown();
      const searchInput = fixture.nativeElement.querySelector(
        '.country-select-search-input',
      ) as HTMLInputElement;
      searchInput.value = 'Thailand';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll(
        '.country-select-item',
      );
      expect(items.length).toBe(1);
      expect((items[0] as HTMLElement).textContent).toContain('Thailand');
    });

    it('should exclude exact-code-only substring matches (parity with React)', () => {
      createComponent();
      openDropdown();
      const searchInput = fixture.nativeElement.querySelector(
        '.country-select-search-input',
      ) as HTMLInputElement;
      searchInput.value = 't';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      const codes = [...fixture.nativeElement.querySelectorAll(
        '.country-select-item',
      )].map((el: HTMLElement) => el.getAttribute('data-code'));
      expect(codes).toContain('TH');
      expect(codes).not.toContain('TD');
    });
  });

  describe('accessibility wiring', () => {
    it('should associate the label with the trigger and expose combobox semantics', () => {
      createComponent();
      const label = fixture.nativeElement.querySelector(
        '.ios-label',
      ) as HTMLElement;
      const trigger = fixture.nativeElement.querySelector(
        '.country-select-trigger',
      ) as HTMLElement;
      // `for`/`id` pairing plus an explicit aria-labelledby: the trigger is a
      // div[role=combobox], which `label[for]` alone cannot name.
      expect(label.getAttribute('for')).toBe(trigger.id);
      expect(trigger.getAttribute('aria-labelledby')).toBe(label.id);
      expect(trigger.textContent).toContain('Country');
      expect(trigger.getAttribute('role')).toBe('combobox');
      expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      // Country is a required field by default.
      expect(trigger.getAttribute('aria-required')).toBe('true');
      expect(
        fixture.nativeElement.querySelector('.required-star'),
      ).not.toBeNull();
    });

    it('should label the listbox with the trigger and report expansion', () => {
      createComponent();
      openDropdown();
      const list = fixture.nativeElement.querySelector(
        '.country-select-list',
      ) as HTMLElement;
      const trigger = fixture.nativeElement.querySelector(
        '.country-select-trigger',
      ) as HTMLElement;
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(list.getAttribute('aria-labelledby')).toBe(trigger.id);
    });

    it('should namespace ids per instance so two widgets never collide', () => {
      createComponent();
      const firstTriggerId = fixture.nativeElement
        .querySelector('.country-select-trigger')
        .getAttribute('id');

      const second = TestBed.createComponent(CountrySelectComponent);
      second.detectChanges();
      const secondTriggerId = second.nativeElement
        .querySelector('.country-select-trigger')
        .getAttribute('id');

      expect(secondTriggerId).not.toBe(firstTriggerId);
    });

    it('should announce the result count in a live region', () => {
      createComponent();
      openDropdown();
      const status = fixture.nativeElement.querySelector(
        '.country-select-status',
      ) as HTMLElement;
      expect(status?.getAttribute('aria-live')).toBe('polite');
      expect(status?.textContent).toContain(String(COUNTRIES.length));
    });
  });

  describe('positioning', () => {
    // The component measures its own host element, so the stub lives there.
    function stubHostRect(rect: Partial<DOMRect>): void {
      fixture.nativeElement.getBoundingClientRect = () => ({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 300,
        height: 40,
        x: 0,
        y: 0,
        toJSON: () => ({}),
        ...rect,
      }) as DOMRect;
    }

    it('should clamp the dropdown to the bottom of the viewport', () => {
      createComponent();
      stubHostRect({ top: 460, bottom: 500 });
      vi.stubGlobal('innerHeight', 800);
      openDropdown();
      const list = fixture.nativeElement.querySelector(
        '.country-select-list',
      ) as HTMLElement;
      // available = 800 - 500 = 300; minus the 68px search-row offset = 232.
      expect(list.style.maxHeight).toBe('232px');
      vi.unstubAllGlobals();
    });

    it('should keep a usable minimum height instead of collapsing to 0', () => {
      createComponent();
      // Trigger sits at the very bottom of the viewport: the clamp would
      // otherwise produce a negative height and an invisible list.
      stubHostRect({ top: 795, bottom: 800 });
      vi.stubGlobal('innerHeight', 800);
      openDropdown();
      const list = fixture.nativeElement.querySelector(
        '.country-select-list',
      ) as HTMLElement;
      expect(list.style.maxHeight).toBe('96px');
      vi.unstubAllGlobals();
    });

    it('should recompute placement on window resize while open', () => {
      createComponent();
      const rafs: Array<() => void> = [];
      vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
        rafs.push(cb);
        return 1;
      });
      vi.stubGlobal('cancelAnimationFrame', () => undefined);
      stubHostRect({ top: 460, bottom: 500 });
      vi.stubGlobal('innerHeight', 800);
      openDropdown();
      expect(
        fixture.nativeElement.querySelector('.country-select-list').style
          .maxHeight,
      ).toBe('232px');

      vi.stubGlobal('innerHeight', 620);
      window.dispatchEvent(new Event('resize'));
      rafs.forEach((cb) => cb());
      fixture.detectChanges();

      // available = 620 - 500 = 120; minus 68 = 52 -> floored at 96.
      expect(
        fixture.nativeElement.querySelector('.country-select-list').style
          .maxHeight,
      ).toBe('96px');

      vi.unstubAllGlobals();
    });

    it('should scroll the highlighted row into view while arrowing', () => {
      const spy = vi.spyOn(Element.prototype, 'scrollIntoView');
      createComponent();
      openDropdown();
      const trigger = fixture.nativeElement.querySelector(
        '.country-select-trigger',
      ) as HTMLElement;
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
