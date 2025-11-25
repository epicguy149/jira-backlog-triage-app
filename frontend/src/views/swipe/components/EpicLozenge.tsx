import { Box, Text } from '@atlaskit/primitives';

type ColorPair = {
    bg: string;
    text: string;
};

export const DEFAULT_EPIC_COLOR: ColorPair = {
    bg: '#EED7FC', 
    text: '#803fa5'
};

// TODO: add more mappings
// Note: colour tokens on Jira dont match actual atlaskit design tokens, had to manually map for purple
export const EPIC_COLORS: Record<string, ColorPair> = {
    color_7: { 
        bg: '#EED7FC', 
        text: '#803fa5'
    },
};

export function getEpicColorStyles(colorKey: string | null | undefined): ColorPair {
    if (!colorKey) {
        return DEFAULT_EPIC_COLOR;
    }
    return EPIC_COLORS[colorKey] || DEFAULT_EPIC_COLOR;
}

type Props = {
    text: string;
    colorKey?: string | null;
    className?: string;
};

export const EpicLozenge = ({ text, colorKey }: Props) => {
    const styles = getEpicColorStyles(colorKey);

    return (
        <Box
            // eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop
            style={{ color: styles.bg, borderRadius: '3px', width: 'fit-content', maxWidth: '100%', alignItems: 'center', backgroundColor: styles.bg }}
            paddingBlock='space.025'
            paddingInline='space.050'
        >
            <Text size='small' weight='bold'>
                {/* eslint-disable-next-line @atlaskit/ui-styling-standard/enforce-style-prop */}
                <span style={{ color: styles.text, textTransform: 'uppercase', fontSize: '11px', }}>
                    {text}
                </span>
            </Text>
        </Box>
    );
};