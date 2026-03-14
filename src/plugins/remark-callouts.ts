import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Transforms :::callout and :::safety container directives into
 * <div class="callout">...</div> and <div class="safety">...</div>
 *
 * Replaces the Goldmark {.callout} / {.safety} attribute syntax
 * that has no remark equivalent.
 */
const remarkCallouts: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, (node: any) => {
      if (node.type !== 'containerDirective') return;
      if (node.name !== 'callout' && node.name !== 'safety') return;

      const data = node.data || (node.data = {});
      data.hName = 'div';
      data.hProperties = { class: node.name };
    });
  };
};

export default remarkCallouts;
