import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

/** Wrap <table> elements in a scrollable div for mobile */
export default function rehypeWrapTables() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || index === undefined) return;
      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrapper'] },
        children: [node],
      };
      (parent.children as Element[])[index] = wrapper;
    });
  };
}
