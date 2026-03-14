import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Transforms container directives into HTML wrappers.
 *
 * Two passes (inner-first):
 *   1. :::callout / :::safety → <div class="callout|safety">...</div>
 *   2. :::sectionName → <div id="name" class="content-section"><h3>Name</h3>...</div>
 */
const remarkSections: Plugin<[], Root> = () => {
  return (tree: Root) => {
    // Pass 1: callouts and safety (innermost directives)
    spliceDirectives(tree, (name) => name === 'callout' || name === 'safety', (name) => [
      { type: 'html', value: `<div class="${name}">` },
    ]);

    // Pass 2: sections (everything else)
    spliceDirectives(tree, (name) => name !== 'callout' && name !== 'safety', (name) => {
      const title = name.charAt(0).toUpperCase() + name.slice(1);
      return [
        { type: 'html', value: `<div id="${name.toLowerCase()}" class="content-section">` },
        { type: 'html', value: `<h3>${title}</h3>` },
      ];
    });
  };
};

function spliceDirectives(
  tree: Root,
  match: (name: string) => boolean,
  makeOpener: (name: string) => any[],
) {
  // Collect transforms, apply in reverse
  const transforms: { parent: any; index: number; replacement: any[] }[] = [];

  visit(tree, 'containerDirective', (node: any, index: number | undefined, parent: any) => {
    if (index === undefined || !parent) return;
    if (!match(node.name)) return;

    transforms.push({
      parent,
      index,
      replacement: [
        ...makeOpener(node.name),
        ...node.children,
        { type: 'html', value: `</div>` },
      ],
    });
  });

  // Group by parent, apply in reverse index order
  const byParent = new Map<any, typeof transforms>();
  for (const t of transforms) {
    const group = byParent.get(t.parent) || [];
    group.push(t);
    byParent.set(t.parent, group);
  }

  for (const group of byParent.values()) {
    group.sort((a, b) => b.index - a.index);
    for (const { parent, index, replacement } of group) {
      parent.children.splice(index, 1, ...replacement);
    }
  }
}

export default remarkSections;
