import api, { route } from "@forge/api";
import { kvs } from '@forge/kvs';

type FieldIds = {
    epicLinkFieldId: string | null;
    storyPointsFieldId: string | null;
}

const STORED_FIELDS_KEY = 'field-ids';

export async function getJiraFields(): Promise<FieldIds> {
    const stored = await kvs.get<FieldIds>(STORED_FIELDS_KEY) as FieldIds | undefined;
    if (stored) {
        return stored;
    }

    const res = await api.asUser().requestJira(route`/rest/api/3/field`);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed retrieving fields ${res.status} ${text}`);
    }

    const fields = (await res.json()) as Array<{
        id: string;
        name: string;
        schema?: { custom?: string };
    }>;

    
    const epicLinkField = fields.find(
        f =>
            f.name === 'Epic Link' ||
            f.schema?.custom === 'com.pyxis.greenhopper.jira:gh-epic-link',
    );

    const storyPointsField = fields.find(
        f =>
            f.name === 'Story points' ||
            f.name === 'Story point estimate',
    );

    const result: FieldIds = {
        epicLinkFieldId: epicLinkField?.id ?? null,
        storyPointsFieldId: storyPointsField?.id ?? null,
    };

    await kvs.set(STORED_FIELDS_KEY, result);
    return result;
}