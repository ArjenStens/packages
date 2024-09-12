import { ReactNode } from 'react';
import { Flex, Heading, Link, Spinner } from '@chakra-ui/react';

import useSubject from '../../../../hooks/use-subject';
import { controlApi } from '../../../../services/personal-node';
import useNetworkOverviewReport from '../../../../hooks/reports/use-network-status-report';
import I2POutboundStatus from './i2p-outbound';
import I2PInboundStatus from './i2p-inbound';

export default function I2PNetworkStatus() {
	const config = useSubject(controlApi?.config);
	const status = useNetworkOverviewReport();

	let content: ReactNode = null;

	if (status === undefined || config === undefined) content = <Spinner />;
	else {
		content = (
			<>
				<I2POutboundStatus />
				<I2PInboundStatus />
			</>
		);
	}

	return (
		<>
			<Flex alignItems="center" gap="2">
				<Heading size="md">I2P</Heading>
				<Link isExternal href="https://geti2p.net/en/" color="GrayText" ml="auto">
					More Info
				</Link>
			</Flex>
			{content}
		</>
	);
}
