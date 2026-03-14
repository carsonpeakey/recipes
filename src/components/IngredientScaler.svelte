<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    slug?: string;
  }

  let { slug = '' }: Props = $props();

  interface Ingredient {
    element: HTMLLIElement;
    originalText: string;
    qty: number | null;
    unit: string;
    name: string;
  }

  let ingredients = $state<Ingredient[]>([]);
  let selectedIndex = $state<number | null>(null);
  let targetQty = $state<string>('');
  let scaleFactor = $state<number>(1);
  let active = $state(false);

  const FRACTION_MAP: Record<string, number> = {
    '¼': 0.25, '½': 0.5, '¾': 0.75,
    '⅓': 1/3, '⅔': 2/3,
    '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
  };

  // Match quantities like: 1, 1/2, 1 1/2, 2.5, ½
  const QTY_REGEX = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+\.?\d*|[¼½¾⅓⅔⅛⅜⅝⅞])\s*/;
  const UNIT_REGEX = /^(C|c|T|t|tsp|tbsp|oz|lb|#|cups?|tablespoons?|teaspoons?|pounds?|ounces?)\b\.?\s*/;

  function parseQty(s: string): number | null {
    // Unicode fractions
    if (FRACTION_MAP[s]) return FRACTION_MAP[s];

    // Mixed number: "1 1/2"
    const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);

    // Simple fraction: "1/2"
    const frac = s.match(/^(\d+)\/(\d+)$/);
    if (frac) {
      const num = parseInt(frac[1]);
      const den = parseInt(frac[2]);
      // Skip things like 16/20 (shrimp sizes)
      if (den > 10) return null;
      return num / den;
    }

    // Decimal or integer
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  function formatQty(n: number): string {
    // Common fractions
    const fracs: [number, string][] = [
      [0.25, '1/4'], [0.5, '1/2'], [0.75, '3/4'],
      [0.333, '1/3'], [0.667, '2/3'],
      [0.125, '1/8'],
    ];
    const whole = Math.floor(n);
    const remainder = n - whole;

    if (remainder < 0.05) return whole.toString();

    for (const [val, str] of fracs) {
      if (Math.abs(remainder - val) < 0.05) {
        return whole > 0 ? `${whole} ${str}` : str;
      }
    }

    return n % 1 === 0 ? n.toString() : n.toFixed(1);
  }

  function parseIngredient(text: string): { qty: number | null; unit: string; name: string } {
    let rest = text.trim();

    const qtyMatch = rest.match(QTY_REGEX);
    if (!qtyMatch) return { qty: null, unit: '', name: rest };

    const qty = parseQty(qtyMatch[1].trim());
    rest = rest.slice(qtyMatch[0].length);

    const unitMatch = rest.match(UNIT_REGEX);
    const unit = unitMatch ? unitMatch[1] : '';
    if (unitMatch) rest = rest.slice(unitMatch[0].length);

    return { qty, unit, name: rest };
  }

  function applyScale() {
    if (selectedIndex === null || !targetQty) return;
    const selected = ingredients[selectedIndex];
    if (!selected.qty) return;

    const target = parseQty(targetQty);
    if (!target) return;

    scaleFactor = target / selected.qty;
    active = true;

    for (const ing of ingredients) {
      if (ing.qty !== null) {
        const scaled = ing.qty * scaleFactor;
        const qtyStr = formatQty(scaled);
        const unitStr = ing.unit ? ` ${ing.unit} ` : ' ';
        ing.element.textContent = `${qtyStr}${unitStr}${ing.name}`;
      }
    }
  }

  function resetScale() {
    scaleFactor = 1;
    active = false;
    targetQty = '';
    selectedIndex = null;
    for (const ing of ingredients) {
      ing.element.textContent = ing.originalText;
    }
  }

  onMount(() => {
    const section = document.getElementById('ingredients');
    if (!section) return;

    const items = section.querySelectorAll('li');
    const parsed: Ingredient[] = [];

    items.forEach((li) => {
      const text = li.textContent || '';
      const { qty, unit, name } = parseIngredient(text);
      parsed.push({ element: li, originalText: text, qty, unit, name });
    });

    ingredients = parsed;
  });
</script>

{#if ingredients.some(i => i.qty !== null)}
  <div class="scaler-panel">
    <details>
      <summary>Scale ingredients</summary>
      <div class="scaler-controls">
        <label>
          Scale by:
          <select bind:value={selectedIndex}>
            <option value={null}>Choose ingredient...</option>
            {#each ingredients as ing, i}
              {#if ing.qty !== null}
                <option value={i}>{ing.originalText.slice(0, 40)}</option>
              {/if}
            {/each}
          </select>
        </label>
        {#if selectedIndex !== null}
          <label>
            Target amount:
            <input type="text" bind:value={targetQty} placeholder="e.g. 2" class="target-input" />
          </label>
          <button onclick={applyScale}>Scale</button>
        {/if}
        {#if active}
          <button onclick={resetScale}>Reset</button>
          <span class="scale-indicator">{scaleFactor.toFixed(2)}x</span>
        {/if}
      </div>
    </details>
  </div>
{/if}

<style>
  .scaler-panel {
    background: var(--color-sky);
    color: var(--color-black);
    border: 2px solid var(--color-ocean-light);
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.5rem;
  }
  summary {
    cursor: pointer;
    font-weight: bold;
    font-size: 0.875rem;
  }
  .scaler-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  select, .target-input {
    padding: 0.35rem 0.4rem;
    border: 1px solid var(--color-ocean);
    border-radius: 0.25rem;
    background: white;
    color: var(--color-black);
    font-size: 0.875rem;
  }
  select { max-width: 100%; }
  .target-input {
    width: 4.5rem;
  }
  button {
    padding: 0.35rem 0.75rem;
    border-radius: 0.25rem;
    background: var(--color-ocean);
    color: var(--color-sky-light);
    border: 1px solid var(--color-ocean-light);
    cursor: pointer;
    font-size: 0.8rem;
  }
  button:hover {
    background: var(--color-ocean-light);
  }
  .scale-indicator {
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--color-ocean);
  }
  @media print {
    .scaler-panel { display: none; }
  }
</style>
