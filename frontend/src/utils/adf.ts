import { defaultSchema } from '@atlaskit/adf-schema/schema-default';
import { JSONTransformer } from '@atlaskit/editor-json-transformer';
import { MarkdownTransformer } from '@atlaskit/editor-markdown-transformer';

const jsonTransformer = new JSONTransformer();
const markdownTransformer = new MarkdownTransformer(defaultSchema);

// to convert description text to ADF 
export function toAdf(markdown: string) {
    const trimmed = markdown.trim();

    if (!trimmed) {
      return null;
    }

    const doc = markdownTransformer.parse(trimmed);
    return jsonTransformer.encode(doc);
}
