import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmpirePanel } from '../components/ui/EmpirePanel';
import { useGameStore } from '../store/useGameStore';
import { useEmpireStore } from '../store/useEmpireStore';

describe('Vietnamese empire management UI', () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    useGameStore.getState().resetGame();
    container = document.createElement('div'); document.body.append(container);
    root = createRoot(container);
    await act(async () => root.render(<EmpirePanel onClose={() => {}} />));
  });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
  it('shows the illustrated first chapter and hires through the personnel tab', async () => {
    expect(container.textContent).toContain('Một kho nhỏ, một giấc mơ lớn');
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/assets/dai-viet-story.jpg');
    const staffTab = Array.from(container.querySelectorAll('nav button')).find(button => button.textContent === 'Nhân sự') as HTMLButtonElement;
    await act(async () => staffTab.click());
    const hire = Array.from(container.querySelectorAll('.hire-grid button')).find(button => button.textContent?.includes('Kỹ thuật viên')) as HTMLButtonElement;
    await act(async () => hire.click());
    expect(useEmpireStore.getState().employees).toHaveLength(4);
    expect(useGameStore.getState().cash).toBe(42400);
    expect(container.textContent).toContain('4/12 người');
  });
  it('builds the actual sorter from the construction tab', async () => {
    const tab = Array.from(container.querySelectorAll('nav button')).find(button => button.textContent === 'Xây dựng') as HTMLButtonElement;
    await act(async () => tab.click());
    const sorter = Array.from(container.querySelectorAll('.building-card')).find(card => card.textContent?.includes('Dây chuyền phân loại'));
    await act(async () => (sorter!.querySelector('button') as HTMLButtonElement).click());
    expect(useEmpireStore.getState().sorterLevel).toBe(1);
    expect(useGameStore.getState().cash).toBe(33000);
    expect(sorter?.textContent).toContain('Cấp 1/3');
  });
});
