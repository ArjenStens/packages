import { ReportResults } from '@satellite-earth/core/types/control-api/reports.js';

import Report from '../report';
import Subject from '../subject';

export default class ConversationsReport extends Report<'CONVERSATIONS'> {
	readonly type = 'CONVERSATIONS';

	value = new Subject<ReportResults['CONVERSATIONS'][]>();

	handleResult(response: ReportResults['CONVERSATIONS']): void {
		// remove duplicates
		const next = this.value.value?.filter((r) => r.pubkey !== response.pubkey).concat(response) ?? [response];
		const sorted = next.sort(
			(a, b) => Math.max(b.lastReceived ?? 0, b.lastSent ?? 0) - Math.max(a.lastReceived ?? 0, a.lastSent ?? 0),
		);

		this.value.next(sorted);
	}
}
