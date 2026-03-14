<script lang="ts">
  interface ContentItem {
    title: string;
    summary: string;
    tags: string[];
    slug: string;
    collection: string;
  }

  interface Props {
    items: ContentItem[];
  }

  let { items }: Props = $props();

  let query = $state('');
  let activeTags = $state<Set<string>>(new Set());

  const allTags = $derived(() => {
    const tags = new Set<string>();
    items.forEach(item => item.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  });

  const filtered = $derived(() => {
    return items.filter(item => {
      const q = query.toLowerCase();
      const matchesQuery = !q ||
        item.title.toLowerCase().includes(q) ||
        (item.summary && item.summary.toLowerCase().includes(q));

      const matchesTags = activeTags.size === 0 ||
        item.tags.some(t => activeTags.has(t));

      return matchesQuery && matchesTags;
    });
  });

  function toggleTag(tag: string) {
    const next = new Set(activeTags);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    activeTags = next;
  }
</script>

<div class="search-panel">
  <input
    type="search"
    placeholder="Search recipes..."
    bind:value={query}
    class="search-input"
  />

  {#if allTags().length > 0}
    <div class="tag-chips">
      {#each allTags() as tag}
        <button
          class="tag-chip"
          class:active={activeTags.has(tag)}
          onclick={() => toggleTag(tag)}
        >
          {tag}
        </button>
      {/each}
    </div>
  {/if}
</div>

<div class="results">
  {#each filtered() as item}
    <div class="result-card">
      <h2>
        <a href={`/${item.collection}/${item.slug}/`}>{item.title}</a>
      </h2>
      {#if item.summary}
        <p>{item.summary}</p>
      {/if}
    </div>
  {:else}
    <p class="no-results">No results found.</p>
  {/each}
</div>

<style>
  .search-panel {
    margin-bottom: 1rem;
  }
  .search-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid rgba(224, 251, 252, 0.15);
    border-radius: 0.25rem;
    background: rgba(224, 251, 252, 0.05);
    color: var(--color-sky);
    font-size: 1rem;
    box-sizing: border-box;
  }
  .search-input::placeholder {
    color: var(--color-black-light);
  }
  .tag-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.5rem;
  }
  .tag-chip {
    padding: 0.3rem 0.65rem;
    border-radius: 1rem;
    background: rgba(61, 90, 128, 0.3);
    color: var(--color-sky-light);
    border: 1px solid rgba(107, 140, 184, 0.3);
    cursor: pointer;
    font-size: 0.8rem;
  }
  .tag-chip:hover {
    background: rgba(61, 90, 128, 0.5);
  }
  .tag-chip.active {
    background: rgba(238, 108, 77, 0.4);
    border-color: var(--color-hot);
  }
  .result-card {
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(224, 251, 252, 0.08);
  }
  .result-card h2 {
    margin: 0;
    font-size: 1.125rem;
  }
  .result-card a {
    color: var(--color-lake-light);
  }
  .result-card p {
    margin: 0.25rem 0 0;
    color: var(--color-black-light);
    font-size: 0.875rem;
  }
  .no-results {
    font-style: italic;
    color: var(--color-black-light);
  }
</style>
