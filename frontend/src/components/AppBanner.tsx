import Banner from '@atlaskit/banner';
import WarningIcon from '@atlaskit/icon/core/status-warning';
import ErrorIcon from '@atlaskit/icon/core/status-error';
import StatusInformationIcon from '@atlaskit/icon/core/status-information';
import { useAppContext } from '../app/AppContext';
import Button from '@atlaskit/button/new';
import { IconButton } from '@atlaskit/button/new';
import Tooltip from '@atlaskit/tooltip';
import { Inline, Text } from '@atlaskit/primitives';
import CrossIcon from '@atlaskit/icon/core/cross';
import { token } from '@atlaskit/tokens';
import { useState, useEffect } from 'react';

const icons = {
    warning: <WarningIcon label="Warning" />,
    error: <ErrorIcon label="Error" />,
    announcement: <StatusInformationIcon label="Info" />
} as const;

export default function AppBanner() {
    const { banner, actionHistory, setHistoryActionRequest, setBanner, } = useAppContext();
    const [isUndoLoading, setIsUndoLoading] = useState(false);

    useEffect(() => {
        setIsUndoLoading(false);
    }, [banner]);

    if (!banner) {
        return null;
    }

    let undoItem;

    if (banner.undoHistoryId != null) {
        undoItem = actionHistory.find((it) => it.id === banner.undoHistoryId);
    } else {
        undoItem = undefined;
    }

    // only disable if delete action or non action banner
    const undoDisabled = !undoItem || undoItem.disabled || undoItem.type === 'delete';

    let tooltip;

    if (!undoItem || undoItem.type === 'delete') {
        tooltip = 'Cannot undo delete';
    } else {
        if (undoItem.disabled) {
            tooltip = 'This action has already been undone';
        } else {
            tooltip = 'Undo this action';
        }
    }

    return (
        <Banner appearance={banner.type} icon={icons[banner.type]}>
            <Inline alignBlock="center" spread="space-between" grow="fill" shouldWrap={false} space="space.100">
                <Text>{banner.message}</Text>
                
                <Inline alignBlock="center" space="space.050">
                    {banner.undoHistoryId && (
                        <Tooltip content={tooltip}>
                            <Button
                                appearance="primary"
                                isDisabled={undoDisabled}
                                isLoading={isUndoLoading}
                                onClick={() => {
                                    if (!undoDisabled && undoItem) {
                                        setHistoryActionRequest({ item: undoItem, op: 'undo' });
                                        setIsUndoLoading(true);
                                    }
                                }}
                            >
                                Undo
                            </Button>
                        </Tooltip>
                    )}

                    <IconButton
                        onClick={() => setBanner(null)}
                        icon={(iconProps) => (
                            <CrossIcon {...iconProps} color={token('color.icon.inverse')} />
                        )}
                        label="Close banner"
                        appearance='subtle'
                    />
                </Inline>
            </Inline>
        </Banner>
    )
}