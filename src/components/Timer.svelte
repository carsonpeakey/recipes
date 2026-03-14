<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    sectionIds?: string[];
  }

  let { sectionIds = ['cook', 'prep'] }: Props = $props();

  interface TimerState {
    label: string;
    totalSeconds: number;
    remaining: number;
    running: boolean;
    interval: ReturnType<typeof setInterval> | null;
    editing: boolean;
    editValue: string;
  }

  let timers = $state<TimerState[]>([]);

  const TIME_REGEX = /(\d+)\s*(?:-\s*\d+\s*)?(?:minutes?|mins?)\b/gi;

  function parseTimeReferences(text: string): { label: string; seconds: number }[] {
    const results: { label: string; seconds: number }[] = [];
    let match;
    TIME_REGEX.lastIndex = 0;
    while ((match = TIME_REGEX.exec(text)) !== null) {
      const minutes = parseInt(match[1], 10);
      if (minutes > 0 && minutes < 600) {
        results.push({
          label: match[0],
          seconds: minutes * 60,
        });
      }
    }
    return results;
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function startTimer(index: number) {
    const timer = timers[index];
    if (timer.running) return;
    timer.running = true;
    timer.interval = setInterval(() => {
      timer.remaining--;
      if (timer.remaining <= 0) {
        stopTimer(index);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Timer done!', { body: timer.label });
        }
      }
    }, 1000);
  }

  function stopTimer(index: number) {
    const timer = timers[index];
    timer.running = false;
    if (timer.interval) {
      clearInterval(timer.interval);
      timer.interval = null;
    }
  }

  function resetTimer(index: number) {
    stopTimer(index);
    timers[index].remaining = timers[index].totalSeconds;
  }

  function startEditing(index: number) {
    const timer = timers[index];
    if (timer.running) return;
    timer.editing = true;
    timer.editValue = String(Math.round(timer.totalSeconds / 60));
  }

  function commitEdit(index: number) {
    const timer = timers[index];
    const mins = parseFloat(timer.editValue);
    if (!isNaN(mins) && mins > 0 && mins < 600) {
      timer.totalSeconds = Math.round(mins * 60);
      timer.remaining = timer.totalSeconds;
    }
    timer.editing = false;
  }

  function handleEditKey(e: KeyboardEvent, index: number) {
    if (e.key === 'Enter') commitEdit(index);
    if (e.key === 'Escape') timers[index].editing = false;
  }

  onMount(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const found: TimerState[] = [];
    for (const sectionId of sectionIds) {
      const section = document.getElementById(sectionId);
      if (!section) continue;

      const items = section.querySelectorAll('li, p');
      items.forEach((el) => {
        // Skip <p> inside <li> — the <li> already captures its text
        if (el.tagName === 'P' && el.parentElement?.closest('li')) return;
        const text = el.textContent || '';
        const refs = parseTimeReferences(text);
        for (const ref of refs) {
          found.push({
            label: ref.label,
            totalSeconds: ref.seconds,
            remaining: ref.seconds,
            running: false,
            interval: null,
            editing: false,
            editValue: '',
          });
        }
      });
    }
    timers = found;
  });
</script>

{#if timers.length > 0}
  <div class="timer-panel">
    <h4>Timers</h4>
    {#each timers as timer, i}
      <div class="timer-row">
        <span class="timer-label">{timer.label}</span>
        {#if timer.editing}
          <input
            type="text"
            class="timer-edit"
            bind:value={timer.editValue}
            onkeydown={(e) => handleEditKey(e, i)}
            onblur={() => commitEdit(i)}
            autofocus
            aria-label="Minutes"
          />
          <span class="timer-edit-hint">min</span>
        {:else}
          <button class="timer-display" class:timer-done={timer.remaining <= 0} onclick={() => startEditing(i)} title="Click to adjust time">
            {formatTime(timer.remaining)}
          </button>
        {/if}
        {#if !timer.running}
          <button onclick={() => startTimer(i)}>Start</button>
          {#if timer.remaining < timer.totalSeconds}
            <button onclick={() => resetTimer(i)}>Reset</button>
          {/if}
        {:else}
          <button onclick={() => stopTimer(i)}>Stop</button>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .timer-panel {
    position: sticky;
    bottom: 0;
    background: var(--color-black);
    border: 2px solid var(--color-ocean);
    border-radius: 0.5rem;
    padding: 0.75rem;
    margin-top: 1rem;
  }
  .timer-panel h4 {
    margin: 0 0 0.5rem 0;
    font-style: normal;
    text-decoration: none;
  }
  .timer-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  .timer-label {
    flex: 1;
    font-size: 0.875rem;
  }
  .timer-display {
    font-family: monospace;
    font-size: 1.125rem;
    min-width: 4rem;
    text-align: right;
    background: none;
    border: 1px solid transparent;
    color: var(--color-sky);
    cursor: pointer;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
  }
  .timer-display:hover {
    border-color: var(--color-ocean-light);
    background: rgba(224, 251, 252, 0.05);
  }
  .timer-done {
    color: var(--color-hot) !important;
    font-weight: bold;
  }
  .timer-edit {
    font-family: monospace;
    font-size: 1.125rem;
    width: 3.5rem;
    text-align: right;
    background: rgba(224, 251, 252, 0.1);
    border: 1px solid var(--color-ocean-light);
    border-radius: 0.25rem;
    color: var(--color-sky);
    padding: 0.2rem 0.4rem;
  }
  .timer-edit-hint {
    font-size: 0.75rem;
    opacity: 0.6;
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
  @media (max-width: 480px) {
    .timer-row { flex-wrap: wrap; }
  }
  @media print {
    .timer-panel { display: none; }
  }
</style>
