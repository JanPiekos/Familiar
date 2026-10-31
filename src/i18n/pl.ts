import type en from "./en";

const pl = {
	error_preview: {
		title: "Podgląd stron błędów",
		description: "Wybierz przykład, aby zobaczyć stronę błędu.",
		type: "Rodzaj błędu",
		hint: "To symulowane przykłady. Ponawianie nie wysyła żądania do serwera.",
		retried:
			"Podgląd zakończony. Prawdziwa strona błędu ponownie wczytałaby treść.",
	},
	error_pages: {
		status: "Błąd {{status}}",
		connection: "Problem z połączeniem",
		page_update: "Aktualizacja strony",
		unexpected: "Nieoczekiwany błąd",
		retry: "Spróbuj ponownie",
		retrying: "Ponawianie…",
		reload: "Odśwież stronę",
		home: "Strona główna",
		back: "Wróć",
		sign_in: "Zaloguj się",
		not_found: {
			title: "Nie udało się znaleźć tej strony",
			description:
				"Link może być nieprawidłowy albo strona została przeniesiona lub usunięta.",
			hint: "Sprawdź adres lub wróć na stronę główną, aby znaleźć to, czego szukasz.",
		},
		unauthorized: {
			title: "Zaloguj się, aby kontynuować",
			description:
				"Twoja sesja mogła wygasnąć albo ta strona wymaga posiadania konta.",
			hint: "Zaloguj się na swoje konto Familiar, a następnie otwórz tę stronę ponownie.",
		},
		forbidden: {
			title: "Nie masz dostępu do tej strony",
			description:
				"Ta treść może być prywatna albo Twoje konto nie ma uprawnień do jej wyświetlenia.",
			hint: "Sprawdź, czy korzystasz z właściwego konta, lub wróć na publiczną stronę.",
		},
		rate_limit: {
			title: "Czas na krótką przerwę",
			description: "Familiar otrzymał zbyt wiele żądań w krótkim czasie.",
			hint: "Odczekaj chwilę, zanim spróbujesz ponownie.",
		},
		timeout: {
			title: "To trwa dłużej niż zwykle",
			description:
				"Usługa nie odpowiedziała na czas, więc nie udało się załadować strony.",
			hint: "Poczekaj chwilę i spróbuj ponownie. Usługa może być przeciążona.",
		},
		unavailable: {
			title: "Familiar jest chwilowo niedostępny",
			description:
				"Jedna z potrzebnych usług nie odpowiada, więc nie możemy teraz załadować tej strony.",
			hint: "Wystąpił problem z połączeniem z usługą. Spróbuj ponownie za kilka minut.",
		},
		server: {
			title: "Wystąpił problem po stronie serwera",
			description:
				"Serwer nie mógł wykonać Twojego żądania. Spróbuj ponownie za chwilę.",
			hint: "Jeśli problem się powtarza, wróć nieco później.",
		},
		request: {
			title: "Nie udało się wykonać tego żądania",
			description: "Familiar nie mógł przetworzyć żądania otwarcia tej strony.",
			hint: "Sprawdź adres lub wróć na stronę główną i otwórz stronę ponownie.",
		},
		network: {
			title: "Nie udało się połączyć z Familiar",
			description:
				"Twoje połączenie z internetem lub usługa mogą być niedostępne.",
			hint: "Sprawdź połączenie z internetem i spróbuj ponownie.",
		},
		update: {
			title: "Ta strona wymaga odświeżenia",
			description:
				"Nie udało się załadować części strony. Może być dostępna nowsza wersja Familiar.",
			hint: "Odśwież stronę, aby pobrać najnowszą wersję. Jeśli to nie pomoże, spróbuj ponownie później.",
		},
		unknown: {
			title: "Nie udało się załadować strony",
			description: "Podczas otwierania strony wystąpił nieoczekiwany problem.",
			hint: "Spróbuj ponownie lub wróć na stronę główną i otwórz tę stronę później.",
		},
	},
	settings: {
		profile: {
			edit_avatar: "Edytuj zdjęcie profilowe",
			edit_cover: "Edytuj zdjęcie w tle",
			change_avatar: "Zmień zdjęcie profilowe",
			change_cover: "Zmień zdjęcie w tle",
			remove_avatar: "Usuń zdjęcie profilowe",
			remove_cover: "Usuń zdjęcie w tle",
			no_changes: "Brak zmian do zapisania.",
			saving: "Zapisywanie profilu…",
			saved: "Zmiany profilu zostały zapisane.",
			validation_failed: "Popraw zaznaczone pola przed zapisaniem.",
			save_failed: "Nie udało się zapisać zmian profilu. Spróbuj ponownie.",
			no_cover: "Brak zdjęcia w tle",
			display_name: "Nazwa wyświetlana",
			username: "nazwa użytkownika",
			save_unavailable: "Zapisywanie zmian profilu nie jest jeszcze dostępne.",
		},
		navigation: {
			profile: {
				title: "Profil",
				description: "Publiczne informacje o profilu",
			},
			account: {
				title: "Konto",
				description: "E-mail, hasło i dostęp do konta",
			},
			appearance: {
				title: "Wygląd",
				description: "Motyw i ustawienia interfejsu",
			},
			notifications: {
				title: "Powiadomienia",
				description: "Wybierz, kiedy mamy Cię powiadamiać",
			},
			privacy: {
				title: "Prywatność i widoczność",
				description: "Zarządzaj widocznością profilu",
			},
			language: {
				title: "Język i region",
				description: "Język, region i formatowanie",
			},
			accessibility: {
				title: "Dostępność",
				description: "Animacje i ustawienia wizualne",
			},
			connections: {
				title: "Połączone konta",
				description: "Zarządzaj usługami zewnętrznymi",
			},
		},
		dialog: {
			close: "Zamknij ustawienia",
			escape_key: "ESC",
		},
		title: "Ustawienia użytkownika",
		description: "Zarządzaj swoim profilem, kontem i ustawieniami aplikacji.",
		sidebar: {
			title: "Ustawienia",
			description: "Zarządzaj swoim kontem",
			group: "Ustawienia użytkownika",
		},
		mobile: {
			section_label: "Sekcja ustawień",
			select_section: "Wybierz sekcję ustawień",
		},
		account: {
			email: {
				title: "Adres e-mail",
				description:
					"Służy do logowania i otrzymywania powiadomień dotyczących konta.",
				label: "Adres e-mail",
				placeholder: "Adres e-mail",
				change: "Zmień",
			},
			password: {
				title: "Hasło",
				description: "Wybierz silne i unikalne hasło.",
				change: "Zmień hasło",
			},
			sessions: {
				title: "Sesje konta",
				description: "Wyloguj się z innych przeglądarek i urządzeń.",
				sign_out_others: "Wyloguj inne sesje",
			},
			danger: {
				title: "Strefa zagrożenia",
				description: "Tych operacji nie można łatwo cofnąć.",
			},
			delete: {
				title: "Usuń konto",
				description: "Trwale usuń swoje konto i treści.",
				action: "Usuń konto",
			},
		},
		appearance: {
			theme: {
				title: "Motyw",
				description: "Wybierz preferowany wygląd interfejsu.",
				interface_label: "Motyw interfejsu",
				applied_description: "Zmiana jest od razu stosowana w całej aplikacji.",
			},
			interface: {
				title: "Interfejs",
			},
			compact_layout: {
				title: "Układ kompaktowy",
				description: "Zmniejsz odstępy, aby wyświetlać więcej informacji.",
			},
			media_animations: {
				title: "Animowane multimedia",
				description:
					"Automatycznie odtwarzaj animowane multimedia w portfolio.",
			},
		},
		notifications: {
			messages: {
				title: "Wiadomości",
				description: "Powiadamiaj mnie o nowych wiadomościach.",
			},
			comments: {
				title: "Komentarze",
				description: "Powiadamiaj mnie o komentarzach pod moimi postami.",
			},
			likes: {
				title: "Polubienia",
				description: "Powiadamiaj mnie, gdy ktoś polubi moją pracę.",
			},
			new_followers: {
				title: "Nowi obserwujący",
				description:
					"Powiadamiaj mnie, gdy ktoś zacznie obserwować mój profil.",
			},
			email: {
				title: "Powiadomienia e-mail",
				description: "Wysyłaj ważne powiadomienia na mój adres e-mail.",
			},
			preferences: {
				title: "Ustawienia powiadomień",
				description:
					"Wybierz aktywności, o których chcesz otrzymywać powiadomienia.",
			},
		},
		privacy: {
			public_profile: {
				title: "Publiczny profil",
				description: "Pozwól wszystkim przeglądać Twój profil.",
			},
			online_status: {
				title: "Pokaż status online",
				description: "Pozwól innym użytkownikom zobaczyć, kiedy jesteś online.",
			},
			liked_posts: {
				title: "Pokaż polubione posty",
				description: "Wyświetlaj polubione posty na swoim profilu.",
			},
			search_engines: {
				title: "Zezwól wyszukiwarkom",
				description:
					"Zezwól zewnętrznym wyszukiwarkom na indeksowanie Twojego profilu.",
			},
			sensitive_content: {
				blur: {
					title: "Zawsze rozmywaj wrażliwe treści",
					description:
						"Wymagaj potwierdzenia przed wyświetleniem wrażliwych multimediów.",
				},
				remember: {
					title: "Zapamiętuj odsłonięte posty",
					description: "Zachowuj odsłonięte wrażliwe posty w bieżącej sesji.",
				},
				title: "Wrażliwe treści",
				description: "Zarządzaj ostrzeżeniami o treści.",
			},
			visibility: {
				title: "Widoczność profilu",
				description: "Kontroluj, kto może zobaczyć Twój profil i aktywność.",
			},
		},
		language: {
			language: {
				title: "Język",
				description: "Wybierz język używany w całej aplikacji.",
			},
			application_language: {
				label: "Język aplikacji",
				description: "Zmiana jest stosowana od razu, bez przeładowania strony.",
			},
			region: {
				title: "Region",
				description: "Używany do formatowania dat, liczb i walut.",
				label: "Region",
			},
			time_zone: {
				label: "Strefa czasowa",
			},
		},
		accessibility: {
			reduce_motion: {
				title: "Ogranicz animacje",
				description: "Ogranicz animacje i przejścia w interfejsie.",
			},
			high_contrast: {
				title: "Wysoki kontrast",
				description: "Zwiększ kontrast między elementami interfejsu.",
			},
			underline_links: {
				title: "Podkreślaj linki",
				description: "Zawsze wyświetlaj podkreślenia pod linkami.",
			},
			larger_text: {
				title: "Większy tekst interfejsu",
				description: "Zwiększ podstawowy rozmiar tekstu w całej aplikacji.",
			},
			preferences: {
				title: "Ustawienia dostępności",
				description:
					"Dostosuj interfejs, aby korzystanie z niego było wygodniejsze.",
			},
		},
		connections: {
			google: {
				label: "Google",
				description: "Używaj Google do logowania.",
			},
			discord: {
				label: "Discord",
				description: "Połącz swój profil Discord.",
			},
			twitch: {
				label: "Twitch",
				description: "Wyświetlaj swój kanał Twitch.",
			},
			title: "Połączone konta",
			description: "Połącz usługi zewnętrzne ze swoim kontem.",
			disconnect: "Odłącz",
			connect: "Połącz",
		},
	},
	accessibility: {
		reading: "Czytanie",
		save_hint:
			"Zmiany zostaną zastosowane po zapisaniu i zapamiętane w tej przeglądarce.",
		font: "Krój pisma interfejsu",
		font_help:
			"Wybierz krój, który czyta Ci się najwygodniej. OpenDyslexic jest opcjonalną preferencją czytania.",
		font_default: "Domyślny Familiar",
		font_dyslexic: "OpenDyslexic",
		font_system: "Krój systemowy",
		text_size: "Rozmiar tekstu",
		preview_title: "Poczuj się wygodnie",
		preview_text:
			"Odkrywaj artystów, przeglądaj ich portfolio i ciesz się szczegółami we własnym tempie.",
		vision: "Wyświetlanie i obsługa",
		color_vision: "Paleta widzenia barw",
		color_help:
			"Dostosuj kolory interfejsu do trudności z rozróżnianiem czerwieni i zieleni lub błękitu i żółci. Prace zachowują oryginalne kolory; etykiety i ikony dostarczają dodatkowych wskazówek.",
		color_default: "Standardowe kolory",
		"color_red-green": "Czerwień–zieleń (błękit / pomarańcz)",
		"color_blue-yellow": "Błękit–żółć (róż / turkus)",
		sample_complete: "Ukończono",
		sample_attention: "Wymaga uwagi",
		reduceMotion: "Ogranicz ruch",
		reduceMotion_help:
			"Ogranicz animacje i przejścia. Preferencja ograniczenia ruchu z ustawień urządzenia jest zawsze uwzględniana.",
		highContrast: "Wyższy kontrast",
		highContrast_help:
			"Ułatw rozróżnianie tekstu, obramowań i fokusu klawiatury.",
		underlineLinks: "Podkreślaj linki",
		underlineLinks_help: "Rozpoznawaj linki dzięki podkreśleniu oraz kolorowi.",
		spaciousText: "Więcej przestrzeni w tekście",
		spaciousText_help:
			"Zwiększ odstępy między wierszami, literami i słowami w akapitach i polach tekstowych.",
		reset: "Przywróć domyślne",
		saved: "Zapisano preferencje dostępności.",
		session_only:
			"Preferencje zastosowano na tę sesję. Pamięć przeglądarki jest niedostępna.",
	},
	seo: {
		error_preview: {
			title: "Podgląd stron błędów",
			description: "Zobacz strony błędów Familiar i dostępne działania.",
		},
		auth: {
			title: "Dostęp do konta",
			description:
				"Zaloguj się lub utwórz konto Familiar, aby udostępniać prace i zarządzać profilem artysty.",
		},
		login: {
			title: "Logowanie",
			description:
				"Zaloguj się do Familiar, aby zarządzać portfolio, wiadomościami i zleceniami artystycznymi.",
		},
		register: {
			title: "Utwórz konto",
			description:
				"Dołącz do Familiar, aby udostępniać prace, tworzyć portfolio oraz poznawać artystów i klientów.",
		},
		forgot: {
			title: "Zresetuj hasło",
			description:
				"Poproś o zresetowanie hasła do konta Familiar i bezpiecznie odzyskaj dostęp.",
		},
		email_confirmed: {
			title: "Potwierdzenie adresu e-mail",
			description:
				"Sprawdź stan potwierdzenia adresu e-mail przypisanego do konta Familiar.",
		},
		payment_connect: {
			title: "Połącz konto płatnicze",
			description:
				"Skonfiguruj połączenie konta płatniczego z kontem artysty w Familiar.",
		},
		payment_callback: {
			title: "Konfiguracja konta płatniczego",
			description: "Sprawdź wynik połączenia konta płatniczego z Familiar.",
		},
		logout: {
			title: "Wylogowanie",
			description: "Wyloguj się z konta Familiar.",
		},
		basket: {
			title: "Koszyk",
			description:
				"Sprawdź wybrane zlecenia artystyczne i szczegóły zamówienia w Familiar.",
		},
		requests: {
			title: "Moje zapytania",
			description:
				"Przeglądaj zapytania o zlecenia artystyczne, postępy realizacji i rozmowy dotyczące zamówień w Familiar.",
		},
		settings: {
			title: "Ustawienia profilu",
			description:
				"Zarządzaj profilem Familiar, wyglądem aplikacji, językiem i preferencjami konta.",
		},
		chat: {
			title: "Wiadomości",
			description:
				"Czytaj prywatne rozmowy i wiadomości dotyczące zleceń oraz zarządzaj nimi w Familiar.",
		},
		dashboard: {
			title: "Panel artysty",
			description:
				"Zarządzaj kontem artysty, zleceniami, usługami i formularzami zapytań w Familiar.",
		},
		dashboard_requests: {
			title: "Zapytania o zlecenia",
			description:
				"Przeglądaj otrzymane zapytania o zlecenia i zarządzaj nimi w panelu artysty Familiar.",
		},
		dashboard_services: {
			title: "Twoje usługi",
			description:
				"Zarządzaj usługami artystycznymi oferowanymi na swoim profilu Familiar.",
		},
		dashboard_forms: {
			title: "Formularze zapytań",
			description:
				"Twórz formularze zapytań do swoich usług artystycznych w Familiar i zarządzaj nimi.",
		},
		create: {
			title: "Twórz w Familiar",
			description:
				"Utwórz post w portfolio lub uporządkuj swoje prace w folderze.",
		},
		create_post: {
			title: "Nowy post",
			description:
				"Dodaj obrazy, tytuł i opis, aby opublikować nowy post w portfolio Familiar.",
		},
		create_folder: {
			title: "Utwórz folder",
			description:
				"Uporządkuj powiązane prace i posty z portfolio w nowym folderze Familiar.",
		},
		category: {
			title: "Zlecenia: {{category}}",
			description:
				"Przeglądaj zlecenia w kategorii {{category}} i poznaj artystów tworzących prace na zamówienie w Familiar.",
		},
		shop_item: {
			title: "Szczegóły zlecenia artystycznego",
			description:
				"Poznaj ofertę zlecenia artystycznego, galerię i dostępne opcje w Familiar.",
		},
		portfolio: {
			title: "Portfolio @{{username}}",
			description:
				"Odkryj prace i posty udostępnione w portfolio @{{username}} w Familiar.",
		},
		commissions: {
			title: "Zlecenia od @{{username}}",
			description:
				"Poznaj usługi artystyczne oferowane przez @{{username}} w Familiar.",
		},
		characters: {
			title: "Postacie @{{username}}",
			description:
				"Odkryj postacie i ilustracje postaci udostępnione przez @{{username}} w Familiar.",
		},
		reviews: {
			title: "Opinie o @{{username}}",
			description:
				"Przeczytaj opinie o pracach i zleceniach artystycznych od @{{username}} w Familiar.",
		},
		liked: {
			title: "Polubione prace",
			description: "Przeglądaj polubione prace i posty z portfolio w Familiar.",
		},
		post: {
			title: "Post w portfolio",
			description:
				"Odkrywaj prace i posty udostępniane przez niezależnych artystów w Familiar.",
		},
		artist_post: {
			title: "Praca @{{username}}",
			description:
				"Zobacz pracę udostępnioną przez @{{username}} i poznaj portfolio tego artysty w Familiar.",
		},
		folder: {
			title: "Folder portfolio @{{username}}",
			description:
				"Odkryj kolekcję prac i postów z portfolio @{{username}} w Familiar.",
		},
		commission: {
			title: "Szczegóły usługi artystycznej",
			description:
				"Poznaj informacje o usłudze artysty i opcje zapytania w Familiar.",
		},
		defaults: {
			title: "Familiar",
			description:
				"Udostępniaj prace, twórz portfolio oraz poznawaj artystów i klientów w Familiar.",
			keywords: "sztuka, familiar, zlecenia",
		},
		home: {
			title: "Strona główna",
			description:
				"Udostępniaj prace, twórz portfolio oraz poznawaj artystów i klientów w Familiar.",
		},
		profile: {
			title: "Profil (@{{username}})",
			description: "Profil użytkownika @{{username}}",
		},
		shop: {
			title: "Sklep - Ilustracje i zlecenia artystyczne na zamówienie",
			description:
				"Przeglądaj zlecenia artystyczne od niezależnych twórców na Familiar. Odkrywaj style, galerie i ceny, a potem zamów ilustrację stworzoną specjalnie dla Ciebie.",
			keywords:
				"ilustracje na zamówienie, zlecenia artystyczne, commission art Polska, zamów grafikę, custom art, digital art commission, ilustrator na zamówienie, grafika postaci, portret na zamówienie, marketplace dla artystów, Familiar shop",
		},
		"privacy-policy": {
			title: "Polityka prywatności",
			description: "Przeczytaj politykę prywatności Familiar.",
		},
		"release-notes": {
			title: "Historia zmian",
			description: "Zobacz najnowsze zmiany w Familiar.",
		},
		roadmap: {
			title: "Plan rozwoju",
			description: "Zobacz, co planujemy w Familiar.",
		},
		support: {
			title: "Wesprzyj Familiar",
			description:
				"Wesprzyj niezależny rozwój Familiar jednorazowym dożywotnim wkładem.",
		},
		terms_of_service: {
			title: "Warunki świadczenia usług",
			description: "Przeczytaj warunki świadczenia usług Familiar.",
		},
	},
	meta: {
		app_name: "Familiar",
		label: "Polski",
		flag: "🇵🇱",
		currency: {
			value: "PLN",
			label: "PLN",
			symbol: "zł",
		},
	},
	header: {
		title: "$t(meta.app_name)",
		navigation: {
			account: "Nawigacja konta",
			messages: "Wiadomości",
			open_menu: "Otwórz nawigację",
			home: "Strona główna",
			shop: "Sklep",
			blog: "Blog",
			users: "Użytkownicy",
		},
		user_navigation: {
			profile: "Profil",
			settings: "Ustawienia",
			logout: "Wyloguj",
		},
		theme: {
			toggle: "Zmień motyw",
			light: "Jasny",
			dark: "Ciemny",
			system: "Systemowy",
		},
		"artist-dashboard": "Panel artysty",
	},
	auth: {
		navigation: "Dostęp do konta",
		brand: {
			title: "Zrób miejsce na swoją kreatywność.",
			description: "Miejsce, w którym możesz dzielić się swoją twórczością i poczuć się jak u siebie.",
		},
		login: {
			cta: "Zaloguj",
			title: "Witaj ponownie",
			description: "Zaloguj się do swojego konta, aby kontynuować",
			success: "Zalogowano pomyślnie",
			pending: "Logowanie...",
		},
		terms_agree: {
			label: "Rejestrjąc się w $t(header.title), akceptujesz nasz ",
			terms: "Regulamin",
			and: " i ",
			privacy: "Politykę Prywatności",
		},
		register: {
			cta: "Zarejestruj",
			title: "Utwórz konto",
			description: "Wprowadź swoje dane poniżej, aby utworzyć konto",
			already_have_account: "Posiadasz już konto?",
			success: "Konto utworzone pomyślnie",
			confirm_email:
				"Konto zostało utworzone. Sprawdź skrzynkę i potwierdź adres e-mail.",
			submit: "Zarejestruj",
			pending: "Tworzenie konta...",
			error_title: "Nie udało się utworzyć konta",
			validation_error_title: "Sprawdź zaznaczone pola",
			validation_error_description:
				"Niektóre dane wymagają poprawienia przed utworzeniem konta.",
			steps: {
				account: "Konto",
				profile: "Profil",
				socials: "Linki",
			},
			verify: {
				title: "Potwierdź swój adres e-mail",
				description: "Wysłaliśmy link potwierdzający na poniższy adres e-mail.",
				waiting:
					"Otwórz link z wiadomości. Ta strona zaktualizuje się automatycznie, możesz też sprawdzić ponownie ręcznie.",
				verified_title: "Adres e-mail potwierdzony",
				verified_description:
					"Twoje konto jest gotowe. Możesz bezpiecznie zamknąć tę stronę.",
				check_again: "Sprawdź ponownie",
				close_for_now: "Zamknij na razie",
				continue: "Kontynuuj",
			},
			profile: {
				title: "Dane profilu",
				description: "Wybierz, jak będzie wyglądał Twój publiczny profil.",
			},
			images: {
				title: "Zdjęcia profilowe",
				description:
					"Dodaj awatar i zdjęcie w tle teraz albo pomiń ten krok i dodaj je później.",
				cover_preview: "Podgląd zdjęcia w tle",
				avatar_preview: "Podgląd awatara",
				no_cover: "Brak zdjęcia w tle",
				change_cover: "Wybierz zdjęcie w tle",
				remove_cover: "Usuń zdjęcie w tle",
				choose_avatar: "Wybierz awatar",
				remove_avatar: "Usuń awatar",
			},
		},
		email_confirmed: {
			title: "Twój adres e-mail został potwierdzony",
			description:
				"Możesz zamknąć tę kartę i wrócić do strony rejestracji. Zaktualizuje się ona automatycznie.",
			continue: "Przejdź do Familiar",
		},
		forgot: {
			cta: "Zapomniałeś hasła?",
			title: "Zapomniałeś hasła?",
			register_question: "Nie masz konta?",
			description: "Wprowadź swój email, aby zresetować hasło",
			submit: "Wyślij link resetowania",
			back_to_login: "Wróć do Logowania",
			reset_password: "Resetuj Hasło",
		},
		email: {
			label: "Email",
			placeholder: "example@familiar.art",
		},
		back: "Wróć",
		continue: "Kontynuuj",
		invite_key: {
			label: "Klucz zaproszeniowy",
			placeholder: "FAM-XXXX-XXXX-XXX",
			prefix: "FAM-",
		},
		display_name: {
			label: "Twoja Nazwa",
			placeholder: "Twoje Nazwa",
		},
		username: {
			label: "Nazwa Użytkownika",
			placeholder: "nazwa_uzytkownika",
		},
		bio: {
			label: "Biografia",
			placeholder: "Napisz kilka słów o sobie...",
		},
		socials: {
			add_label: "Dodaj link do profilu",
			select_placeholder: "Wybierz platformę",
			add: "Dodaj",
			description:
				"Dodaj maksymalnie pięć linków obsługiwanych podczas rejestracji.",
			empty: "Nie dodano jeszcze żadnych linków.",
			remove: "Usuń link do profilu",
		},
		password: {
			label: "Hasło",
			placeholder: "Haslo",
			hide: "Ukryj hasło",
			show: "Pokaż hasło",
		},
		confirm_password: {
			label: "Potwierdź hasło",
			placeholder: "Powtórz hasło",
		},
		create_account: {
			cta: "Utwórz Konto",
		},
		errors: {
			rate_limit: "Zbyt wiele prób. Spróbuj ponownie później.",
			invalid_credentials: "Nieprawidłowy email lub hasło",
			invalid_registration: "Sprawdź dane rejestracyjne i kod zaproszenia.",
			invalid_invite_key:
				"Ten kod zaproszenia jest nieprawidłowy lub został już użyty.",
			email_registered:
				"Konto z tym adresem e-mail lub nazwą użytkownika już istnieje.",
			username_taken: "Ta nazwa użytkownika jest już zajęta.",
			unsupported_registration_image:
				"Format awatara lub zdjęcia w tle nie jest obsługiwany.",
			registration_provider_failed:
				"Dostawca uwierzytelniania nie mógł utworzyć konta.",
			registration_service_unavailable:
				"Rejestracja jest chwilowo niedostępna. Spróbuj ponownie za moment.",
			registration_failed: "Rejestracja nie powiodła się: {{error}}",
			login_failed: "Logowanie nie powiodło się: {{error}}",
			logout_failed: "Wylogowanie nie powiodło się: {{error}}",
			create_profile_failed:
				"Nie udało się utworzyć profilu użytkownika: {{error}}",
			auth_session_missing: "Brak sesji uwierzytelniania!",
			user_authenticated_not_found:
				"Użytkownik uwierzytelniony w Supabase, ale nie znaleziony w bazie danych.",
			failed_refresh_session: "Nie udało się odświeżyć sesji: {{error}}",
			failed_get_user: "Nie udało się pobrać użytkownika: {{error}}",
			failed_auto_create_profile:
				"Nie udało się automatycznie utworzyć profilu: {{error}}",
			failed_fetch_user_auth_change:
				"Nie udało się pobrać użytkownika przy zmianie statusu uwierzytelniania: {{error}}",
			use_auth_provider: "useAuth musi być używany wewnątrz AuthProvider",
		},
		account_type: {
			label: "Typ Konta",
			client_title: "Konto Klienta",
			client_description: "Dla osób szukających połączeń z artystami.",
			artist_title: "Konto Artysty",
			artist_description: "Dla artystów szukających połączeń z klientami.",
			client_badge: "Domyślne",
		},
	},
	pages: {
		home: {
			title: "Strona główna",
			description: "Strona w trakcie renowacji.",
		},
	},
	states: {
		empty: {
			under_construction: "W budowie",
			user_not_found: "Nie znaleziono użytkownika",
			user_not_found_description:
				"Nie mogliśmy znaleźć tego użytkownika. Sprawdź nazwę lub wróć na stronę główną.",
			back_to_home: "Wróć na stronę główną",
		},
	},
	components: {
		language_select: {
			search: "Szukaj języka",
			select: "Wybierz język",
			no_results: "Nie znaleziono języka",
		},
		portfolio: {
			filters: {
				all: "Wszystkie",
				commissions_only: "Tylko zlecenia",
				tags: "Tagi",
				folders: "Foldery",
				search_placeholder: "Szukaj w portfolio...",
			},
			folder: {
				back: "Powrót do portfolio",
				manage: {
					rename: "Zmień nazwę folderu",
					delete: "Usuń folder",
				},
				delete: {
					title: "Usunąć folder?",
					description:
						"Czy na pewno chcesz usunąć ten folder? Posty w nim nie zostaną usunięte.",
					cancel: "Anuluj",
					deleting: "Usuwanie...",
					confirm: "Usuń",
				},
				filters: {
					search_placeholder: "Szukaj w tym folderze...",
				},
				create: {
					title: "Nowy folder",
				},
				catalogs: "Foldery portfolio",
				label: "Folder portfolio",
				items: "{{count}} postów",
				items_one: "{{count}} post",
				items_few: "{{count}} posty",
				items_many: "{{count}} postów",
				items_other: "{{count}} posta",
				empty: {
					title: "Ten folder jest pusty",
					description: "Posty dodane do tego folderu pojawią się tutaj.",
					owner_description:
						"Dodaj istniejące posty ze swojego portfolio lub wybierz ten folder podczas tworzenia nowego posta.",
					browse: "Przeglądaj portfolio",
					search_title: "Brak pasujących postów",
					search_description:
						"Zmień wyszukiwanie lub wyczyść filtry, aby zobaczyć więcej postów.",
					clear: "Wyczyść wyszukiwanie i filtry",
				},
				add: {
					action: "Dodaj posty",
					title: "Dodaj posty do folderu",
					description: "Wybierz istniejące posty ze swojego portfolio.",
					search: "Szukaj w swoich postach...",
					untitled: "Post bez tytułu",
					no_matches: "Żaden post nie pasuje do wyszukiwania.",
					none: "Wszystkie Twoje posty są już w tym folderze.",
					error:
						"Nie udało się dodać części postów. Spróbuj ponownie, aby dodać pozostałe zaznaczone posty.",
					saving: "Dodawanie...",
					confirm: "Dodaj {{count}} postów",
					confirm_one: "Dodaj {{count}} post",
					confirm_few: "Dodaj {{count}} posty",
					confirm_many: "Dodaj {{count}} postów",
					confirm_other: "Dodaj {{count}} posta",
				},
			},
			search_placeholder: "Szukaj folderów...",
			content_warning: {
				open: "Otwórz post z wrażliwą treścią",
				sensitive_content: "Wrażliwa treść",
				title: "Ostrzeżenie o treści",
				show: "Pokaż",
				description:
					"Ten post zawiera treści, których niektórzy odbiorcy mogą nie chcieć oglądać.",
				hide: "Ukryj wrażliwą treść",
			},
			post: {
				image_alt: "Obraz w portfolio",
				no_media: "Brak multimediów",
				view: "Zobacz post w portfolio",
				untitled: "Bez tytułu",
				delete: {
					success: "Post został usunięty",
					error: "Nie udało się usunąć posta",
					title: "Usunąć post?",
					description:
						"Czy na pewno chcesz usunąć ten post? Tej operacji nie można cofnąć.",
					cancel: "Anuluj",
					deleting: "Usuwanie...",
					confirm: "Usuń",
				},
				edit_coming_soon: "Edycja postów będzie dostępna wkrótce!",
				manage: {
					edit: "Edytuj post",
					delete: "Usuń post",
					copy_link_success: "Link skopiowano do schowka",
					copy_link: "Kopiuj link",
					report: "Zgłoś post",
				},
				report_coming_soon: "Zgłaszanie postów będzie dostępne wkrótce!",
				previous_media: "Poprzedni obraz",
				next_media: "Następny obraz",
				unlike: "Cofnij polubienie",
				like: "Polub",
				comment: "Skomentuj",
				share: "Udostępnij",
				remove_bookmark: "Usuń z zapisanych",
				bookmark: "Zapisz",
				like_count_single: "polubienie",
				like_count_plural: "polubień",
				loading: "Wczytywanie posta...",
				error: "Błąd",
				not_found: "Nie znaleziono posta lub nie udało się go wczytać.",
				create: {
					success: "Post został utworzony!",
					error: "Nie udało się utworzyć posta.",
					title: "Utwórz post",
					media: {
						title: "Obrazy",
						upload: "Dodaj obrazy",
						remove: "Usuń obraz",
						choose: "Wybierz obrazy",
						hint: "Wybierz jeden lub więcej obrazów, które chcesz dodać do posta.",
						selected: "Wybrano: {{count}}",
					},
					fields: {
						title: "Tytuł *",
						description: "Opis",
						visibility: "Widoczność",
						categories: "Tagi",
						cws: "Ostrzeżenia o treści",
						catalogs: "Dodaj do folderów",
					},
					placeholders: {
						title: "np. Portret postaci",
						description: "Opcjonalny opis...",
						tags: "Wybierz tagi...",
					},
					errors: {
						title_required: "Tytuł jest wymagany.",
					},
					hints: {
						title_length: "Maksymalnie 100 znaków.",
						categories: "Wybierz tagi opisujące Twoją pracę.",
						cws: "Wybierz odpowiednie ostrzeżenia o treści.",
					},
					visibility: {
						public: "Publiczny",
						private: "Prywatny",
					},
					actions: {
						cancel: "Anuluj",
						creating: "Tworzenie...",
						create: "Utwórz post",
					},
					description: "Dodaj obrazy i opis, aby udostępnić pracę w swoim portfolio.",
					no_tags: "Nie znaleziono tagów.",
				},
				likes_one: "{{formattedCount}} polubienie",
				likes_few: "{{formattedCount}} polubienia",
				likes_many: "{{formattedCount}} polubień",
				likes_other: "{{formattedCount}} polubienia",
				warnings: {
					title: "Ostrzeżenia o treści",
					description:
						"Wybierz ostrzeżenia, które odbiorcy zobaczą przed otwarciem tej pracy.",
					load_error: "Nie udało się wczytać dostępnych ostrzeżeń.",
					retry: "Spróbuj ponownie",
					save_error: "Nie udało się zapisać ostrzeżeń. Spróbuj ponownie.",
				},
			},
		},
		profile: {
			tabs: {
				commissions: "Zlecenia",
				portfolio: "Portfolio",
				characters: "Postacie",
				saved: "Zapisane",
				liked: "Polubione",
			},
			portfolio: {
				unavailable: {
					title: "Brak portfolio",
					description: "To konto nie ma portfolio artysty.",
				},
				manage: {
					options: "Opcje posta",
					edit: "Edytuj post",
					delete: "Usuń post",
					remove: "Usuń z folderu",
				},
				empty: {
					title: "Brak postów.",
					description:
						"Ten użytkownik nie dodał jeszcze nic do swojego portfolio.",
				},
			},
			private_content: {
				title: "Ta zawartość jest prywatna",
				description: "Nie masz uprawnień do wyświetlania tej zawartości.",
			},
			actions: {
				follow: "Obserwuj",
				unfollow: "Przestań obserwować",
				edit_profile: "Edytuj profil",
				followers: "Obserwujący",
				following: "Obserwowani",
				work_queue: "Kolejka prac",
				add_post: "Utwórz post",
				more: "Więcej opcji",
				share_profile: "Udostępnij profil",
				share_failed: "Nie udało się udostępnić profilu. Spróbuj ponownie.",
				report_user: "Zgłoś",
				block_user: "Zablokuj użytkownika",
				sign_in_to_follow: "Zaloguj się, aby obserwować tego użytkownika.",
				sign_in_to_message: "Zaloguj się, aby napisać do tego użytkownika.",
				message_failed: "Nie udało się rozpocząć rozmowy. Spróbuj ponownie.",
				queue: "Kolejka",
				message: "Wiadomość",
			},
			info: {
				local_time: "Czas lokalny",
				suspended: "To konto jest zawieszone.",
				about_me: "O mnie",
			},
			details: {
				stats: {
					followers: "Obserwujący",
					following: "Obserwowani",
					works: "Prace",
				},
				joined: "Dołączył(a)",
				local: "lokalnie",
				bio: "Biografia",
				languages: "Języki",
				description: "Więcej o {{name}}.",
				links: "Linki",
			},
			languages: {
				levels: {
					native: "Ojczysty",
					fluent: "Biegły",
					communicative: "Komunikatywny",
					learning: "Uczący się",
					basic: "Podstawowy",
				},
			},
			commissions: {
				card: {
					from: "Od",
					start_request: "Zleć pracę",
					join_waitlist: "Dołącz do kolejki",
					get_notified: "Otrzymuj powiadomienia",
					open: "Otwarte",
					closed: "Zamknięte",
					waitlist: "Kolejka",
					content_warning: "Ostrzeżenie o treści",
					sensitive_content: "Treści wrażliwe",
					contains_tags: "Ten materiał zawiera {{tags}}",
					show_content: "Pokaż",
					hide_content: "Ukryj",
					show_details_18_plus: "Pokaż szczegóły, mam 18+",
				},
				post_modal: {
					title: "Szczegóły posta",
					content_warning: "Ostrzeżenie o treści",
					sensitive_content_desc:
						"Ta praca zawiera treści, które niektórzy odbiorcy mogą uznać za wrażliwe",
					commissioned_by: "Zlecone przez klienta",
					featured: "Wyróżnione",
					view_in_gallery: "Zobacz w galerii",
					commission_similar: "Zleć mi coś podobnego",
					no_tags: "Brak tagów",
					tags_label: "Tagi",
					content_warnings_label: "Ostrzeżenia o treści",
					no_cw_tags: "Brak ostrzeżeń",
					highlights: "Wyróżnienia",
					character: "Postać",
					no_media: "Brak multimediów",
					default_highlights: {
						delivery: "Terminowa dostawa",
						responsive: "Bardzo responsywny",
						updates: "Proaktywne aktualizacje",
					},
				},
				empty: {
					title: "Brak zleceń",
					description: "Ten użytkownik nie utworzył jeszcze żadnych zleceń.",
				},
				modal: {
					title: "Szczegóły zlecenia",
					category_label: "Zlecenie",
					no_media: "Brak multimediów",
					license: {
						title: "Typ licencji",
						info: "Info o licencji",
						included: "Wliczone",
						personal: "Użytek osobisty",
						personal_desc: "Tylko do użytku osobistego",
						monetized: "Treści monetyzowane",
						monetized_desc: "Do użytku w treściach monetyzowanych",
						commercial: "Komercyjne",
						commercial_desc: "Do użytku komercyjnego",
						unavailable: "Niedostępne",
						other_licenses_count: "Inne licencje ({{count}})",
					},
					service: {
						custom: {
							title: "Usługa niestandardowa",
							tooltip: "Stworzone od podstaw na podstawie Twoich wymagań",
							description: "Stworzone od podstaw",
						},
						ych: {
							title: "Personalizowane YCH",
							tooltip: "Your Character Here - ustalona poza/scena",
							description: "Ustalona poza, Twoja postać",
						},
						communication: {
							title: "Otwarta komunikacja",
							tooltip: "Regularne aktualizacje i pętle informacji zwrotnej",
							description: "Aktualizacje WIP + dostępne poprawki",
						},
						surprise: {
							title: "Zaskocz mnie",
							tooltip: "Artysta ma wolną rękę",
							description: "Wybór artysty / Wolność artystyczna",
						},
						proposal: {
							title: "Niestandardowa propozycja",
							tooltip: "Standardowy przepływ pracy zlecenia",
							description: "Zlecenie → propozycja → zobowiązanie (płatność)",
						},
						instant: {
							title: "Zamówienie natychmiastowe",
							tooltip: "Bezpośrednie zamówienie bez etapu propozycji",
							description: "Zamów i zapłać bezpośrednio",
						},
					},
					tabs: {
						description: "Opis",
					},
					tos: {
						title: "Warunki usługi {{artist_displayname}}",
						updated_at: "Zaktualizowano {{updated_at}}",
						agreement_prefix: "Zlecając mi pracę, zgadzasz się na:",
						read_full: "Przeczytaj pełny Regulamin",
					},
					reviews: {
						empty: "Brak recenzji.",
						total_count: "{{count}} opinii",
						total_count_one: "{{count}} opinia",
						total_count_few: "{{count}} opinie",
						total_count_many: "{{count}} opinii",
						total_count_other: "{{count}} opinii",
					},
					info_selection_modal: {
						service: {
							title: "Rodzaj usługi",
							description:
								"Rodzaj usługi, którą artysta świadczy w ramach zlecenia.",
						},
						communication: {
							title: "Styl komunikacji",
							description:
								"Styl komunikacji, którego należy oczekiwać od artysty w przypadku zlecenia.",
						},
						process: {
							title: "Proces składania zamówienia",
							description:
								"Sposób składania zapytania o zlecenie dla danej usługi.",
						},
					},
					license_info_modal: {
						title: "Dostępne licencje",
						subtitle:
							"Artysta jest licencjodawcą zamówionego zasobu i może dołączyć dodatkowe warunki licencji w swoim Regulaminie lub opisie usługi.",
						personal: {
							title: "Osobista",
							description:
								"Tylko do użytku indywidualnego, niekomercyjnego i niemonetyzowanego",
							allowed: {
								personal_use:
									"Użytek osobisty (np. awatar w mediach społecznościowych, tapeta, wydruk osobisty)",
							},
							forbidden: {
								monetized:
									"Treści monetyzowane (np. streaming, filmy na youtube)",
								commercial: "Merchandising komercyjny (np. koszulki, naklejki)",
							},
						},
						monetized: {
							title: "Treści monetyzowane",
							description:
								"Dla twórców treści i firm, które chcą wykorzystać zamówiony zasób jako część tworzenia i dystrybucji komercyjnych i monetyzowanych treści cyfrowych",
							allowed: {
								personal_use: "Użytek osobisty",
								monetized_content:
									"Treści monetyzowane (streaming, filmy itp.)",
							},
							forbidden: {
								commercial: "Merchandising komercyjny",
							},
						},
						commercial: {
							title: "Merchandising komercyjny",
							description:
								"Dla firm, które chcą tworzyć, promować i odsprzedawać własne cyfrowe lub fizyczne produkty końcowe wykonane przy użyciu zamówionego zasobu",
							licensee: {
								label: "Licencjobiorca",
								value: "Osoba fizyczna lub podmiot prawny (Firma)",
							},
							commercial_use: {
								label: "Użytek komercyjny",
								allowed: {
									creation:
										"Tworzenie, odsprzedaż i dystrybucja produktów końcowych cyfrowych lub fizycznych o wartości dodanej lub pochodnych, wykonanych przy użyciu zamówionego zasobu przez Licencjobiorcę",
									distribution:
										"Tworzenie i dystrybucja treści cyfrowych i fizycznych w celu promowania odsprzedaży produktów końcowych cyfrowych lub fizycznych o wartości dodanej stworzonych przez Licencjobiorcę",
								},
								forbidden: {
									reselling:
										'Odsprzedaż zamówionego zasobu "tak jak jest" bez żadnych działań o wartości dodanej',
								},
							},
							credit: {
								label: "Uznanie autorstwa",
								value:
									"Wymagane dla wszystkich zastosowań publicznych, chyba że uzgodniono inaczej",
							},
						},
						custom_licenses: {
							title: "Niestandardowe licencje artysty",
							updated: "Zaktualizowano {{date}}",
						},
						system_licenses: {
							title: "Standardowe licencje Familiar",
						},
					},
					footer: {
						accept_tos_label: "Akceptuję Regulamin użytkownika {{artist}}",
						tos_disclaimer:
							"Zaznaczając to pole, zgadzasz się na warunki artysty.",
						terms_summary: "Podsumowanie warunków:",
						no_terms: "Brak dostępnych warunków",
						accept_start: "Zaakceptuj warunki, aby zlecić pracę",
						feature_disabled: "Funkcja tymczasowo wyłączona",
					},
					no_description: "Brak opisu.",
				},
			},
			feeds: {
				empty: {
					title: "Brak zawartości",
					description: "Ten użytkownik jeszcze nic nie opublikował.",
				},
			},
			terms_of_service: {
				title: "Warunki świadczenia usług",
				updated: "Zaktualizowano",
				loading: "Wczytywanie...",
				error: "Nie udało się wczytać warunków świadczenia usług.",
			},
			badges: {
				verified: "Zweryfikowany",
				supporter: "Wspierający",
			},
		},
		language_switcher: {
			select: "Wybierz język",
		},
		theme_switcher: {
			light: "Jasny",
			dark: "Ciemny",
			oled: "OLED",
			system: "Systemowy",
			toggle: "Wybierz motyw",
		},
		currency_select: {
			search: "Szukaj waluty...",
			no_results: "Brak wyników.",
		},
	},
	footer: {
		about: {
			title: "$t(meta.app_name)",
			description:
				"$t(meta.app_name) to platforma społecznościowa dla artystów, aby łączyć się ze sobą.",
		},
		sections: {
			socials: "Sociale",
			navigation: "Nawigacja",
			resources: "Zasoby",
		},
		links: {
			home: "Strona główna",
			blog: "Blog",
			faq: "FAQ",
			sponsors: "Sponsorzy",
			terms: "Regulamin",
			documentation: "Dokumentacja",
			privacy: "Polityka prywatności",
			"release-notes": "Historia zmian",
			roadmap: "Plan rozwoju",
		},
		copyright: {
			rights: "Wszelkie prawa zastrzeżone",
			made_with: "Stworzone z ❤️",
		},
	},
	releaseNotes: {
		title: "Nowinki Familiarowe",
		eyebrow: "Lista zmian",
		latest: "Najnowsze",
		latestRelease: "Najnowsza wersja",
		tags: {
			Added: "Dodano",
			Improved: "Ulepszono",
			Fixed: "Poprawiono",
			Deprecated: "Deprecowano",
			Removed: "Usunięto",
			Security: "Bezpieczństwo",
			Breaking: "Zepsuto",
		},
		releases: {
			v0_1_0: {
				Added: [
					"Familiar jest już dostępny. To nasze pierwsze publiczne wydanie.",
				],
			},
			v0_2_0: {
				Added: [
					"Profile są już dostępne, razem z avatarami, opisami, obrazami w tle i zakładkami feedu.",
					"Możesz teraz logować się i wylogowywać z prawdziwego konta obsługiwanego przez Supabase.",
					"Profile obsługują teraz oznaczenia języków i czytelniejsze adresy URL przyjazne SEO.",
				],
			},
			v0_3_0: {
				Added: [
					"Możesz teraz przeglądać i zamawiać zlecenia bezpośrednio z profili artystów.",
					"Dostęp do treści jest teraz obsługiwany automatycznie na podstawie typu konta.",
				],
			},
			v0_3_1: {
				Improved: [
					"Karty zleceń wyglądają teraz czyściej, z płynniejszymi zaokrągleniami i lepiej dopasowanymi obrazami.",
					"Etykiety treści wrażliwych są krótsze i łatwiejsze do zrozumienia.",
				],
				Fixed: [
					"Przycisk ukrywania treści ma teraz podpowiedź, dzięki czemu jego działanie jest łatwiejsze do zrozumienia.",
				],
			},
			v0_4_0: {
				Added: [
					"Dodano nowe okna profilu do wyboru informacji, regulaminu usług i opinii.",
					"Szczegóły zleceń można teraz otwierać bezpośrednio z profili artystów.",
				],
				Improved: [
					"Podglądy zleceń ładują się szybciej i wyglądają czytelniej.",
				],
			},
			v0_5_0: {
				Added: [
					"Wersja mobilna ma teraz własne menu nawigacji, dzięki czemu łatwiej korzystać z aplikacji na mniejszych ekranach.",
					"Posty portfolio można teraz otwierać bezpośrednio i udostępniać linkiem.",
					"Treści wrażliwe są teraz domyślnie rozmyte i można je szybko odsłonić jednym dotknięciem.",
				],
				Improved: [
					"Menu użytkownika dopasowuje się do urządzenia, z listą rozwijaną na desktopie i panelem wysuwanym na mobile.",
					"Obrazy w feedzie mogą teraz odtwarzać się automatycznie na mobile podczas przewijania.",
					"Kody FAM są teraz automatycznie formatowane podczas wpisywania lub wklejania.",
				],
			},
			v0_5_1: {
				Improved: [
					"Rolki działają stabilniej, z lepszym śledzeniem postępu i płynniejszymi przejściami.",
					"Linki w postach pokazują teraz podgląd po najechaniu kursorem.",
					"Formularze zleceń mają teraz czytelniejszy układ krok po kroku.",
				],
				Added: ["Dodano nową ikonę filtrowania do użycia w aplikacji."],
			},
			v0_5_2: {
				Fixed: [
					"Rolki nie migoczą już ani nie blokują się podczas przełączania między elementami.",
					"Zdjęcia profilowe ładują się poprawnie, nawet gdy media są jeszcze przetwarzane.",
					"Zamkniętych zleceń nie da się już przypadkowo otworzyć.",
					"Pozostawanie zalogowanym po odświeżeniu strony działa teraz pewniej.",
					"Aplikacja nie pokazuje już przez chwilę, że jesteś wylogowany podczas pierwszego ładowania.",
					"Wybrany motyw stosuje się od razu, bez migania przy uruchomieniu.",
				],
				Improved: [
					"Karty folderów obsługują teraz własne kolory i ikony.",
					"Wybór licencji w oknach zleceń jest czytelniejszy i łatwiejszy w obsłudze.",
					"Przewijane obszary w oknach działają teraz bardziej spójnie.",
				],
			},
			v0_5_3: {
				Improved: [
					"Kalendarz, karuzela i formularze wieloetapowe są teraz stabilniejsze i wygodniejsze w obsłudze klawiaturą.",
				],
			},
			v0_5_4: {
				Improved: [
					"Rolki odtwarzają się płynniej i poprawnie pauzują, gdy przewiniesz dalej.",
					"Aplikacja powinna działać trochę szybciej dzięki ogólnym usprawnieniom wydajności.",
				],
				Fixed: [
					"Proces rejestracji nie blokuje się już na przycisku kontynuacji w niektórych przypadkach.",
				],
			},
			v0_6_0: {
				Added: [
					"Dodano nowy system filtrowania list według daty, tekstu, liczb albo wielu opcji naraz.",
					"Filtry dobrze działają teraz również na mobile.",
				],
			},
			v0_7_0: {
				Added: [
					"Możesz teraz wysyłać i obsługiwać zlecenia od początku do końca.",
					'Dodano stronę "Moje zlecenia", gdzie możesz śledzić ich progres.',
				],
			},
			v0_7_1: {
				Improved: [
					"Zlecenia mają teraz czytelniejsze akcje do wysyłania, akceptowania, odrzucania, anulowania i dodawania mediów.",
					"Strona szczegółów zlecenia ma czytelniejszy wygląd, lepsze karty statusu i przycisk przytrzymania do ważnych akcji.",
					"Artyści mają teraz skrót do panelu bezpośrednio w nagłówku.",
					"Filtry obsługują teraz grupowane i zagnieżdżone opcje, dzięki czemu łatwiej przeglądać listy.",
				],
			},
			v0_7_2: {
				Improved: [
					"Podglądy zleceń ładują się szybciej i wyglądają czytelniej.",
					"Zarchiwizowane zlecenia są teraz skuteczniej ukrywane z listy.",
				],
				Removed: [
					"Usunięto stare dane testowe, które nie były już potrzebne.",
					"Widok posta portfolio jest tymczasowo ukryty, dopóki go przebudowujemy.",
				],
			},
			v0_7_3: {
				Added: [
					'Dodano notatki o "nowych wersjach", żeby szybko sprawdzić, co nowego, co ulepszono i co naprawiono w Familiar.',
				],
			},
			v0_7_4: {
				Improved: [
					'Notatki o "nowych wersjach" obsługują teraz wiele języków, żeby więcej użytkowników mogło śledzić zmiany.',
				],
				Fixed: [
					"Logowanie i rejestracja korzystają teraz z tego samego układu, więc strony wyglądają spójniej.",
				],
			},
			v0_7_5: {
				Added: [
					"Dodano strony [Polityka prywatności](/privacy) i [Regulamin](/tos) do aplikacji.",
				],
				Improved: [
					"Polityka prywatności i Regulamin mają teraz czytelniejszy układ oraz lepszą typografię.",
					"Strony prawne korzystają teraz z tłumaczeń, w tym tytułów, opisów, dat, sekcji i elementów list.",
					"Notatki o wersjach wyglądają teraz lepiej na urządzeniach mobilnych, z układem dającym każdej wersji więcej miejsca.",
					"Stopka jest teraz łatwiejsza w utrzymaniu i zawiera czytelniejsze linki do dokumentów prawnych.",
				],
				Fixed: [
					"Treść notatek o wersjach nie jest już ściskana w wąskich kolumnach na małych ekranach.",
					"Sekcje dokumentów prawnych renderują się teraz poprawnie z tłumaczeń.",
					"Treści Markdown na stronach prawnych nie tworzą już niepoprawnych, zagnieżdżonych akapitów.",
				],
			},
			v0_8_1: {
				Improved: [
					"Ujednolicono wygląd i walidację formularzy logowania, rejestracji oraz edycji profilu.",
					"Odświeżono układ profilu, informacje o użytkowniku, linki społecznościowe i opcje edycji.",
				],
				Fixed: [
					"Poprawiono odstępy profilu na urządzeniach mobilnych i zmniejszono pustą przestrzeń nad pustym portfolio.",
					"Na telefonach zastąpiono przyciski filtrowania, tworzenia folderu i dodawania posta kompaktowymi ikonami, zachowując miejsce na wyszukiwanie.",
					"Dopasowano formularz logowania i ilustrację do wysokości strony oraz usunięto zbędne przewijanie na komputerach.",
					"Naprawiono zapętlone przekierowanie podczas otwierania profilu użytkownika.",
				],
			},
			v0_8_0: {
				Added: [
					"Dodano moduł Sklepu z możliwością przeglądania, kategoriami i filtrowaniem przedmiotów.",
					"Dodano szczegółowe okno przedmiotu w sklepie z opcją dodania do koszyka.",
					"Dodano rozwijany Koszyk w nagłówku i dedykowaną stronę realizacji zamówienia (Checkout).",
				],
			},
		},
	},
	privacyPolicy: {
		title: "Polityka prywatności",
		eyebrow: "Dokument prawny",
		description:
			"Dowiedz się, jak Familiar zbiera, wykorzystuje i chroni Twoje informacje.",
		effectiveDateLabel: "Data obowiązywania",
		effectiveDate: "2026-06-07",
		sections: [
			{
				title: "Wprowadzenie",
				body: [
					"Familiar to platforma społecznościowa dla artystów, klientów i społeczności kreatywnych. Ta Polityka prywatności wyjaśnia, jakie informacje zbieramy, jak ich używamy i jakie masz możliwości kontroli.",
					"Korzystając z Familiar, akceptujesz zasady opisane w tej polityce.",
				],
			},
			{
				title: "Informacje, które zbieramy",
				body: [
					"Zbieramy informacje, które przekazujesz bezpośrednio podczas tworzenia konta, edycji profilu, publikowania treści, składania zleceń lub kontaktu z nami.",
				],
				items: [
					"Informacje o koncie, takie jak email, nazwa użytkownika, nazwa wyświetlana i typ konta.",
					"Informacje profilowe, takie jak avatar, bio, oznaczenia języków, portfolio i publiczne linki.",
					"Treści, które przesyłasz lub udostępniasz, takie jak posty, obrazy, szczegóły zleceń i wiadomości związane z zapytaniami.",
					"Informacje techniczne, takie jak typ urządzenia, przeglądarka, adres IP, dane sesji i podstawowe logi użycia.",
				],
			},
			{
				title: "Jak używamy Twoich informacji",
				body: [
					"Używamy Twoich informacji, aby dostarczać, zabezpieczać, rozwijać i personalizować Familiar.",
				],
				items: [
					"Do tworzenia i obsługi Twojego konta.",
					"Do wyświetlania profilu, portfolio, postów i informacji o zleceniach.",
					"Do obsługi zapytań o zlecenia i powiązanych działań.",
					"Do ochrony platformy przed nadużyciami, spamem, oszustwami i nieautoryzowanym dostępem.",
					"Do poprawy wydajności, dostępności i wygody korzystania z platformy.",
					"Do kontaktu w sprawie ważnych aktualizacji konta, bezpieczeństwa lub działania usługi.",
				],
			},
			{
				title: "Treści publiczne",
				body: [
					"Niektóre informacje w Familiar są publiczne z założenia. Może to obejmować nazwę użytkownika, nazwę wyświetlaną, avatar, stronę profilu, portfolio, publiczne posty, listy zleceń i inne treści, które zdecydujesz się opublikować.",
					"Nie udostępniaj prywatnych lub wrażliwych informacji w publicznych częściach platformy.",
				],
			},
			{
				title: "Pliki cookie i podobne technologie",
				body: [
					"Familiar może używać plików cookie, pamięci lokalnej i podobnych technologii, aby utrzymać zalogowanie, zapamiętać preferencje, poprawić bezpieczeństwo i zrozumieć sposób korzystania z platformy.",
				],
			},
			{
				title: "Jak udostępniamy informacje",
				body: [
					"Nie sprzedajemy Twoich danych osobowych. Możemy udostępniać ograniczone informacje tylko wtedy, gdy jest to potrzebne do działania Familiar, spełnienia obowiązków prawnych, ochrony użytkowników lub korzystania z zaufanych dostawców usług.",
				],
				items: [
					"Dostawcom usług, którzy pomagają nam hostować, zabezpieczać, analizować lub obsługiwać platformę.",
					"Organom lub stronom prawnym, gdy wymagają tego przepisy albo ważna procedura prawna.",
					"Innym użytkownikom, gdy publikujesz treści lub korzystasz z funkcji publicznych.",
				],
			},
			{
				title: "Przechowywanie danych",
				body: [
					"Przechowujemy Twoje informacje tak długo, jak jest to potrzebne do działania Familiar, spełnienia obowiązków prawnych, rozwiązywania sporów, zapobiegania nadużyciom i egzekwowania naszych zasad.",
					"Gdy informacje nie są już potrzebne, usuwamy je lub anonimizujemy tam, gdzie jest to rozsądnie możliwe.",
				],
			},
			{
				title: "Twoje wybory i prawa",
				body: [
					"W zależności od Twojej lokalizacji możesz mieć prawo do dostępu, poprawienia, usunięcia, eksportu lub ograniczenia używania swoich danych osobowych.",
				],
				items: [
					"Część informacji o koncie i profilu możesz zaktualizować bezpośrednio w ustawieniach.",
					"Możesz poprosić o usunięcie lub poprawienie wybranych danych osobowych.",
					"Możesz skontaktować się z nami w sprawach dotyczących prywatności.",
				],
			},
			{
				title: "Bezpieczeństwo",
				body: [
					"Stosujemy rozsądne środki techniczne i organizacyjne, aby chronić Twoje informacje. Żadna usługa internetowa nie może jednak zagwarantować pełnego bezpieczeństwa.",
				],
			},
			{
				title: "Prywatność dzieci",
				body: [
					"Familiar nie jest przeznaczony dla dzieci poniżej minimalnego wieku wymaganego przez obowiązujące prawo. Jeśli dowiemy się, że zebraliśmy dane dziecka bez odpowiedniej zgody, podejmiemy właściwe kroki w celu ich usunięcia.",
				],
			},
			{
				title: "Zmiany w tej polityce",
				body: [
					"Możemy od czasu do czasu aktualizować tę Politykę prywatności. Przy ważnych zmianach zaktualizujemy datę obowiązywania i możemy powiadomić użytkowników przez platformę.",
				],
			},
			{
				title: "Kontakt",
				body: [
					"Jeśli masz pytania dotyczące tej Polityki prywatności, możesz skontaktować się z zespołem Familiar przez oficjalne kanały wsparcia lub kontaktu dostępne na platformie.",
				],
			},
		],
	},
	termsOfService: {
		title: "Regulamin",
		eyebrow: "Dokument prawny",
		description: "Przeczytaj te warunki uważnie przed korzystaniem z Familiar.",
		effectiveDateLabel: "Data obowiązywania",
		effectiveDate: "2026-06-07",
		sections: [
			{
				title: "Wprowadzenie",
				body: [
					"Ten Regulamin wyjaśnia zasady korzystania z Familiar. Familiar to platforma społecznościowa dla artystów, klientów i społeczności kreatywnych.",
					"Tworząc konto lub korzystając z Familiar, akceptujesz ten Regulamin. Jeśli się z nim nie zgadzasz, nie korzystaj z platformy.",
				],
			},
			{
				title: "Konta",
				body: [
					"Do korzystania z części funkcji Familiar może być wymagane konto. Odpowiadasz za bezpieczeństwo danych logowania oraz za wszystkie działania wykonywane przez Twoje konto.",
				],
				items: [
					"Podczas tworzenia konta musisz podać prawidłowe informacje.",
					"Nie możesz podszywać się pod inną osobę, markę, artystę ani organizację.",
					"Nie możesz sprzedawać, przekazywać ani udostępniać dostępu do konta bez zgody.",
					"Musisz skontaktować się z nami, jeśli uważasz, że ktoś uzyskał nieautoryzowany dostęp do Twojego konta.",
				],
			},
			{
				title: "Treści użytkownika",
				body: [
					"Zachowujesz prawa własności do treści, które tworzysz i przesyłasz do Familiar. Publikując treści na platformie, pozwalasz nam jednak wyświetlać, przechowywać, przetwarzać i udostępniać je w zakresie potrzebnym do działania Familiar.",
					"Odpowiadasz za upewnienie się, że masz prawa do przesyłania i udostępniania swoich treści.",
				],
				items: [
					"Nie możesz przesyłać treści naruszających prawa innych osób.",
					"Nie możesz przesyłać treści nielegalnych, obraźliwych, nienawistnych, szkodliwych ani wprowadzających w błąd.",
					"Nie możesz przesyłać treści naruszających zasady społeczności lub polityki platformy.",
				],
			},
			{
				title: "Usługi artystów i zlecenia",
				body: [
					"Familiar może umożliwiać artystom i klientom komunikację dotyczącą zleceń, zapytań, portfolio i powiązanych usług.",
					"O ile nie wskazano wyraźnie inaczej, Familiar nie jest stroną indywidualnych ustaleń między artystami i klientami. Artyści i klienci odpowiadają za jasne określenie oczekiwań, cen, terminów, licencji i zasad dostawy.",
				],
				items: [
					"Artyści odpowiadają za rzetelne opisywanie swoich usług.",
					"Klienci odpowiadają za przeczytanie szczegółów usługi przed wysłaniem zapytania.",
					"Obie strony odpowiadają za przestrzeganie uzgodnionych zasad, licencji i ustaleń płatniczych.",
				],
			},
			{
				title: "Dozwolone korzystanie",
				body: [
					"Zobowiązujesz się korzystać z Familiar w sposób bezpieczny, zgodny z prawem i szanujący innych użytkowników.",
				],
				items: [
					"Nie możesz używać Familiar do spamu, oszustw, wyłudzeń, nękania ani nadużyć.",
					"Nie możesz próbować zakłócać, przeciążać, scrapować, odtwarzać kodu ani atakować platformy.",
					"Nie możesz omijać zabezpieczeń, kontroli dostępu, blokad ani ograniczeń konta.",
					"Nie możesz używać Familiar do rozpowszechniania malware lub szkodliwych linków.",
				],
			},
			{
				title: "Moderacja treści",
				body: [
					"Możemy sprawdzać, ukrywać, ograniczać, usuwać lub zgłaszać treści, jeśli uznamy, że naruszają ten Regulamin, nasze polityki, prawo albo bezpieczeństwo platformy.",
					"Możemy również zawiesić lub zakończyć działanie kont, które łamią zasady albo tworzą ryzyko dla Familiar, użytkowników lub społeczności.",
				],
			},
			{
				title: "Własność intelektualna",
				body: [
					"Familiar, w tym jego projekt, branding, interfejs, oprogramowanie i funkcje platformy, jest chroniony przepisami dotyczącymi własności intelektualnej. Nie możesz kopiować, modyfikować, rozpowszechniać ani nadużywać materiałów należących do Familiar bez zgody.",
					"Treści przesyłane przez użytkowników należą do odpowiednich użytkowników lub właścicieli praw, chyba że wskazano inaczej.",
				],
			},
			{
				title: "Usługi zewnętrzne",
				body: [
					"Familiar może korzystać z usług zewnętrznych do hostingu, uwierzytelniania, płatności, analityki, przechowywania danych lub innych funkcji platformy. Te usługi mogą mieć własne regulaminy i polityki prywatności.",
				],
			},
			{
				title: "Dostępność i zmiany",
				body: [
					"Staramy się, aby Familiar był dostępny i niezawodny, ale nie możemy zagwarantować, że platforma zawsze będzie działała bez przerw, błędów lub ograniczeń dostępności.",
					"Możemy aktualizować, zmieniać, zawieszać lub usuwać funkcje w dowolnym momencie, szczególnie gdy jest to potrzebne ze względów bezpieczeństwa, konserwacji, zgodności z prawem lub rozwoju produktu.",
				],
			},
			{
				title: "Zastrzeżenia",
				body: [
					"Familiar jest udostępniany w stanie takim, w jakim jest, oraz w miarę dostępności. W najszerszym zakresie dozwolonym przez prawo nie udzielamy gwarancji dotyczących nieprzerwanego dostępu, pełnego bezpieczeństwa, przydatności do konkretnego celu ani dokładności treści użytkowników.",
				],
			},
			{
				title: "Ograniczenie odpowiedzialności",
				body: [
					"W najszerszym zakresie dozwolonym przez prawo Familiar i jego zespół nie ponoszą odpowiedzialności za pośrednie, przypadkowe, szczególne, następcze ani karne szkody związane z korzystaniem z platformy.",
				],
			},
			{
				title: "Zakończenie korzystania",
				body: [
					"Możesz przestać korzystać z Familiar w dowolnym momencie. Możemy zawiesić lub zakończyć dostęp, jeśli naruszysz ten Regulamin, stworzysz ryzyko prawne, zaszkodzisz innym użytkownikom albo nadużyjesz platformy.",
				],
			},
			{
				title: "Zmiany w Regulaminie",
				body: [
					"Możemy od czasu do czasu aktualizować ten Regulamin. Przy ważnych zmianach zaktualizujemy datę obowiązywania i możemy powiadomić użytkowników przez platformę.",
				],
			},
			{
				title: "Kontakt",
				body: [
					"Jeśli masz pytania dotyczące tego Regulaminu, możesz skontaktować się z zespołem Familiar przez oficjalne kanały wsparcia lub kontaktu dostępne na platformie.",
				],
			},
		],
	},
	roadmap: {
		title: "Co dalej w Familiar",
		eyebrow: "Roadmapa",
		description:
			"Prosty podgląd planowanych funkcji i tego, nad czym teraz pracujemy.",
		status: {
			Planned: "Planowane",
			InProgress: "W trakcie",
			Exploring: "Rozważane",
		},
		items: {
			"item-1": {
				title: "Lepszy panel zleceń",
				description:
					"Czytelniejszy panel dla artystów i klientów, który ułatwi zarządzanie zapytaniami o zlecenia.",
				details: [
					"Czytelniejsze karty statusu zapytań.",
					"Lepsze akcje do akceptowania, odrzucania, anulowania i aktualizowania zleceń.",
					"Wygodniejszy układ mobilny do zarządzania zleceniami na mniejszych ekranach.",
				],
			},
			"item-2": {
				title: "Ulepszone posty portfolio",
				description:
					"Posty portfolio wrócą z czytelniejszym widokiem szczegółów i lepszą obsługą udostępniania.",
				details: [
					"Lepsze strony postów dla prac i przykładów zleceń.",
					"Czytelniejsze wyświetlanie obrazów i podglądów.",
					"Ulepszone linki do udostępniania postów portfolio.",
				],
			},
			"item-3": {
				title: "Powiadomienia",
				description:
					"Rozważamy powiadomienia, które pomogą użytkownikom śledzić ważną aktywność bez ręcznego sprawdzania każdej strony.",
				details: [
					"Aktualizacje dotyczące zmian w zapytaniach o zlecenia.",
					"Możliwe powiadomienia o profilach, obserwacjach i aktywności.",
					"Proste centrum powiadomień w aplikacji.",
				],
			},
		},
		axis: {
			year: "Rok",
		},
	},
	commissions: {
		"create-new": "Utwórz ofertę",
	},
	commission_request_from: "Od",
	common: {
		cancel: "Anuluj",
		save_changes: "Zapisz zmiany",
	},
	support: {
		features: {
			animated_avatar: {
				title: "Animowane awatary",
				description:
					"Ustaw GIF lub animowany obraz jako awatar i ożyw swój profil w Familiar.",
			},
			animated_cover: {
				title: "Animowane zdjęcia w tle",
				description:
					"Dodaj ruch do nagłówka profilu za pomocą animowanego zdjęcia w tle pasującego do Twojego stylu.",
			},
			colored_folders: {
				title: "Kolorowe foldery",
				description:
					"Nadaj każdemu folderowi portfolio własny kolor, aby łatwiej rozpoznawać i porządkować kolekcje.",
			},
			profile_palettes: {
				title: "Palety kolorów profilu",
				description:
					"Stosuj spójne palety akcentów w kontrolkach profilu, wyróżnieniach i drobnych elementach interfejsu.",
			},
			folder_icons: {
				title: "Ikony folderów",
				description:
					"Wybierz symbol dla każdego folderu, aby nadać kolekcjom portfolio własny charakter.",
			},
			portfolio_accents: {
				title: "Akcenty portfolio",
				description:
					"Dodaj subtelne akcenty wizualne do wyróżnionych prac bez zmieniania sposobu działania portfolio.",
			},
			eyebrow: "Personalizacja wyglądu",
			title: "Więcej sposobów na własny styl w Familiar.",
			description:
				"Dodatki dla wspierających zmieniają wyłącznie wygląd. Portfolio, oferty, czat, odkrywanie twórców i wszystkie funkcje Familiar pozostają dostępne dla każdego.",
			status: {
				confirmed: "Potwierdzone",
				soon: "Wkrótce",
			},
		},
		faq: {
			subscription: {
				question: "Jak działają opcje płatności?",
				answer:
					"Wsparcie miesięczne i roczne odnawia się automatycznie. Wsparcie dożywotnie to jednorazowa płatność bez odnowień.",
			},
			access: {
				question: "Czy zwykłe funkcje Familiar staną się płatne?",
				answer:
					"Nie. Funkcje platformy pozostają dostępne dla wszystkich. Wspierający otrzymują wyłącznie opcje personalizacji wyglądu.",
			},
			features: {
				question: "Które funkcje wizualne są potwierdzone?",
				answer:
					"Potwierdzone są animowane awatary, animowane zdjęcia w tle i kolorowe foldery. Pozostałe przedstawione opcje to pomysły na późniejsze wydania.",
			},
			title: "Pytania o wsparcie",
		},
		plans: {
			monthly: {
				label: "Miesięcznie",
				interval: "/ miesiąc",
				description:
					"Elastyczne, odnawialne wsparcie z dostępem do dodatków wizualnych przez okres aktywności planu.",
				action: "Wspieraj co miesiąc",
			},
			yearly: {
				label: "Rocznie",
				interval: "/ rok",
				description:
					"Jedno odnowienie rocznie, te same dodatki wizualne i niższy koszt w przeliczeniu na miesiąc.",
				action: "Wspieraj co rok",
			},
			lifetime: {
				label: "Dożywotnio",
				interval: "jednorazowo",
				description:
					"Jednorazowa płatność, która na stałe odblokowuje personalizację wyglądu na Twoim koncie.",
				action: "Wspieraj dożywotnio",
			},
			eyebrow: "Opcje wsparcia",
			title: "Wybierz, jak chcesz wspierać Familiar",
			description:
				"Każda opcja odblokowuje te same dodatki wizualne. Wybierz wsparcie cykliczne lub jednorazowy wkład dożywotni.",
			disclaimer:
				"To wczesna makieta. Ceny i planowane dodatki wizualne mogą się zmienić przed uruchomieniem płatności.",
			label: "Dostęp dla wspierających",
		},
		checkout: {
			mock: "Płatności nie są jeszcze dostępne w tej makiecie.",
		},
		eyebrow: "Wesprzyj Familiar",
		hero: {
			title: "Pomóż nam stworzyć lepsze miejsce dla artystów.",
			description:
				"Tworzymy Familiar, aby dzielenie się sztuką i współpraca z klientami były bardziej przyjazne. Twoje wsparcie pomaga nam niezależnie rozwijać platformę.",
			cta: "Zobacz opcje wsparcia",
		},
	},
	ui: {
		add_to_portfolio: "Dodaj do portfolio",
		empty_portfolio_owner_description:
			"Udostępnij pierwszą pracę lub uporządkuj portfolio za pomocą folderu.",
		no_warnings_found: "Nie znaleziono ostrzeżeń.",
		no_folders_found: "Nie znaleziono folderów.",
		portfolio_creation_unavailable:
			"Tworzenie portfolio jest dostępne dla kont artystów.",
		account_type: "Rodzaj konta",
		username: "nazwa użytkownika",
		close: "Zamknij",
		reset_your_password: "Zresetuj hasło",
		sign_in_to_share_your_work_and_follow_creators:
			"Zaloguj się, aby udostępniać swoje prace i obserwować twórców.",
		sign_in: "Zaloguj się",
		sign_up: "Zarejestruj się",
		basket: "Koszyk",
		item: "przedmiot",
		from: "od",
		subtotal: "Suma częściowa",
		sales_tax_calculated_at_checkout:
			"Podatek zostanie obliczony przy płatności",
		checkout: "Przejdź do płatności",
		open_commission_request: "Otwórz zapytanie o zlecenie",
		commission_request: "Zapytanie o zlecenie #",
		commission_request_7fac7a: "Zapytanie o zlecenie",
		request_lookup_failed: "Nie udało się wczytać zapytania",
		your_messages: "Twoje wiadomości",
		requests: "Zapytania",
		could_not_load_conversations: "Nie udało się wczytać rozmów.",
		search_messages: "Szukaj wiadomości...",
		file_attachment: "Załącznik",
		message: "Wiadomość",
		selected_media: "Wybrane multimedia",
		attach_media: "Dodaj multimedia",
		write_a_message_or_attach_media: "Napisz wiadomość lub dodaj multimedia...",
		send_message: "Wyślij wiadomość",
		new_messages: "Nowe wiadomości",
		media: "Multimedia",
		review: "Sprawdź",
		active: "Aktywne",
		paused: "Wstrzymane",
		draft: "Szkic",
		delete_commission: "Usuń ofertę",
		step: "Krok",
		of: "z",
		title: "Tytuł",
		portrait_commission: "Zlecenie portretu",
		category: "Kategoria",
		search_category: "Szukaj kategorii...",
		no_category_found: "Nie znaleziono kategorii.",
		back: "Wstecz",
		main_category: "Główna kategoria",
		base_price: "Cena podstawowa",
		currency: "Waluta",
		form_template: "Szablon formularza",
		choose_a_form_template_that_clients_will_fill_out_when_requesting_this_comm:
			"Wybierz szablon formularza, który klienci wypełnią przy składaniu zapytania o to zlecenie.",
		edit_template: "Edytuj szablon",
		select_a_form_template: "Wybierz szablon formularza",
		none: "Brak",
		description: "Opis",
		tags: "Tagi",
		general_tags: "Tagi ogólne",
		content_warnings: "Ostrzeżenia o treści",
		cw: "Ostrzeżenia:",
		show_your_best_work: "Pokaż swoje najlepsze prace",
		the_first_image_is_used_as_the_gallery_thumbnail_upload_up_to_10_images_dra:
			"Pierwszy obraz jest miniaturą w galerii. Dodaj maksymalnie 10 obrazów i przeciągnij je, aby zmienić kolejność. W trybie edycji zobaczysz tutaj dodane wcześniej multimedia.",
		drag_and_drop_or_click_to_upload:
			"Przeciągnij i upuść pliki lub kliknij, aby je dodać",
		existing_media_is_loaded_here_in_edit_mode:
			"W trybie edycji zobaczysz tutaj dodane wcześniej multimedia.",
		media_items: "Multimedia (",
		drag_to_reorder: "Przeciągnij, aby zmienić kolejność",
		add_more: "Dodaj więcej",
		summary: "Podsumowanie",
		price: "Cena",
		items: "przedmiotów",
		template: "Szablon",
		before_publishing: "Przed publikacją",
		review_before_publishing: "Sprawdź przed publikacją",
		once_published_your_listing_will_be_visible_to_all_users_you_can_pause_or_e:
			"Po opublikowaniu oferta będzie widoczna dla wszystkich użytkowników. Możesz ją w każdej chwili wstrzymać lub edytować.",
		continue: "Dalej",
		required: "Wymagane *",
		select_date: "Wybierz datę",
		choose_1: "(Wybierz 1)",
		select_an_option: "Wybierz opcję",
		please_specify: "Podaj szczegóły...",
		option_label: "Nazwa opcji",
		value: "Wartość",
		price_mod: "Zmiana ceny",
		no_price: "Bez dopłaty",
		fixed: "Kwota (+)",
		percent: "Procent (+%)",
		delete_option: "Usuń opcję",
		are_you_sure_you_want_to_delete_the_option:
			"Czy na pewno chcesz usunąć opcję",
		this_action_cannot_be_undone: "? Tej operacji nie można cofnąć.",
		required_field: "Pole wymagane",
		delete_field: "Usuń pole",
		options: "Opcje",
		add_option: "Dodaj opcję",
		define_the_fields_that_clients_must_fill_out_when_requesting_a_commission:
			"Określ pola, które klienci muszą wypełnić przy składaniu zapytania o zlecenie.",
		template_name: "Nazwa szablonu",
		cancel: "Anuluj",
		saving: "Zapisywanie…",
		add_field: "Dodaj pole",
		form_fields: "Pola formularza (",
		preview: "Podgląd",
		no_fields_added_yet: "Nie dodano jeszcze żadnych pól.",
		click_add_field_to_start_building_your_form:
			"Kliknij „Dodaj pole”, aby rozpocząć tworzenie formularza.",
		quick_math: "Szybka kalkulacja",
		internal_reference_use_only: "Wyłącznie do użytku wewnętrznego",
		from_service: "Z oferty",
		savings: "Oszczędzasz",
		off: "% rabatu",
		project_subtotal: "Suma częściowa projektu",
		for_all_services: "Dla wszystkich ofert",
		note_that_this_is_an_auto_generated_estimate_based_on_your_request_and_shou:
			"To automatyczna wycena na podstawie Twojego zapytania. Nie jest to cena ostateczna.",
		commissions_requests: "Zapytania o zlecenia",
		services: "Oferty",
		shop: "Sklep",
		dashboard: "Panel artysty",
		go_to_my_profile: "Przejdź do mojego profilu",
		commissions: "Zlecenia",
		pipeline: "Przebieg realizacji",
		terms_of_service_not_available: "Warunki świadczenia usług są niedostępne.",
		your_name: "Twoje imię",
		name_nickname: "Imię / pseudonim",
		your_email: "Twój adres e-mail",
		your_email_com: "twoj@email.pl",
		verify_email: "Zweryfikuj e-mail",
		references_and_files: "Materiały referencyjne i pliki",
		character_reference_sheets_psd_for_rigging_mood_boards_etc:
			"Karty postaci, pliki PSD do rigowania, tablice inspiracji itp.",
		link_a_file: "Dodaj link do pliku",
		upload_file: "Prześlij plik",
		extra_info: "Dodatkowe informacje",
		pose_traits_multiple_characters_add_ons_etc:
			"Poza, cechy, wiele postaci, dodatki itp.",
		your_answer: "Twoja odpowiedź",
		i_understand_that_submitting_this_request_does_not_guarantee_that:
			"Rozumiem, że złożenie tego zapytania nie gwarantuje, że",
		will_accept_my_commission: "przyjmie moje zlecenie",
		i_agree_to_receive_marketing_emails:
			"Zgadzam się na otrzymywanie e-maili marketingowych",
		estimated_total: "Szacowana suma:",
		request_as_guest_or_sign_up_to:
			"Złóż zapytanie jako gość lub zarejestruj się, aby:",
		track_requests: "Śledzić zapytania",
		follow_artists: "Obserwować artystów",
		priority_support: "Korzystać z priorytetowej pomocy",
		sign_up_login: "Zarejestruj się / zaloguj",
		by_submitting_a_request_you_agree_to_terms_of_service_and_acknowledge_you_v:
			"Składając zapytanie, akceptujesz warunki świadczenia usług i potwierdzasz zapoznanie się z polityką prywatności.",
		commission_request_b8445a: "Zapytanie o zlecenie",
		fill_out_the_form_to_request_a_commission_from:
			"Wypełnij formularz, aby zapytać o zlecenie od",
		final_delivery: "Przekazanie pracy",
		personal: "Osobista",
		accepted: "Zaakceptowane",
		set_to_wip: "Rozpocznij realizację",
		final_delivery_d8af9e: "Przekazanie pracy",
		no_delivery_files_were_attached_yet:
			"Nie dodano jeszcze plików do przekazania.",
		help: "Pomoc",
		submitted: "Złożono",
		overview: "Przegląd",
		enjoyed_the_result: "Podoba Ci się efekt?",
		invoice: "Faktura",
		archive_this_request: "Zarchiwizuj to zapytanie",
		hold_to_archive: "Przytrzymaj, aby zarchiwizować",
		client: "Klient",
		artist: "Artysta",
		unknown: "Nieznany",
		profile_data_is_not_available: "Dane profilu są niedostępne.",
		description_3583fc: "opis",
		back_88c197: "← Wstecz",
		allowed_uses: "Dozwolone zastosowania",
		download_all_files: "Pobierz wszystkie pliki",
		file: "Plik",
		attached_media_ready_to_preview:
			"Załączone multimedia · gotowe do podglądu",
		delivery_update: "Aktualizacja przekazania pracy",
		latest_update: "Ostatnia aktualizacja",
		verified_media: "Zweryfikowane multimedia",
		respecting_any_applicable_privacy_arrangements_the_artist_can_submit_media_:
			"Z zachowaniem ustaleń dotyczących prywatności artysta może tutaj dodać multimedia przedstawiające Twoje zlecenie.",
		tagged_characters: "Oznaczone postacie",
		your_commission_s_verified_media_may_be_publicly_featured_in_the_gallery_of:
			"Zweryfikowane multimedia Twojego zlecenia mogą być publicznie prezentowane w galerii oznaczonych przez Ciebie postaci.",
		add: "Dodaj",
		you_may_remove_or_tag_characters_whenever_you_please_as_long_as_the_charact:
			"Możesz w dowolnym momencie dodawać lub usuwać oznaczenia postaci, jeśli ich opiekun na to zezwala.",
		request_details: "Szczegóły zapytania",
		this_review_is_now_visible_to_artists_when_you_submit_a_commission_request:
			"Ta opinia będzie widoczna dla artystów, gdy złożysz zapytanie o zlecenie.",
		recommend: "Polecam",
		recent: "Najnowsze",
		difficulties: "Trudności:",
		anonymize_semi_public_review:
			"Zanonimizuj opinię widoczną dla części użytkowników",
		your_feedback_helps_make_the_platform_safer_for_everyone:
			"Twoja opinia pomaga zwiększyć bezpieczeństwo wszystkich użytkowników platformy.",
		no_image: "Brak obrazu",
		commission_listing_selected_by_the_client: "Oferta wybrana przez klienta",
		starting_at: "Od",
		licence: "Licencja",
		request_id: "Identyfikator zapytania",
		client_brief: "Opis od klienta",
		references_and_files_f7d356: "Materiały referencyjne i pliki",
		preview_unavailable: "Podgląd jest niedostępny",
		open_original_file: "Otwórz oryginalny plik",
		download_file: "Pobierz plik",
		no_references_attached: "Nie dodano materiałów referencyjnych.",
		more: "Więcej",
		categories: "Kategorie",
		select_categories: "Wybierz kategorie...",
		warnings: "Ostrzeżenia",
		select_warnings: "Wybierz ostrzeżenia...",
		catalogs: "Foldery",
		select_catalogs: "Wybierz foldery...",
		create_portfolio_folder: "Utwórz folder portfolio",
		create_folder: "Utwórz folder",
		new_portfolio_catalog: "Nowy folder portfolio",
		group_related_portfolio_posts_into_one_catalog:
			"Zgrupuj powiązane posty portfolio w jednym folderze.",
		folder_name: "Nazwa folderu *",
		character_illustrations: "Ilustracje postaci",
		a_selected_collection_of_finished_character_artwork:
			"Wybrana kolekcja ukończonych ilustracji postaci.",
		optional_you_can_edit_this_later: "Opcjonalne. Możesz to później zmienić.",
		rename_portfolio_folder: "Zmień nazwę folderu portfolio",
		rename_folder: "Zmień nazwę folderu",
		update_the_name_and_description_of_this_portfolio_catalog:
			"Zmień nazwę i opis tego folderu portfolio.",
		folder_name_898add: "Nazwa folderu",
		optional_leave_this_empty_to_remove_the_current_description:
			"Opcjonalne. Pozostaw puste, aby usunąć obecny opis.",
		loading_shop_item: "Wczytywanie przedmiotu ze sklepu...",
		follow: "Obserwuj",
		"1_review": "• 1 opinia",
		sold: "sprzedano",
		how_much_would_you_like_to_pay: "Ile chcesz zapłacić?",
		"25_72_or_more": "25,72 lub więcej",
		was: "Wcześniej",
		off_1a3fb5: "% rabatu)",
		suggests: "proponuje",
		read_more: "Czytaj więcej",
		buy_now: "Kup teraz",
		add_to_basket: "Dodaj do koszyka",
		more_options: "Więcej opcji",
		view_details: "Zobacz szczegóły",
		profile: "Profil",
		orders: "Zamówienia",
		characters: "Postacie",
		settings: "Ustawienia",
		logout: "Wyloguj się",
		user_menu: "Menu użytkownika",
		no_characters_found: "Nie znaleziono postaci",
		status: "Status",
		not_found: "Nie znaleziono",
		manage_folder: "Zarządzaj folderem",
		reviews: "opinii)",
		reviews_8ff41b: "opinii",
		loading_artist: "Wczytywanie artysty…",
		loading_client: "Wczytywanie klienta…",
		payment: "Płatność",
		confirmed: "Potwierdzone",
		timeline: "Oś czasu",
		showing: "Wyświetlanie",
		requests_8f5fc4: "zapytań",
		page: "Strona",
		refreshing: "Odświeżanie",
		no_requests_found: "Nie znaleziono zapytań",
		pending: "Oczekujące",
		paid: "Opłacone",
		failed: "Nieudane",
		refunded: "Zwrócone",
		in_progress: "W realizacji",
		delivered: "Przekazane",
		completed: "Ukończone",
		cancelled: "Anulowane",
		base_price_11973a: "Cena podstawowa",
		created: "Utworzono",
		publish: "Opublikuj",
		view_page: "Zobacz stronę",
		delete: "Usuń",
		services_35105e: "ofert",
		no_services_found_create_one_to_get_started:
			"Nie znaleziono ofert. Utwórz pierwszą, aby rozpocząć!",
		see_all: "Zobacz wszystkie",
		selected: "zaznaczono",
		no_results_found: "Brak wyników.",
		clear_filters: "Wyczyść filtry",
		asc: "Rosnąco",
		desc: "Malejąco",
		pin_to_left: "Przypnij z lewej",
		pin_to_right: "Przypnij z prawej",
		move_to_left: "Przesuń w lewo",
		move_to_right: "Przesuń w prawo",
		columns: "Kolumny",
		toggle_columns: "Widoczność kolumn",
		select_row: "Zaznacz wiersz",
		select_all: "Zaznacz wszystko",
		breadcrumb: "Ścieżka nawigacji",
		carousel: "Karuzela",
		previous_slide: "Poprzedni slajd",
		next_slide: "Następny slajd",
		increase_value: "Zwiększ wartość",
		decrease_value: "Zmniejsz wartość",
		pagination: "Nawigacja po stronach",
		go_to_previous_page: "Przejdź do poprzedniej strony",
		previous: "Poprzednia",
		go_to_next_page: "Przejdź do następnej strony",
		next: "Następna",
		more_pages: "Więcej stron",
		sidebar: "Panel boczny",
		displays_the_mobile_sidebar: "Wyświetla mobilny panel boczny.",
		toggle_sidebar: "Przełącz panel boczny",
		loading: "Wczytywanie",
		create_commission: "Utwórz ofertę",
		form_templates: "Szablony formularzy",
		new_template: "Nowy szablon",
		no_templates_yet: "Brak szablonów",
		start_by_creating_a_reusable_request_form_for_portraits_emotes_illustration:
			"Zacznij od utworzenia formularza wielokrotnego użytku do portretów, emotek, ilustracji, kart postaci lub innych zleceń.",
		create_template: "Utwórz szablon",
		no_matching_templates: "Brak pasujących szablonów",
		try_a_different_search_phrase_or_change_sorting:
			"Spróbuj innego wyszukiwania lub zmień sortowanie.",
		updated: "Zaktualizowano",
		more_333b55: "więcej",
		no_fields_yet: "Brak pól",
		edit: "Edytuj",
		delete_template: "Usuń szablon",
		on_hold: "Wstrzymane",
		archived: "Zarchiwizowane",
		service: "Oferta",
		archive_service: "Zarchiwizuj ofertę",
		from_218bca: "Od",
		my_basket: "Mój koszyk",
		"1_item": "1 przedmiot •",
		remove_all: "Usuń wszystko",
		note_to_artist: "Wiadomość do artysty",
		optional: "Opcjonalne",
		leave_an_important_note_say_thanks_or_just_say_something_nice_to_the_artist:
			"Zostaw ważną informację, podziękuj lub napisz artyście coś miłego!",
		more_from: "Więcej od",
		s_shop: "— sklep",
		no_more_items: "Brak innych przedmiotów",
		your_name_7b44f2: "Twoje imię*",
		enter_your_name: "Wpisz swoje imię",
		your_email_35787b: "Twój adres e-mail*",
		enter_your_email: "Wpisz swój adres e-mail",
		email_is_not_shared_with_anyone_only_used_by_familiar_for_order_updates:
			"Adres e-mail NIE jest nikomu udostępniany. Familiar używa go wyłącznie do powiadomień o zamówieniach.",
		for_all_items: "Dla wszystkich przedmiotów",
		due_now: "Do zapłaty teraz",
		currency_conversion_fees_may_apply:
			"Mogą zostać naliczone opłaty za przewalutowanie",
		pay_with_mollie: "Zapłać przez Mollie",
		by_purchasing_this_item_you_agree_to_familiar_s:
			"Kupując ten przedmiot, akceptujesz",
		terms_of_service: "Warunki świadczenia usług",
		and_acknowledge_our: "oraz potwierdzasz zapoznanie się z dokumentem",
		privacy_policy: "Polityka prywatności",
		logging_out: "Wylogowywanie…",
		could_not_load_your_requests: "Nie udało się wczytać Twoich zapytań",
		back_to_shop: "Wróć do sklepu",
		category_not_found: "Nie znaleziono kategorii",
		loading_items: "Wczytywanie przedmiotów...",
		no_items_in_this_category: "Brak przedmiotów w tej kategorii",
		loading_shop_items: "Wczytywanie przedmiotów w sklepie...",
		no_items_found: "Nie znaleziono przedmiotów",
		in_folder: "w folderze",
		user_not_found: "Nie znaleziono użytkownika",
		folder_not_found_for_tab: "Nie znaleziono folderu w tej zakładce",
		portfolio_folder_not_found: "Nie znaleziono folderu portfolio",
		could_not_load_profile_content: "Nie udało się wczytać zawartości profilu",
		tab_not_found: "Nie znaleziono zakładki",
		website: "Strona internetowa",
		select_a_conversation_to_start_chatting:
			"Wybierz rozmowę, aby rozpocząć czat.",
		dms: "Prywatne",
		no_messages_yet: "Brak wiadomości",
		no_request_chats_found: "Brak zapytań",
		no_direct_messages_found: "Brak rozmów",
		check_console_for_more_details: "Więcej szczegółów znajdziesz w konsoli.",
		details: "Szczegóły",
		title_pricing_category_forms: "Tytuł, cena, kategoria i formularze",
		showcase_your_work: "Zaprezentuj swoje prace",
		review_and_publish: "Sprawdź i opublikuj",
		edit_commission: "Edytuj ofertę",
		new_commission: "Nowa oferta",
		update_your_offering_details: "Zaktualizuj szczegóły swojej oferty",
		set_up_a_new_offering: "Przygotuj nową ofertę",
		existing_media: "Dodane multimedia",
		commission_updated_successfully: "Oferta została zaktualizowana.",
		commission_created_and_published:
			"Oferta została utworzona i opublikowana.",
		create_commission_c13e6f: "Utwórz ofertę",
		edit_your_commission_offering: "Edytuj swoją ofertę zlecenia.",
		create_and_publish_a_commission_offering:
			"Utwórz i opublikuj ofertę zlecenia.",
		select_category: "Wybierz kategorię",
		assigned: "Przypisano",
		title_and_description_are_complete: "Tytuł i opis są uzupełnione",
		at_least_one_media_item_uploaded:
			"Dodano przynajmniej jeden plik multimedialny",
		price_is_set: "Cena jest ustalona",
		save_changes: "Zapisz zmiany",
		publish_commission: "Opublikuj ofertę",
		free: "Bezpłatne",
		included: "W cenie",
		new_field: "Nowe pole",
		unnamed_option: "Opcja bez nazwy",
		are_you_sure_you_want_to_delete_this_field_this_action_cannot_be_undone:
			"Czy na pewno chcesz usunąć to pole? Tej operacji nie można cofnąć.",
		field_label: "Nazwa pola",
		description_help_text: "Opis / tekst pomocniczy",
		minimum_value: "Wartość minimalna",
		maximum_value: "Wartość maksymalna",
		edit_form_template: "Edytuj szablon formularza",
		create_form_template: "Utwórz szablon formularza",
		short_text: "Krótki tekst",
		long_text: "Długi tekst",
		number: "Liczba",
		date: "Data",
		radio_buttons: "Pojedynczy wybór",
		checkboxes: "Wielokrotny wybór",
		dropdown: "Lista rozwijana",
		template_updated_successfully: "Szablon został zaktualizowany",
		template_created_successfully: "Szablon został utworzony",
		portfolio: "Portfolio",
		wallet: "Portfel",
		quests: "Zadania",
		forms: "Formularze",
		policies: "Zasady",
		queue: "Kolejka",
		yes: "Tak",
		no: "Nie",
		preview_mode: "Tryb podglądu",
		request_as_guest: "Zapytaj jako gość",
		request_commission: "Zapytaj o zlecenie",
		commercial_redistribution: "Dystrybucja komercyjna",
		credit_required: "Wymagane oznaczenie autora",
		request_cancelled: "Zapytanie anulowane",
		this_commission_request_is_no_longer_active:
			"To zapytanie o zlecenie nie jest już aktywne.",
		payment_required: "Wymagana płatność",
		accept_request: "Zaakceptuj zapytanie",
		work_in_progress: "W realizacji",
		request_updated: "Zapytanie zaktualizowane",
		check_the_latest_progress_and_details_below:
			"Sprawdź najnowsze postępy i szczegóły poniżej.",
		leave_an_optional_tip_for_the_artist: "Zostaw artyście dobrowolny napiwek.",
		leave_a_tip: "Zostaw napiwek",
		download_a_copy_of_your_payment_invoice:
			"Pobierz kopię faktury za płatność.",
		download_invoice: "Pobierz fakturę",
		hold_the_button_to_archive_this_completed_request:
			"Przytrzymaj przycisk, aby zarchiwizować ukończone zapytanie.",
		client_12f3cb: "klient",
		artist_02df47: "artysta",
		client_accepted_terms: "Warunki zaakceptowane przez klienta",
		accepted_terms: "Zaakceptowane warunki",
		manage_media: "Zarządzaj multimediami",
		report_issue: "Zgłoś problem",
		only_upload_media_that_accurately_represents_the_work_completed_for_this_cl:
			"Dodawaj tylko multimedia, które wiernie przedstawiają pracę wykonaną dla tego klienta.",
		please_report_if_the_media_misrepresents_the_work_completed:
			"Zgłoś problem, jeśli multimedia nie przedstawiają faktycznie wykonanej pracy.",
		no_usage_label_provided: "Nie podano sposobu wykorzystania.",
		no_additional_details_provided: "Nie podano dodatkowych szczegółów.",
		folder_preview: "Podgląd",
		folder_create_failed: "Nie udało się utworzyć folderu.",
		folder_rename_failed: "Nie udało się zmienić nazwy folderu.",
		direct_messages: "Wiadomości prywatne",
		no_conversations_found: "Brak pasujących rozmów",
		folder_name_is_required: "Nazwa folderu jest wymagana.",
		maximum_100_characters: "Maksymalnie 100 znaków.",
		creating: "Tworzenie...",
		renaming: "Zmiana nazwy...",
		new_portfolio_folder: "Nowy folder portfolio",
		commercial_content: "Komercyjna: treści",
		commercial_merchandising: "Komercyjna: produkty",
		digital_download: "Plik do pobrania",
		files_are_instantly_available_after_purchase_returns_and_exchanges_are_not_:
			"Pliki są dostępne od razu po zakupie. Zwroty i wymiany nie są możliwe.",
		no_description_provided: "Nie podano opisu.",
		remove_bookmark: "Usuń z zapisanych",
		save_bookmark: "Zapisz",
		this_user_hasn_t_added_any_characters_yet:
			"Ten użytkownik nie dodał jeszcze żadnych postaci.",
		play_auto: "Włącz automatyczne odtwarzanie",
		pause_auto: "Wstrzymaj automatyczne odtwarzanie",
		no_commissions_found_matching_your_filters:
			"Nie znaleziono ofert pasujących do wybranych filtrów.",
		closed: "Zamknięte",
		successfully_copied_profile_link: "Link do profilu skopiowano do schowka",
		awaiting_review: "Oczekuje na sprawdzenie",
		submitted_date: "Data złożenia",
		mentors: "Mentorzy",
		met_in_person: "Spotkani osobiście",
		no_data_available: "Brak danych",
		loading_2553d2: "Wczytywanie...",
		unpin_row: "Odepnij wiersz",
		pin_row: "Przypnij wiersz",
		carousel_2c6160: "karuzela",
		slide: "slajd",
		scroll_to_end: "Przewiń do końca",
		scroll_to_start: "Przewiń na początek",
		commission_messaging_and_progress_updates:
			"Wiadomości i aktualizacje postępów zlecenia",
		messaging: "Wiadomości",
		delivery_and_revision_workflow: "Przekazywanie prac i obsługa poprawek",
		delivery: "Przekazanie pracy",
		better_artist_and_commission_discovery:
			"Łatwiejsze odkrywanie artystów i ofert",
		discovery: "Odkrywanie",
		reviews_and_completed_work_showcases:
			"Opinie i prezentacja ukończonych prac",
		artist_availability_and_queue_management:
			"Dostępność artysty i zarządzanie kolejką",
		mobile_experience: "Wersja mobilna",
		mobile: "Urządzenia mobilne",
		a_look_at_what_we_are_building_planning_and_exploring_next:
			"Zobacz, nad czym pracujemy i co planujemy rozwijać w przyszłości.",
		failed_to_load_commission_requests:
			"Nie udało się wczytać zapytań o zlecenia.",
		last_updated: "Ostatnia aktualizacja",
		are_you_sure_you_want_to_delete_this_template_this_action_cannot_be_undone:
			"Czy na pewno chcesz usunąć ten szablon? Tej operacji nie można cofnąć.",
		created_date: "Data utworzenia",
		status_updated: "Status został zaktualizowany",
		failed_to_update_status: "Nie udało się zaktualizować statusu",
		are_you_sure_you_want_to_archive_this_service_this_action_cannot_be_undone_:
			"Czy na pewno chcesz zarchiwizować tę ofertę? Tej operacji nie można cofnąć, a późniejsze przywrócenie oferty nie będzie możliwe.",
		add_more_items_to_your_basket: "Dodaj więcej przedmiotów do koszyka",
		subcategory: "Podkategoria",
		try_adjusting_your_filters_or_search_query:
			"Spróbuj zmienić filtry lub wyszukiwaną frazę.",
		an_unknown_error_occurred: "Wystąpił nieznany błąd.",
		shop_feature_is_coming_soon: "Sklep będzie dostępny wkrótce!",
		coming_soon: "Wkrótce",
		try_a_different_search: "Spróbuj innej frazy wyszukiwania.",
		request_conversations_will_show_up_here:
			"Tutaj pojawią się rozmowy dotyczące zapytań.",
		start_a_new_conversation: "Rozpocznij rozmowę z poziomu profilu.",
		image: "Obraz",
		video: "Wideo",
		you_have_accepted_this_request_and_are_waiting_for_the_client_to_complete_p:
			"Zaakceptowano zapytanie. Przed rozpoczęciem pracy poczekaj na płatność klienta.",
		this_request_was_accepted_and_is_waiting_for_payment_before_work_begins:
			"Zapytanie zostało zaakceptowane. Przed rozpoczęciem pracy wymagana jest płatność.",
		pending_response: "Oczekuje na odpowiedź",
		waiting_for_artist_response: "Oczekuje na odpowiedź artysty",
		you_have_a_new_commission_request_waiting_for_your_response:
			"Nowe zapytanie o zlecenie czeka na Twoją odpowiedź.",
		the_artist_has_not_responded_to_this_request_yet:
			"Artysta nie odpowiedział jeszcze na to zapytanie.",
		you_have_accepted_this_request: "Zaakceptowano zapytanie.",
		the_artist_has_accepted_this_request: "Artysta zaakceptował zapytanie.",
		you_are_currently_working_on_this_commission:
			"Obecnie realizujesz to zlecenie.",
		the_artist_is_currently_working_on_your_commission:
			"Artysta obecnie realizuje Twoje zlecenie.",
		delivery_sent: "Praca przekazana",
		delivery_ready: "Praca gotowa",
		you_have_sent_the_final_delivery_to_the_client_for_review:
			"Przekazano ukończoną pracę klientowi do sprawdzenia.",
		your_files_are_ready_to_review_in_the_delivery_tab:
			"Twoje pliki są gotowe do sprawdzenia w zakładce przekazania pracy.",
		uncategorized: "Bez kategorii",
		in_progress_829ac8: "W realizacji",
		ready_for_review: "Gotowe do sprawdzenia",
		img: "OBRAZ",
		file_20ed7c: "PLIK",
		value0_value1_unread_messages:
			"{{value0}}, nieprzeczytane wiadomości: {{value1}}",
		open_value0: "Otwórz {{value0}}",
		remove_value0: "Usuń {{value0}}",
		back_from_value0: "Wróć z: {{value0}}",
		option_value0: "Opcja {{value0}}",
		view_post_value0: "Zobacz post: {{value0}}",
		pay_value0: "Zapłać {{value0}}",
		download_file_value0: "Pobierz plik {{value0}}",
		verified_media_value0: "Zweryfikowane multimedia {{value0}}",
		attachment_value0: "Załącznik {{value0}}",
		show_image_value0: "Pokaż obraz {{value0}}",
		search_value0: "Szukaj: {{value0}}...",
		preview_value0: "Podgląd {{value0}}",
		value0_cover: "Zdjęcie w tle: {{value0}}",
		previous_image_for_value0: "Poprzedni obraz: {{value0}}",
		next_image_for_value0: "Następny obraz: {{value0}}",
		updated_value0: "Zaktualizowano {{value0}}",
		submitted_value0: "Złożono {{value0}}",
		open_actions_for_value0: "Otwórz opcje: {{value0}}",
		unpin_value0_column: "Odepnij kolumnę {{value0}}",
		enter_a_number: "Wpisz liczbę",
		confirm: "Potwierdź",
		search: "Szukaj…",
		lifeline: "Oś czasu",
		home: "Strona główna",
		command_palette: "Paleta poleceń",
		search_for_a_command_to_run: "Wyszukaj polecenie...",
		commission_request_id: "Zapytanie o zlecenie {{id}}",
		review_tab: "Opinia",
		no_categories_found: "Nie znaleziono kategorii.",
	},
} satisfies typeof en;

export default pl;
