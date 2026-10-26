import {
	useBlocker,
	useCanGoBack,
	useLocation,
	useNavigate,
	useParams,
	useRouter,
	useSearch,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
	type CreationSearch,
	getCreationReturnPath,
} from "@/lib/portfolio-creation";
import { useAuth } from "@/providers/auth";

export function useCreationExit(isBusy: boolean) {
	const { user } = useAuth();
	const { locale } = useParams({ strict: false });
	const search = useSearch({ strict: false }) as CreationSearch;
	const location = useLocation();
	const navigate = useNavigate();
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const allowedExit = useRef(false);
	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const prefix = locale ? `/${locale}` : "";
	const fallback = user
		? `${prefix}/user/${encodeURIComponent(user.username)}/portfolio`
		: `${prefix}/`;
	const returnTo = getCreationReturnPath(search.returnTo, fallback);
	useBlocker({
		shouldBlockFn: () => isBusy && !allowedExit.current,
		enableBeforeUnload: false,
	});
	return () => {
		if (!mounted.current) return;
		allowedExit.current = true;
		if (canGoBack && location.state.portfolioCreationFrom === returnTo)
			router.history.back();
		else void navigate({ to: returnTo, replace: true });
	};
}
