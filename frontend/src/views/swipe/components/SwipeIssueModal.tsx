import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, useModal } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import { Box, Flex, Stack, Text } from '@atlaskit/primitives';

import type { SwipeIssue } from '~contracts/api';
import { cssMap } from '@atlaskit/css';
import Avatar from '@atlaskit/avatar';

type Props = {
  issue: SwipeIssue | null;
  onClose: () => void;
};

const styles = cssMap({
	footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
});

const CustomFooter = () => {
	const { onClose } = useModal();

	return (
		<Box xcss={styles.footer} padding="space.300">
			<Flex alignItems="center" gap="space.100">
				<Text>Hey there!</Text>
			</Flex>
			<Button appearance="primary" onClick={onClose}>
				Close
			</Button>
		</Box>
	);
};

export function SwipeIssueModal({ issue, onClose }: Props) {
  if (!issue) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
        <ModalHeader hasCloseButton>
            <ModalTitle>Custom modal footer</ModalTitle>
        </ModalHeader>
        <ModalBody>
            <p>
                If you wish to customise a modal dialog, it accepts any valid React element as
                children.
            </p>

            <p>
                Modal header accepts any valid React element as children, so you can use modal title
                in conjunction with other elements like an exit button in the top right.
            </p>

            <p>
                Modal footer accepts any valid React element as children. For example, you can add
                an avatar in the footer. For very custom use cases, you can achieve the same thing
                without modal footer.
            </p>
        </ModalBody>
        <CustomFooter />
    </Modal>
  );
}
