import Resolver from '@forge/resolver';
import { getText } from '@backend/application/get-text';
import { GetTextRequestSchema,
  type GetTextResponse,
 } from '@contracts/api';

const resolver = new Resolver();

resolver.define('getText', (req): GetTextResponse => {
  
  GetTextRequestSchema.parse(req.payload);
  return getText();
});

export const handler = resolver.getDefinitions();