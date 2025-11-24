import Banner from '@atlaskit/banner';
import WarningIcon from '@atlaskit/icon/core/status-warning';
import ErrorIcon from '@atlaskit/icon/core/status-error';
import StatusInformationIcon from '@atlaskit/icon/core/status-information';
import { useAppContext } from '../app/AppContext';

const icons = {
    warning: <WarningIcon label="Warning" />,
    error: <ErrorIcon label="Error" />,
    announcement: <StatusInformationIcon label="Info" />
} as const;

export default function AppBanner() {
    const { banner } = useAppContext();
    if (!banner) {
        return null;
    }

    return (
        <Banner appearance={banner.type} icon={icons[banner.type]}>
            {banner.message}
        </Banner>
    )
}