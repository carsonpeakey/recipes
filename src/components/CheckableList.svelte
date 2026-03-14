<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    slug: string;
    sectionIds?: string[];
  }

  let { slug, sectionIds = ['ingredients', 'prep', 'cook'] }: Props = $props();

  let mounted = $state(false);

  function storageKey(sectionId: string, index: number): string {
    return `check:${slug}:${sectionId}:${index}`;
  }

  function isChecked(sectionId: string, index: number): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(storageKey(sectionId, index)) === '1';
  }

  function toggleItem(sectionId: string, index: number, li: HTMLLIElement) {
    const key = storageKey(sectionId, index);
    const checked = localStorage.getItem(key) === '1';
    if (checked) {
      localStorage.removeItem(key);
      li.style.opacity = '1';
      li.style.textDecoration = 'none';
    } else {
      localStorage.setItem(key, '1');
      li.style.opacity = '0.5';
      li.style.textDecoration = 'line-through';
    }
  }

  onMount(() => {
    for (const sectionId of sectionIds) {
      const section = document.getElementById(sectionId);
      if (!section) continue;

      const items = section.querySelectorAll('li');
      items.forEach((li, index) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '0.5rem';
        checkbox.style.cursor = 'pointer';
        checkbox.checked = isChecked(sectionId, index);

        if (checkbox.checked) {
          li.style.opacity = '0.5';
          li.style.textDecoration = 'line-through';
        }

        checkbox.addEventListener('change', () => toggleItem(sectionId, index, li));
        li.insertBefore(checkbox, li.firstChild);
        li.style.cursor = 'pointer';
        li.style.listStyleType = 'none';
      });
    }
    mounted = true;
  });
</script>

{#if !mounted}
  <!-- Progressive enhancement: no JS = no checkboxes, content still readable -->
{/if}
