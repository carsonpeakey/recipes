<button onclick={() => window.print()} class="print-btn">
  Print
</button>

<style>
  .print-btn {
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    background: var(--color-ocean);
    color: var(--color-sky-light);
    border: 1px solid var(--color-ocean-light);
    cursor: pointer;
    font-size: 0.875rem;
  }
  .print-btn:hover {
    background: var(--color-ocean-light);
  }
  @media print {
    .print-btn { display: none; }
  }
</style>
