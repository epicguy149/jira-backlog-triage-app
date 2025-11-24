import { useAppContext } from "../AppContext"
import { Inline, Box } from '@atlaskit/primitives';
import Heading from '@atlaskit/heading';
import Button from '@atlaskit/button/new';
import CrossIcon from '@atlaskit/icon/core/cross';


export default function SettingsPanel() {
    const { setIsSettingsOpen } = useAppContext();

    return (
        <>
            <Box padding="space.200">
                <Heading size="medium">
                    Settings
                </Heading>

                <Button 
                    iconBefore={CrossIcon}
                    appearance="subtle" 
                    onClick={() => setIsSettingsOpen(false)}
                >
                    Close
                </Button>
                {/* to add contents 
                    1. toggle for AI summary
                    2. tinder style view vs card grid
                    3. delete vs non destructive (won't do/resolution)
                */}
            </Box>
        </>
    )
}