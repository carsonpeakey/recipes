import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Transforms :::sectionName container directives into:
 * <div id="sectionName" class="content-section">
 *   <h3>SectionName</h3>
 *   <div>...content...</div>
 * </div>
 *
 * Replicates the Hugo shortcode: layouts/shortcodes/section.html
 */
const remarkSections: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, (node: any) => {
      if (node.type !== 'containerDirective') return;

      const name = node.name;

      // Skip callout/safety — handled by remark-callouts
      if (name === 'callout' || name === 'safety') return;

      // Title-case the section name for the heading
      const title = name.charAt(0).toUpperCase() + name.slice(1);

      const data = node.data || (node.data = {});
      data.hName = 'div';
      data.hProperties = {
        id: name.toLowerCase(),
        class: 'content-section',
      };

      // Insert section heading as raw HTML so rehype-slug doesn't add a duplicate ID
      node.children = [
        {
          type: 'html',
          value: `<h3>${title}</h3>`,
        },
        ...node.children,
      ];
    });
  };
};

export default remarkSections;
