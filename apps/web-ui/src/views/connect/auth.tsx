import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { EventTemplate, VerifiedEvent } from 'nostr-tools';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
	Button,
	Checkbox,
	Divider,
	Flex,
	FormControl,
	FormLabel,
	Input,
	Text,
	useDisclosure,
	useToast,
} from '@chakra-ui/react';

import personalNode, { setPrivateNodeURL } from '../../services/personal-node';
import Panel from '../../components/dashboard/panel';
import useCurrentAccount from '../../hooks/use-current-account';
import { useSigningContext } from '../../providers/global/signing-provider';
import useSubject from '../../hooks/use-subject';
import accountService from '../../services/account';

export function PersonalNodeAuthPage() {
	const toast = useToast();
	const navigate = useNavigate();
	const account = useCurrentAccount();
	const { requestSignature } = useSigningContext();
	const [search] = useSearchParams();
	const remember = useDisclosure({ defaultIsOpen: true });
	const location = useLocation();

	const { register, handleSubmit, formState } = useForm({
		defaultValues: { auth: search.get('auth') ?? '' },
	});

	const authenticate = async (auth: string | ((evt: EventTemplate) => Promise<VerifiedEvent>)) => {
		if (!personalNode) return;

		try {
			if (!personalNode.connected) await personalNode.connect();
			await personalNode.authenticate(auth);

			navigate(location.state?.back || '/', { replace: true });
		} catch (error) {
			if (error instanceof Error) alert(error.message);
		}
	};

	const authenticateWithNostr = async () => {
		try {
			if (!account) return navigate('/login', { state: { back: location } });

			if (remember.isOpen) localStorage.setItem('personal-node-auth', 'nostr');

			await authenticate((draft) => requestSignature(draft) as Promise<VerifiedEvent>);
		} catch (error) {
			if (error instanceof Error) toast({ status: 'error', description: error.message });
		}
	};

	const submit = handleSubmit(async (values) => {
		if (remember.isOpen) localStorage.setItem('personal-node-auth', values.auth);
		await authenticate(values.auth);
	});

	// automatically send the auth if its set on mount
	useEffect(() => {
		const relay = search.get('relay');
		if (relay) setPrivateNodeURL(relay);
	}, []);

	return (
		<Flex direction="column" alignItems="center" justifyContent="center" h="full">
			<Panel as="form" label="AUTHENTICATE" minW="sm" onSubmit={submit}>
				{formState.isSubmitting ? (
					<Text>Loading...</Text>
				) : (
					<>
						<FormControl>
							<FormLabel htmlFor="auth">Auth Code</FormLabel>
							<Input id="auth" {...register('auth', { required: true })} isRequired autoComplete="off" />
						</FormControl>

						<Flex mt="2" justifyContent="space-between">
							<Checkbox isChecked={remember.isOpen} onChange={remember.onToggle}>
								Remember Me
							</Checkbox>
							<Button type="submit" size="sm" colorScheme="brand">
								Login
							</Button>
						</Flex>
						{account && (
							<>
								<Flex gap="2" alignItems="center" my="2">
									<Divider />
									OR
									<Divider />
								</Flex>
								<Flex gap="2">
									<Button type="button" onClick={authenticateWithNostr} colorScheme="purple" flex={1}>
										Login with Nostr
									</Button>
									{account && (
										<Button
											onClick={() => {
												// logout and navigate to nostr login view
												accountService.logout();
												navigate('/login', { state: { back: location } });
											}}
										>
											Change
										</Button>
									)}
								</Flex>
							</>
						)}
					</>
				)}
			</Panel>
		</Flex>
	);
}

export default function PersonalNodeAuthView() {
	const location = useLocation();
	const authenticated = useSubject(personalNode?.authenticated);

	if (authenticated) {
		return <Navigate to={location.state?.back ?? '/'} replace />;
	}

	return <PersonalNodeAuthPage />;
}
