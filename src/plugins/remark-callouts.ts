import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Transforms :::callout and :::safety container directives into
 * <div class="callout">...</div> and <div class="safety">...</div>
 *
 * Uses raw HTML open/close wrappers to ensure all child content
 * stays inside the div.
 */
const remarkCallouts: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, (node: any, index: number | undefined, parent: any) => {
      if (node.type !== 'containerDirective') return;
      if (index === undefined || !parent) return;
      if (node.name !== 'callout' && node.name !== 'safety') return;

      const className = node.name;

      const replacement: any[] = [
        { type: 'html', value: `<div class="${className}">` },
        ...node.children,
        { type: 'html', value: `</div>` },
      ];

      parent.children.splice(index, 1, ...replacement);
    });
  };
};

export default remarkCallouts;
