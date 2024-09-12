import { useCallback, useEffect, useState } from 'react';
import personalNode from '../services/personal-node';

const steps = [2, 2, 3, 3, 5, 5, 10, 20, 30, 60];
export default function useReconnectAction() {
	const [tries, setTries] = useState(0);
	const [count, setCount] = useState(steps[0]);
	const [error, setError] = useState<Error>();

	const connect = useCallback(async () => {
		try {
			await personalNode?.connect();
		} catch (error) {
			if (error instanceof Error) setError(error);
			setCount(steps[Math.min(tries, steps.length - 1)]);
			setTries((v) => v + 1);
		}
	}, [setError, setCount, setTries, tries]);

	useEffect(() => {
		const i = setInterval(() => {
			setCount((v) => {
				if (v === 0) return 0;
				if (v === 1) connect();
				return v - 1;
			});
		}, 1000);
		return () => clearInterval(i);
	}, [connect, setCount]);

	return { tries, count, error };
}
