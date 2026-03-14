<script lang="ts">
  import { onMount } from 'svelte';

  interface Section {
    id: string;
    label: string;
  }

  let sections = $state<Section[]>([]);
  let activeId = $state('');

  const LABEL_MAP: Record<string, string> = {
    ingredients: 'Ingr',
    equipment: 'Equip',
    prep: 'Prep',
    cook: 'Cook',
    serve: 'Serve',
    notes: 'Notes',
    references: 'Refs',
    technique: 'Tech',
  };

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onMount(() => {
    const els = document.querySelectorAll('.content-section[id]');
    const found: Section[] = [];
    els.forEach((el) => {
      const id = el.id;
      found.push({ id, label: LABEL_MAP[id] || id });
    });
    sections = found;

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
</script>

{#if sections.length > 1}
  <nav class="section-nav" aria-label="Recipe sections">
    {#each sections as section}
      <button
        class="section-link"
        class:active={activeId === section.id}
        onclick={() => scrollTo(section.id)}
      >
        {section.label}
      </button>
    {/each}
  </nav>
{/if}

<style>
  .section-nav {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem 0;
    background: var(--color-black);
    border-bottom: 1px solid rgba(224, 251, 252, 0.1);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .section-nav::-webkit-scrollbar {
    display: none;
  }
  .section-link {
    padding: 0.4rem 0.7rem;
    border-radius: 1rem;
    background: rgba(61, 90, 128, 0.25);
    color: var(--color-sky-light);
    border: 1px solid rgba(107, 140, 184, 0.2);
    cursor: pointer;
    font-size: 0.8rem;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .section-link:hover {
    background: rgba(61, 90, 128, 0.45);
  }
  .section-link.active {
    background: rgba(238, 108, 77, 0.35);
    border-color: var(--color-hot);
    color: var(--color-sky);
  }
  @media print {
    .section-nav { display: none; }
  }
</style>
