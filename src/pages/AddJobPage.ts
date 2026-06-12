import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface JobFormData {
  title: string;
  description?: string;
  location?: string;
  state?: string;
  minRange?: string;
  maxRange?: string;
  minExperience?: string;
  maxExperience?: string;
  skills?: string[];
  noOfPositions?: string;
}

export class AddJobPage extends BasePage {
  readonly manualOption: Locator;
  readonly jobTitleInput: Locator;
  readonly primarySkillsInput: Locator;
  readonly cityInput: Locator;
  readonly oorLocationInput: Locator;
  readonly stateSelect: Locator;
  readonly minRangeInput: Locator;
  readonly maxRangeInput: Locator;
  readonly minWorkExpInput: Locator;
  readonly maxWorkExpInput: Locator;
  readonly noOfPositionsInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);

    this.manualOption = page
      .getByRole('menuitem', { name: /manual/i })
      .or(page.locator('button[mat-menu-item]', { hasText: /manual/i }))
      .or(page.locator('[class*="mat-menu-item"], [class*="menu-item"]', { hasText: /manual/i }))
      .first();

    this.jobTitleInput = page
      .locator('mat-form-field')
      .filter({ has: page.locator('mat-label', { hasText: 'Job Title' }) })
      .locator('input').first();

    this.primarySkillsInput = page
      .locator('mat-form-field')
      .filter({ has: page.locator('mat-label', { hasText: 'Primary Skills' }) })
      .locator('input').first();

    this.cityInput = page
      .locator('mat-form-field')
      .filter({ has: page.locator('mat-label', { hasText: 'City' }) })
      .locator('input').first();

    this.oorLocationInput = page
      .locator('mat-form-field')
      .filter({ has: page.locator('mat-label', { hasText: 'OOR Location' }) })
      .locator('input').first();

    this.noOfPositionsInput = page
      .locator('mat-form-field')
      .filter({ has: page.locator('mat-label', { hasText: 'No. Positions' }) })
      .locator('input').first();

    this.stateSelect = page
      .locator('mat-form-field')
      .filter({ has: page.locator('mat-label', { hasText: 'State' }) })
      .locator('mat-select').first();

    const rangeFields = page
      .locator('mat-form-field')
      .filter({ has: page.locator('mat-label', { hasText: 'Range' }) });
    this.minRangeInput = rangeFields.nth(0).locator('input').first();
    this.maxRangeInput = rangeFields.nth(1).locator('input').first();

    const workExpFields = page
      .locator('mat-form-field')
      .filter({ has: page.locator('mat-label', { hasText: 'Work Exp' }) });
    this.minWorkExpInput = workExpFields.nth(0).locator('input').first();
    this.maxWorkExpInput = workExpFields.nth(1).locator('input').first();

    this.saveButton   = page.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.successToast = page.locator('mat-snack-bar-container');
  }

  async selectManual(): Promise<void> {
    await this.waitForElement(this.manualOption);
    await this.click(this.manualOption);
    await this.page.locator('text=Job Details').waitFor({ state: 'visible', timeout: 15_000 });
  }

  private async openSelectAndPick(labelText: string, optionText?: string): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);

    const select = this.page
      .locator('mat-form-field')
      .filter({ has: this.page.locator('mat-label', { hasText: labelText }) })
      .locator('mat-select').first();

    if ((await select.count()) === 0) return;

    await select.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);

    await select.click({ force: true });
    const panel = this.page.locator('.cdk-overlay-pane mat-option');
    const visible = await panel.first().isVisible({ timeout: 2_000 }).catch(() => false);
    if (!visible) await select.evaluate((el: any) => el.click());
    await panel.first().waitFor({ state: 'visible', timeout: 8_000 });

    const realOptions = panel.filter({ hasNotText: /^select$/i });
    let target = optionText
      ? panel.filter({ hasText: optionText }).first()
      : realOptions.first();
    if (optionText && (await target.count()) === 0) target = realOptions.first();
    await target.click();

    await select.evaluate((el: any) => el.blur()).catch(() => {});
    await panel.first()
      .waitFor({ state: 'hidden', timeout: 3_000 })
      .catch(async () => { await this.page.keyboard.press('Escape'); });
    await this.page.waitForTimeout(300);
  }

  async fillJobTitle(title: string): Promise<void> {
    await this.fill(this.jobTitleInput, title);
  }

  async fillLocation(location: string): Promise<void> {
    await this.fill(this.cityInput, location.slice(0, 3));
    await this.page.waitForTimeout(800);
    const cityPanel = this.page.locator('.cdk-overlay-pane mat-option');
    if (await cityPanel.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await cityPanel.first().click();
    } else {
      await this.fill(this.cityInput, location);
      await this.page.waitForTimeout(800);
      if (await cityPanel.first().isVisible({ timeout: 2_000 }).catch(() => false)) {
        await cityPanel.first().click();
      } else {
        await this.page.keyboard.press('Tab');
      }
    }
    if ((await this.oorLocationInput.count()) > 0) {
      await this.fill(this.oorLocationInput, location);
      await this.page.keyboard.press('Tab');
    }
  }

  async selectState(state: string): Promise<void> {
    await this.openSelectAndPick('State', state);
  }

  async fillRange(min: string, max?: string): Promise<void> {
    if ((await this.minRangeInput.count()) > 0) await this.fill(this.minRangeInput, min);
    if (max && (await this.maxRangeInput.count()) > 0) await this.fill(this.maxRangeInput, max);
  }

  async fillExperience(min: string, max?: string): Promise<void> {
    await this.fill(this.minWorkExpInput, min);
    if (max) await this.fill(this.maxWorkExpInput, max);
  }

  async addSkill(skill: string): Promise<void> {
    await this.fill(this.primarySkillsInput, skill);
    await this.page.keyboard.press('Enter');
  }

  async addSkills(skills: string[]): Promise<void> {
    for (const skill of skills) await this.addSkill(skill);
  }

  async fillNoOfPositions(count: string): Promise<void> {
    await this.fill(this.noOfPositionsInput, count);
  }

  private async fillInputByLabel(labelText: string, value: string): Promise<void> {
    const input = this.page
      .locator('mat-form-field')
      .filter({ has: this.page.locator('mat-label', { hasText: labelText }) })
      .locator('input').first();
    if ((await input.count()) === 0) return;
    await input.scrollIntoViewIfNeeded();
    await this.fill(input, value);
    await this.page.keyboard.press('Tab');
  }

  private async fillCustomerAutocomplete(partialName: string): Promise<void> {
    const customerInput = this.page.locator('#autocomplete_client')
      .or(this.page.locator('mat-form-field')
        .filter({ has: this.page.locator('mat-label', { hasText: 'Customer' }) })
        .locator('input'))
      .first();
    if ((await customerInput.count()) === 0) return;
    await customerInput.scrollIntoViewIfNeeded();
    await customerInput.click({ force: true });
    await customerInput.fill(partialName);
    await this.page.waitForTimeout(800);
    const panel = this.page.locator('.cdk-overlay-pane mat-option');
    if (await panel.first().isVisible({ timeout: 3_000 }).catch(() => false))
      await panel.first().click();
    await this.page.keyboard.press('Tab');
  }

  async fillForm(data: JobFormData): Promise<void> {
    await this.fillJobTitle(data.title);
    if (data.minRange) await this.fillRange(data.minRange, data.maxRange);
    if (data.location) await this.fillLocation(data.location);
    if (data.state) await this.selectState(data.state);

    await this.openSelectAndPick('Education Required');
    await this.openSelectAndPick('Priority');

    if (data.minExperience) await this.fillExperience(data.minExperience, data.maxExperience);
    if (data.skills?.length) await this.addSkills(data.skills);
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(200);

    if (data.noOfPositions) await this.fillNoOfPositions(data.noOfPositions);

    await this.fillCustomerAutocomplete('Oorwin');
    await this.fillInputByLabel('Languages Required', 'English');

    await this.openSelectAndPick('Hiring Category');
    await this.openSelectAndPick('Additional Recruiters');
    await this.openSelectAndPick('Recruiters');
    await this.openSelectAndPick('Job Type');
    await this.openSelectAndPick('Job Benefits');
    await this.openSelectAndPick('Industry');

    const onSiteRadio = this.page.locator('mat-radio-button').filter({ hasText: /OnSite|On.?Site/i }).first();
    if ((await onSiteRadio.count()) > 0) {
      await onSiteRadio.scrollIntoViewIfNeeded();
      await onSiteRadio.click({ force: true });
    }

    const genderMaleLabel = this.page
      .locator('mat-radio-button').filter({ hasText: /^Male$/i })
      .locator('label').first();
    if ((await genderMaleLabel.count()) > 0) {
      await genderMaleLabel.scrollIntoViewIfNeeded();
      await genderMaleLabel.click({ force: true });
    }
    await this.page.evaluate(() => {
      const rg = Array.from(document.querySelectorAll('mat-radio-group'))
        .find(g => Array.from(g.querySelectorAll('mat-radio-button'))
          .some(b => (b as HTMLElement).innerText?.trim() === 'Male'));
      if (!rg) return;
      const maleBtn = Array.from(rg.querySelectorAll('mat-radio-button'))
        .find(b => (b as HTMLElement).innerText?.trim() === 'Male') as HTMLElement | undefined;
      if (maleBtn) {
        const input = maleBtn.querySelector('input[type="radio"]') as HTMLInputElement | null;
        if (input) {
          input.checked = true;
          ['click', 'change', 'input'].forEach(type =>
            input.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }))
          );
        }
        maleBtn.click();
      }
    });

    const billRateFields = this.page.locator('mat-form-field')
      .filter({ has: this.page.locator('mat-label', { hasText: 'Bill Rate' }) });
    if ((await billRateFields.count()) >= 2) {
      await billRateFields.nth(0).locator('input').first().scrollIntoViewIfNeeded();
      await this.fill(billRateFields.nth(0).locator('input').first(), '30');
      await this.fill(billRateFields.nth(1).locator('input').first(), '50');
    }
    const payRateFields = this.page.locator('mat-form-field')
      .filter({ has: this.page.locator('mat-label', { hasText: 'Pay Rate' }) });
    if ((await payRateFields.count()) >= 2) {
      await this.fill(payRateFields.nth(0).locator('input').first(), '25');
      await this.fill(payRateFields.nth(1).locator('input').first(), '40');
    }
    await this.fillInputByLabel('Client Contract Period', '12');

    const billRateRef = this.page.locator('mat-form-field')
      .filter({ has: this.page.locator('mat-label', { hasText: 'Bill Rate' }) }).first();
    if ((await billRateRef.count()) > 0) {
      await billRateRef.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
    }
    const btnCoords = await this.page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'addAdd');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    });
    if (btnCoords) {
      await this.page.mouse.click(btnCoords.x, btnCoords.y);
    } else {
      await this.page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.trim() === 'addAdd');
        if (btn) (btn as HTMLElement).click();
      });
    }

    const dialog = this.page.locator('mat-dialog-container, [role="dialog"]').first();
    if (await dialog.isVisible({ timeout: 8_000 }).catch(() => false)) {
      const ti = dialog.locator('input:not([type="checkbox"])');
      await ti.nth(0).fill('30');
      await ti.nth(1).fill('50');
      await ti.nth(2).fill('25');
      await ti.nth(3).fill('40');
      await ti.nth(4).fill('12');
      await ti.nth(5).fill('12').catch(() => {});

      await this.page.locator('mat-dialog-actions').getByRole('button', { name: 'Add' }).click();
      const closed = await dialog.isHidden({ timeout: 3_000 }).catch(() => false);
      if (!closed) {
        await this.page.keyboard.press('Escape');
        await dialog.isHidden({ timeout: 5_000 }).catch(() => {});
      }
      await this.page.waitForTimeout(500);
    }

    if (data.description) {
      const descSection = this.page.locator('text=Recruiter Instructions').first();
      if ((await descSection.count()) > 0) {
        await descSection.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(800);
      }
      await this.fillDescription(data.description);
    }
  }

  async fillDescription(text: string): Promise<void> {
    await this.page.evaluate((content: string) => {
      const win = window as Window & { CKEDITOR?: any };
      if (!win.CKEDITOR) return;
      Object.keys(win.CKEDITOR.instances).forEach(name => {
        const ed = win.CKEDITOR.instances[name];
        ed.setData(content);
        ed.updateElement?.();
        ed.fire?.('change');
        const ta = document.getElementById(name) as HTMLTextAreaElement | null;
        if (ta) {
          ta.value = content;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }, text);

    const ckFrame = this.page.frameLocator('.cke_wysiwyg_frame').first();
    const ckBody = ckFrame.locator('body');
    if ((await ckBody.count()) > 0) {
      await ckBody.click();
      await this.page.keyboard.type(text.slice(0, 150));
      await ckBody.evaluate((el: Element) => (el as HTMLElement).blur());
      await this.page.waitForTimeout(300);
    }
  }

  async saveJob(): Promise<void> {
    await this.click(this.saveButton);
  }

  async waitForSuccessToast(timeout = 15_000): Promise<string> {
    await this.waitForElement(this.successToast, timeout);
    return this.getText(this.successToast);
  }
}
