const en = {
	error_preview: {
		title: "Error page preview",
		description: "Choose an example to see the error screen.",
		type: "Error type",
		hint: "These are simulated examples. Retry doesn't contact the server.",
		retried:
			"Preview complete. A real error page would retry loading your content.",
	},
	error_pages: {
		status: "Error {{status}}",
		connection: "Connection problem",
		page_update: "Page update",
		unexpected: "Unexpected error",
		retry: "Try again",
		retrying: "Trying again…",
		reload: "Reload page",
		home: "Back to home",
		back: "Go back",
		sign_in: "Sign in",
		not_found: {
			title: "This page couldn't be found",
			description:
				"The link may be incorrect, or this page may have been moved or removed.",
			hint: "Check the address, or head back home to find what you're looking for.",
		},
		unauthorized: {
			title: "Please sign in to continue",
			description:
				"Your session may have expired, or this page requires an account.",
			hint: "Sign in to your Familiar account, then open this page again.",
		},
		forbidden: {
			title: "You don't have access to this page",
			description:
				"This content may be private, or your account may not have permission to view it.",
			hint: "Check that you're signed in to the right account, or return to a public page.",
		},
		rate_limit: {
			title: "Let's take a short break",
			description: "Familiar has received too many requests in a short time.",
			hint: "Please wait a little before trying again.",
		},
		timeout: {
			title: "This is taking longer than expected",
			description:
				"The service didn't respond in time, so we couldn't finish loading this page.",
			hint: "Wait a moment, then try again. The service may be busy.",
		},
		unavailable: {
			title: "Familiar is temporarily unavailable",
			description:
				"One of the services we need isn't responding, so we can't load this page right now.",
			hint: "This is a service connection problem. Please try again in a few minutes.",
		},
		server: {
			title: "Something went wrong on the server",
			description:
				"The server couldn't complete your request. Please try again in a moment.",
			hint: "If this keeps happening, come back a little later.",
		},
		request: {
			title: "We couldn't complete that request",
			description: "Familiar couldn't process the request for this page.",
			hint: "Check the address, or return home and open the page again.",
		},
		network: {
			title: "We couldn't connect to Familiar",
			description:
				"Your connection may be offline, or the service may be unavailable.",
			hint: "Check your internet connection, then try again.",
		},
		update: {
			title: "This page needs a refresh",
			description:
				"Part of the page couldn't be loaded. A newer version of Familiar may be available.",
			hint: "Reload the page to download the latest version. If that doesn't help, try again later.",
		},
		unknown: {
			title: "We couldn't load this page",
			description: "Something unexpected happened while opening this page.",
			hint: "Try again, or return home and come back to this page later.",
		},
	},
	settings: {
		profile: {
			edit_avatar: "Edit profile picture",
			edit_cover: "Edit cover image",
			change_avatar: "Change profile picture",
			change_cover: "Change cover image",
			remove_avatar: "Remove profile picture",
			remove_cover: "Remove cover image",
			no_changes: "No changes to save.",
			saving: "Saving profile…",
			saved: "Profile changes saved.",
			validation_failed: "Please correct the highlighted fields before saving.",
			save_failed: "Your profile changes could not be saved. Please try again.",
			no_cover: "No cover image",
			display_name: "Display name",
			username: "username",
			save_unavailable: "Saving profile changes is not available yet.",
		},
		navigation: {
			profile: {
				title: "Profile",
				description: "Public profile information",
			},
			account: {
				title: "Account",
				description: "Email, password and account access",
			},
			appearance: {
				title: "Appearance",
				description: "Theme and interface preferences",
			},
			notifications: {
				title: "Notifications",
				description: "Control when we notify you",
			},
			privacy: {
				title: "Privacy & visibility",
				description: "Manage profile visibility",
			},
			language: {
				title: "Language & region",
				description: "Language, region and formatting",
			},
			accessibility: {
				title: "Accessibility",
				description: "Motion and visual preferences",
			},
			connections: {
				title: "Connected accounts",
				description: "Manage external services",
			},
		},
		dialog: {
			close: "Close settings dialog",
			escape_key: "ESC",
		},
		title: "User settings",
		description: "Manage your profile, account and application preferences.",
		sidebar: {
			title: "Settings",
			description: "Manage your account",
			group: "User settings",
		},
		mobile: {
			section_label: "Settings section",
			select_section: "Select a settings section",
		},
		account: {
			email: {
				title: "Email address",
				description: "Used for signing in and account notifications.",
				label: "Email address",
				placeholder: "Email address",
				change: "Change",
			},
			password: {
				title: "Password",
				description: "Choose a strong and unique password.",
				change: "Change password",
			},
			sessions: {
				title: "Account sessions",
				description: "Sign out from other browsers and devices.",
				sign_out_others: "Sign out other sessions",
			},
			danger: {
				title: "Danger zone",
				description: "These actions cannot easily be undone.",
			},
			delete: {
				title: "Delete account",
				description: "Permanently delete your account and content.",
				action: "Delete account",
			},
		},
		appearance: {
			theme: {
				title: "Theme",
				description: "Select your preferred interface appearance.",
				interface_label: "Interface theme",
				applied_description: "Applied immediately across the application.",
			},
			interface: {
				title: "Interface",
			},
			compact_layout: {
				title: "Compact layout",
				description: "Reduce spacing and display more information.",
			},
			media_animations: {
				title: "Show media animations",
				description: "Automatically play animated portfolio media.",
			},
		},
		notifications: {
			messages: {
				title: "Messages",
				description: "Notify me when I receive a new message.",
			},
			comments: {
				title: "Comments",
				description: "Notify me about comments on my posts.",
			},
			likes: {
				title: "Likes",
				description: "Notify me when someone likes my work.",
			},
			new_followers: {
				title: "New followers",
				description: "Notify me when somebody follows my profile.",
			},
			email: {
				title: "Email notifications",
				description: "Send important notifications to my email.",
			},
			preferences: {
				title: "Notification preferences",
				description: "Choose which activity should notify you.",
			},
		},
		privacy: {
			public_profile: {
				title: "Public profile",
				description: "Allow anyone to view your profile.",
			},
			online_status: {
				title: "Show online status",
				description: "Allow other users to see when you are active.",
			},
			liked_posts: {
				title: "Show liked posts",
				description: "Display your liked posts on your profile.",
			},
			search_engines: {
				title: "Allow search engines",
				description: "Allow external search engines to index your profile.",
			},
			sensitive_content: {
				blur: {
					title: "Always blur sensitive content",
					description: "Require confirmation before sensitive media is shown.",
				},
				remember: {
					title: "Remember revealed posts",
					description:
						"Keep sensitive posts revealed during the current session.",
				},
				title: "Sensitive content",
				description: "Control how content warnings are handled.",
			},
			visibility: {
				title: "Profile visibility",
				description: "Control who can see your profile and activity.",
			},
		},
		language: {
			language: {
				title: "Language",
				description: "Choose the language used throughout the application.",
			},
			application_language: {
				label: "Application language",
				description: "Applied immediately without reloading the current page.",
			},
			region: {
				title: "Region",
				description: "Used for dates, numbers and currency.",
				label: "Region",
			},
			time_zone: {
				label: "Time zone",
			},
		},
		accessibility: {
			reduce_motion: {
				title: "Reduce motion",
				description: "Reduce interface animations and transitions.",
			},
			high_contrast: {
				title: "High contrast",
				description: "Increase contrast between interface elements.",
			},
			underline_links: {
				title: "Underline links",
				description: "Always show underlines beneath links.",
			},
			larger_text: {
				title: "Larger interface text",
				description: "Increase the base text size throughout the application.",
			},
			preferences: {
				title: "Accessibility preferences",
				description: "Adjust the interface to make it more comfortable to use.",
			},
		},
		connections: {
			google: {
				label: "Google",
				description: "Use Google to sign in.",
			},
			discord: {
				label: "Discord",
				description: "Connect your Discord profile.",
			},
			twitch: {
				label: "Twitch",
				description: "Display your Twitch channel.",
			},
			title: "Connected accounts",
			description: "Connect external services to your account.",
			disconnect: "Disconnect",
			connect: "Connect",
		},
	},
	seo: {
		error_preview: {
			title: "Error page preview",
			description: "Preview Familiar's error screens and recovery actions.",
		},
		auth: {
			title: "Account access",
			description:
				"Sign in or create a Familiar account to share artwork and manage your artist profile.",
		},
		login: {
			title: "Sign in",
			description:
				"Sign in to Familiar to manage your portfolio, messages, and art commissions.",
		},
		register: {
			title: "Create an account",
			description:
				"Join Familiar to share your artwork, build a portfolio, and connect with artists and clients.",
		},
		forgot: {
			title: "Reset your password",
			description:
				"Request a password reset for your Familiar account and regain access securely.",
		},
		email_confirmed: {
			title: "Email confirmation",
			description:
				"Check the email confirmation status of your Familiar account.",
		},
		payment_connect: {
			title: "Connect your payment account",
			description:
				"Set up a payment account connection for your Familiar artist account.",
		},
		payment_callback: {
			title: "Payment account setup",
			description:
				"Review the result of connecting your payment account to Familiar.",
		},
		logout: {
			title: "Signing out",
			description: "Sign out of your Familiar account.",
		},
		basket: {
			title: "Basket",
			description:
				"Review your selected art commissions and order details on Familiar.",
		},
		requests: {
			title: "My requests",
			description:
				"Review your art commission requests, delivery progress, and order conversations on Familiar.",
		},
		settings: {
			title: "Profile settings",
			description:
				"Manage your Familiar profile, appearance, language, and account preferences.",
		},
		chat: {
			title: "Messages",
			description:
				"Read and manage your private conversations and commission messages on Familiar.",
		},
		dashboard: {
			title: "Artist dashboard",
			description:
				"Manage your Familiar artist account, commissions, services, and request forms.",
		},
		dashboard_requests: {
			title: "Commission requests",
			description:
				"Review and manage incoming commission requests in your Familiar artist dashboard.",
		},
		dashboard_services: {
			title: "Your services",
			description:
				"Manage the art commission services offered through your Familiar artist profile.",
		},
		dashboard_forms: {
			title: "Request forms",
			description:
				"Create and manage the request forms used for your Familiar art commission services.",
		},
		create: {
			title: "Create on Familiar",
			description:
				"Create a portfolio post or organize your artwork into a portfolio folder.",
		},
		create_post: {
			title: "New post",
			description:
				"Add images, a title, and a description to publish a new Familiar portfolio post.",
		},
		create_folder: {
			title: "Create folder",
			description:
				"Organize related artwork and portfolio posts in a new Familiar folder.",
		},
		category: {
			title: "{{category}} commissions",
			description:
				"Browse {{category}} art commissions and discover artists offering custom artwork on Familiar.",
		},
		shop_item: {
			title: "Art commission details",
			description:
				"Explore an art commission offer, its gallery, and available options on Familiar.",
		},
		portfolio: {
			title: "Portfolio by @{{username}}",
			description:
				"Explore artwork and portfolio posts shared by @{{username}} on Familiar.",
		},
		commissions: {
			title: "Commissions by @{{username}}",
			description:
				"Explore art commission services offered by @{{username}} on Familiar.",
		},
		characters: {
			title: "Characters by @{{username}}",
			description:
				"Explore characters and character artwork shared by @{{username}} on Familiar.",
		},
		reviews: {
			title: "Reviews for @{{username}}",
			description:
				"Read reviews of artwork and art commissions by @{{username}} on Familiar.",
		},
		liked: {
			title: "Liked artwork",
			description: "View your liked artwork and portfolio posts on Familiar.",
		},
		post: {
			title: "Portfolio post",
			description:
				"Discover artwork and portfolio posts shared by independent artists on Familiar.",
		},
		artist_post: {
			title: "Artwork by @{{username}}",
			description:
				"View artwork shared by @{{username}} and explore their Familiar portfolio.",
		},
		folder: {
			title: "Portfolio folder by @{{username}}",
			description:
				"Explore a collection of artwork and portfolio posts by @{{username}} on Familiar.",
		},
		commission: {
			title: "Commission details",
			description:
				"View an artist’s commission information and request options on Familiar.",
		},
		defaults: {
			title: "Familiar",
			description:
				"Share your art, build a portfolio, and connect with artists and clients on Familiar.",
			keywords: "art, familiar, commission",
		},
		home: {
			title: "Home",
			description:
				"Share your art, build a portfolio, and connect with artists and clients on Familiar.",
		},
		profile: {
			title: "Profile (@{{username}})",
			description: "User profile for @{{username}}",
		},
		shop: {
			title: "Shop - Discover Custom Art Commissions",
			description:
				"Browse custom art commissions from independent artists on $t(meta.app_name). Discover unique styles, compare offers, view galleries, and request artwork made just for you.",
			keywords:
				"custom art commissions, art commission marketplace, commission artists, digital art commissions, character art commission, illustration commission, artist shop, custom artwork, freelance artists, Familiar shop",
		},
		"privacy-policy": {
			title: "Privacy Policy",
			description: "Read Familiar's Privacy Policy.",
		},
		"release-notes": {
			title: "Release Notes",
			description: "View the latest release notes for Familiar",
		},
		roadmap: {
			title: "Roadmap",
			description: "See what is coming next to Familiar.",
		},
		support: {
			title: "Support Familiar",
			description:
				"Support the independent development of Familiar with a one-time lifetime contribution.",
		},
		terms_of_service: {
			title: "Terms of Service",
			description: "Read Familiar's Terms of Service.",
		},
	},
	meta: {
		app_name: "Familiar",
		label: "English",
		flag: "🇺🇸",
		currency: {
			value: "USD",
			label: "USD",
			symbol: "$",
		},
	},
	header: {
		title: "$t(meta.app_name)",
		navigation: {
			account: "Account navigation",
			messages: "Messages",
			open_menu: "Open navigation",
			home: "Home",
			shop: "Shop",
			blog: "Blog",
			users: "Users",
		},
		user_navigation: {
			profile: "Profile",
			settings: "Settings",
			logout: "Logout",
		},
		theme: {
			toggle: "Toggle theme",
			light: "Light",
			dark: "Dark",
			system: "System",
		},
		"artist-dashboard": "Dashboard",
	},
	auth: {
		login: {
			cta: "Login",
			title: "Welcome back",
			description: "Login to your account to continue",
			success: "Logged in successfully",
			pending: "Logging in...",
		},
		terms_agree: {
			label: "Registering on $t(header.title) you agree to our ",
			terms: "Terms of Service",
			and: " and ",
			privacy: "Privacy Policy",
		},
		register: {
			cta: "Sign in",
			title: "Create an account",
			description: "Enter your details below to create your account",
			already_have_account: "Already have an account?",
			success: "Account created successfully",
			confirm_email: "Account created. Check your inbox to confirm your email.",
			submit: "Submit",
			pending: "Creating account...",
			error_title: "We couldn't create your account",
			validation_error_title: "Check the highlighted fields",
			validation_error_description:
				"Some details need your attention before the account can be created.",
			steps: {
				account: "Account",
				profile: "Profile",
				socials: "Links",
			},
			verify: {
				title: "Please verify your email",
				description: "We sent a confirmation link to the email address below.",
				waiting:
					"Open the link in the email. This page will update automatically, and you may also check again manually.",
				verified_title: "Email confirmed",
				verified_description:
					"Your account is ready. You can safely close this page.",
				check_again: "Check again",
				close_for_now: "Close for now",
				continue: "Continue",
			},
			profile: {
				title: "Profile details",
				description: "Choose how your public profile will appear.",
			},
			images: {
				title: "Profile images",
				description:
					"Add an avatar and cover now, or skip this step and add them later.",
				cover_preview: "Cover preview",
				avatar_preview: "Avatar preview",
				no_cover: "No cover image",
				change_cover: "Choose cover image",
				remove_cover: "Remove cover image",
				choose_avatar: "Choose avatar",
				remove_avatar: "Remove avatar",
			},
		},
		email_confirmed: {
			title: "Your email has been confirmed",
			description:
				"You can close this tab and return to the registration page. It will update automatically.",
			continue: "Continue to Familiar",
		},
		forgot: {
			cta: "Forgot your password?",
			title: "Forgot password?",
			register_question: "Don't have an account?",
			description: "Enter your email to reset your password",
			submit: "Send reset link",
			back_to_login: "Back to Login",
			reset_password: "Reset Password",
		},
		email: {
			label: "Email",
			placeholder: "example@familiar.art",
		},
		back: "Back",
		continue: "Continue",
		invite_key: {
			label: "Invite Key",
			placeholder: "FAM-XXXX-XXXX-XXX",
			prefix: "FAM-",
		},
		display_name: {
			label: "Display Name",
			placeholder: "Your name",
		},
		username: {
			label: "Username",
			placeholder: "username",
		},
		bio: {
			label: "Bio",
			placeholder: "Tell us about yourself...",
		},
		socials: {
			add_label: "Add profile link",
			select_placeholder: "Select a platform",
			add: "Add",
			description: "Add up to five links supported by the registration API.",
			empty: "No profile links added yet.",
			remove: "Remove profile link",
		},
		password: {
			label: "Password",
			placeholder: "Password",
			hide: "Hide password",
			show: "Show password",
		},
		confirm_password: {
			label: "Confirm password",
			placeholder: "Repeat your password",
		},
		create_account: {
			cta: "Create Account",
		},
		errors: {
			rate_limit: "Too many attempts. Please try again later.",
			invalid_credentials: "Invalid email or password",
			invalid_registration:
				"Please review your registration details and invite code.",
			invalid_invite_key:
				"This invite key is invalid or has already been used.",
			email_registered:
				"An account with this email or username already exists.",
			username_taken: "This username is already taken.",
			unsupported_registration_image:
				"The avatar or cover image format is not supported.",
			registration_provider_failed:
				"The authentication provider could not create the account.",
			registration_service_unavailable:
				"Registration is temporarily unavailable. Please try again shortly.",
			registration_failed: "Registration failed: {{error}}",
			login_failed: "Login failed: {{error}}",
			logout_failed: "Logout failed: {{error}}",
			create_profile_failed: "Failed to create user profile: {{error}}",
			auth_session_missing: "Auth session missing!",
			user_authenticated_not_found:
				"User authenticated in Supabase but not found in database.",
			failed_refresh_session: "Failed to refresh session: {{error}}",
			failed_get_user: "Failed to get user: {{error}}",
			failed_auto_create_profile: "Failed to auto-create profile: {{error}}",
			failed_fetch_user_auth_change:
				"Failed to fetch user in onAuthStateChange: {{error}}",
			use_auth_provider: "useAuth must be used within an AuthProvider",
		},
		account_type: {
			label: "Account Type",
			client_title: "Client Account",
			client_description: "For individuals looking to connect with artists.",
			artist_title: "Artist Account",
			artist_description: "For artists looking to connect with clients.",
			client_badge: "Default",
		},
	},
	pages: {
		home: {
			title: "Home",
			description: "Page is under construction.",
		},
	},
	states: {
		empty: {
			under_construction: "Under construction",
			user_not_found: "User not found",
			user_not_found_description:
				"We couldn't find this user. Check the username or return to the home page.",
			back_to_home: "Back to home",
		},
	},
	components: {
		language_select: {
			search: "Search languages",
			select: "Select language",
			no_results: "No language found",
		},
		portfolio: {
			filters: {
				all: "All",
				commissions_only: "Commissions only",
				tags: "Tags",
				folders: "Folders",
				search_placeholder: "Search portfolio...",
			},
			folder: {
				items: "{{count}} items",
				back: "Back to portfolio",
				manage: {
					rename: "Rename folder",
					delete: "Delete folder",
				},
				delete: {
					title: "Delete folder?",
					description:
						"Are you sure you want to delete this folder? Posts inside it will not be deleted.",
					cancel: "Cancel",
					deleting: "Deleting...",
					confirm: "Delete",
				},
				filters: {
					search_placeholder: "Search this folder...",
				},
				create: {
					title: "New folder",
				},
				catalogs: "Portfolio folders",
			},
			search_placeholder: "Search folders...",
			content_warning: {
				open: "Open post with sensitive content",
				sensitive_content: "Sensitive content",
				title: "Content warning",
				show: "Show",
				description:
					"This post contains material that some viewers may prefer not to see.",
				hide: "Hide sensitive content",
			},
			post: {
				image_alt: "Portfolio image",
				no_media: "No media available",
				view: "View portfolio post",
				untitled: "Untitled",
				delete: {
					success: "Post deleted successfully",
					error: "Failed to delete post",
					title: "Delete post?",
					description:
						"Are you sure you want to delete this post? This action cannot be undone.",
					cancel: "Cancel",
					deleting: "Deleting...",
					confirm: "Delete",
				},
				edit_coming_soon: "Edit feature coming soon!",
				manage: {
					edit: "Edit post",
					delete: "Delete post",
					copy_link_success: "Link copied to clipboard",
					copy_link: "Copy link",
					report: "Report post",
				},
				report_coming_soon: "Report feature coming soon!",
				previous_media: "Previous image",
				next_media: "Next image",
				unlike: "Unlike",
				like: "Like",
				comment: "Comment",
				share: "Share",
				remove_bookmark: "Remove bookmark",
				bookmark: "Bookmark",
				like_count_single: "like",
				like_count_plural: "likes",
				loading: "Loading post...",
				error: "Error",
				not_found: "Post not found or could not be loaded.",
				create: {
					success: "Post created successfully!",
					error: "Failed to create post.",
					title: "New Post",
					media: {
						title: "IMAGES",
						upload: "Add images",
						remove: "Remove image",
					},
					fields: {
						title: "TITLE *",
						description: "DESCRIPTION",
						visibility: "VISIBILITY",
						categories: "CATEGORIES (TAGS)",
						cws: "CONTENT WARNINGS",
						catalogs: "ADD TO CATALOGS",
					},
					placeholders: {
						title: "e.g. Character portrait",
						description: "Optional description...",
					},
					errors: {
						title_required: "Title is required.",
					},
					hints: {
						title_length: "Maximum 100 characters.",
						categories: "Select from available categories.",
						cws: "Select applicable content warnings.",
					},
					visibility: {
						public: "Public",
						private: "Private",
					},
					actions: {
						cancel: "Cancel",
						creating: "Creating...",
						create: "Create",
					},
				},
				likes_one: "{{formattedCount}} like",
				likes_few: "{{formattedCount}} likes",
				likes_many: "{{formattedCount}} likes",
				likes_other: "{{formattedCount}} likes",
			},
		},
		profile: {
			tabs: {
				commissions: "Commissions",
				portfolio: "Portfolio",
				characters: "Characters",
				saved: "Saved",
				liked: "Liked",
			},
			portfolio: {
				unavailable: {
					title: "No portfolio",
					description: "This account doesn't have an artist portfolio.",
				},
				manage: {
					options: "Post options",
					edit: "Edit post",
					delete: "Delete post",
					remove: "Remove from folder",
				},
				empty: {
					title: "No posts yet.",
					description:
						"This user hasn't posted anything to their portfolio yet.",
				},
			},
			private_content: {
				title: "This content is private",
				description: "You do not have permission to view this content.",
			},
			actions: {
				follow: "Follow",
				unfollow: "Unfollow",
				edit_profile: "Edit Profile",
				followers: "Followers",
				following: "Following",
				work_queue: "Work Queue",
				add_post: "Create post",
				more: "More actions",
				share_profile: "Share Profile",
				report_user: "Report",
				block_user: "Block user",
				sign_in_to_follow: "Please sign in to follow this user.",
				sign_in_to_message: "Please sign in to message this user.",
				message_failed: "Could not start the conversation. Please try again.",
				queue: "Queue",
				message: "Message",
			},
			info: {
				local_time: "Local time",
				suspended: "This account is suspended.",
				about_me: "About me",
			},
			details: {
				stats: {
					followers: "Followers",
					following: "Following",
					works: "Works",
				},
				joined: "Joined",
				local: "local",
				bio: "Bio",
				languages: "Languages",
			},
			languages: {
				levels: {
					native: "Native",
					fluent: "Fluent",
					communicative: "Communicative",
					learning: "Learning",
					basic: "Basic",
				},
			},
			commissions: {
				card: {
					from: "From",
					start_request: "Start Request",
					join_waitlist: "Join Waitlist",
					get_notified: "Get notified",
					open: "Open",
					closed: "Closed",
					waitlist: "Waitlist",
					content_warning: "Content Warning",
					sensitive_content: "Sensitive content",
					contains_tags: "This media contains {{tags}}",
					show_content: "Show",
					hide_content: "Hide",
					show_details_18_plus: "Show details, I'm 18+",
				},
				post_modal: {
					title: "Post Details",
					content_warning: "Content Warning",
					sensitive_content_desc:
						"This artwork contains content that some viewers may find sensitive",
					commissioned_by: "Commissioned by client",
					featured: "Featured",
					view_in_gallery: "View in gallery",
					commission_similar: "Commission me for something similar",
					no_tags: "No tags",
					tags_label: "Tags",
					content_warnings_label: "Content Warnings",
					no_cw_tags: "No content warnings",
					highlights: "Highlights",
					character: "Character",
					no_media: "No media available",
					default_highlights: {
						delivery: "On time delivery",
						responsive: "Very responsive",
						updates: "Proactive updates",
					},
				},
				empty: {
					title: "No commissions available",
					description: "This user hasn't set up any commissions yet.",
				},
				modal: {
					title: "Commission Details",
					category_label: "Commission",
					no_media: "No media available",
					license: {
						title: "License Type",
						info: "License Info",
						included: "Included",
						personal: "Personal",
						personal_desc: "For personal use only",
						monetized: "Monetized content",
						monetized_desc: "For use in monetized content",
						commercial: "Commercial",
						commercial_desc: "For commercial use",
						unavailable: "Unavailable",
						other_licenses_count: "{{count}} other licenses",
					},
					service: {
						custom: {
							title: "Custom service",
							tooltip: "Made from scratch based on your requirements",
							description: "Made from scratch",
						},
						ych: {
							title: "Personalized YCH",
							tooltip: "Your Character Here - fixed pose/scene",
							description: "Fixed pose, your character",
						},
						communication: {
							title: "Open communication",
							tooltip: "Regular updates and feedback loops",
							description: "WIP updates + revisions available",
						},
						surprise: {
							title: "Surprise me",
							tooltip: "Artist has creative freedom",
							description: "Artist choice / Artistic freedom",
						},
						proposal: {
							title: "Custom proposal",
							tooltip: "Standard commission workflow",
							description: "Request → proposal → commit (pay)",
						},
						instant: {
							title: "Instant order",
							tooltip: "Directly order without proposal phase",
							description: "Order & Pay directly",
						},
					},
					tabs: {
						description: "Description",
					},
					tos: {
						title: "{{artist_displayname}}'s Terms of Service",
						updated_at: "Updated {{updated_at}}",
						agreement_prefix: "By commissioning me, you agree to:",
						read_full: "Read full Terms of Service",
					},
					reviews: {
						empty: "No reviews yet.",
						total_count: "{{count}} reviews",
						total_count_one: "{{count}} review",
						total_count_few: "{{count}} reviews",
						total_count_many: "{{count}} reviews",
						total_count_other: "{{count}} reviews",
					},
					info_selection_modal: {
						service: {
							title: "Service type",
							description:
								"The kind of service that the artist provides for a commission.",
						},
						communication: {
							title: "Communication style",
							description:
								"The style of communication that you should expect with the artist for a commission.",
						},
						process: {
							title: "Requesting process",
							description:
								"The way you submit your commission request for a service.",
						},
					},
					license_info_modal: {
						title: "Available licenses",
						subtitle:
							"The artist is the commissioned asset licensor and may include additional license terms in their Terms of Service or the service's description.",
						personal: {
							title: "Personal",
							description:
								"For individual, non-commercial and non-monetized uses only",
							allowed: {
								personal_use:
									"Personal use (e.g. social media pfp, wallpaper, personal print)",
							},
							forbidden: {
								monetized: "Monetized content (e.g. streaming, youtube videos)",
								commercial:
									"Commercial merchandising (e.g. t-shirts, stickers)",
							},
						},
						monetized: {
							title: "Monetized content",
							description:
								"For content creators and businesses who want to use the commissioned asset as part of creating and distributing commercial and monetized digital content",
							allowed: {
								personal_use: "Personal use",
								monetized_content:
									"Monetized content (streaming, videos, etc.)",
							},
							forbidden: {
								commercial: "Commercial merchandising",
							},
						},
						commercial: {
							title: "Commercial merchandising",
							description:
								"For businesses who want to create, promote, and re-sell their own digital or physical end products made with the commissioned asset",
							licensee: {
								label: "Licensee",
								value: "Individual or Legal Entity (Company)",
							},
							commercial_use: {
								label: "Commercial use",
								allowed: {
									creation:
										"Creation, re-selling, and distribution of value-add or derivative digital or physical end products made with the commissioned asset by the Licensee",
									distribution:
										"Creation and distribution of digital and physical content to promote the re-selling of value-add digital or physical end products created by the Licensee",
								},
								forbidden: {
									reselling:
										'Re-selling the commissioned asset "as-is" without any value-add activities',
								},
							},
							credit: {
								label: "Credit the artist",
								value: "Required for all public uses unless agreed otherwise",
							},
						},
						custom_licenses: {
							title: "Artist's Custom Licenses",
							updated: "Updated {{date}}",
						},
						system_licenses: {
							title: "Familiar Standard Licenses",
						},
					},
					footer: {
						accept_tos_label: "I accept {{artist}}'s Terms of Service",
						tos_disclaimer:
							"By checking this box, you agree to the artist's terms.",
						terms_summary: "Terms Summary:",
						no_terms: "No terms available",
						accept_start: "Accept terms to start request",
						feature_disabled: "Feature is temporary disabled",
					},
					no_description: "No description provided.",
				},
			},
			feeds: {
				empty: {
					title: "No content yet",
					description: "This user hasn't posted anything yet.",
				},
			},
			terms_of_service: {
				title: "Terms of Service",
				updated: "Updated",
				loading: "Loading...",
				error: "Failed to load terms of service.",
			},
			badges: {
				verified: "Verified",
				supporter: "Supporter",
			},
		},
		language_switcher: {
			select: "Select language",
		},
		theme_switcher: {
			light: "Light",
			dark: "Dark",
			oled: "OLED",
			system: "System",
			toggle: "Select theme",
		},
		currency_select: {
			search: "Search currency...",
			no_results: "No results found.",
		},
	},
	footer: {
		about: {
			title: "$t(meta.app_name)",
			description:
				"$t(meta.app_name) is a social platform for artists to connect with each other.",
		},
		sections: {
			socials: "Socials",
			navigation: "Navigation",
			resources: "Resources",
		},
		links: {
			home: "Home",
			blog: "Blog",
			faq: "FAQ",
			sponsors: "Sponsors",
			terms: "Terms of Service",
			privacy: "Privacy Policy",
			documentation: "Documentation",
			"release-notes": "Release Notes",
			roadmap: "Roadmap",
		},
		copyright: {
			rights: "All rights reserved",
			made_with: "Made with ❤️",
		},
	},
	releaseNotes: {
		title: "What's new with Familiar",
		eyebrow: "Changelog",
		latest: "Latest",
		latestRelease: "Latest release",
		tags: {
			Added: "Added",
			Improved: "Improved",
			Fixed: "Fixed",
			Deprecated: "Deprecated",
			Removed: "Removed",
			Security: "Security",
			Breaking: "Broken",
		},
		releases: {
			v0_1_0: {
				Added: ["Familiar is now live. This is our first public release."],
			},
			v0_2_0: {
				Added: [
					"Profiles are now available with avatars, bios, cover images, and feed tabs.",
					"You can now sign in and out with a real Supabase-powered account.",
					"Profiles now support language badges and cleaner, SEO-friendly URLs.",
				],
			},
			v0_3_0: {
				Added: [
					"You can now browse and request commissions directly from artist profiles.",
					"Content access is now handled automatically based on your account type.",
				],
			},
			v0_3_1: {
				Improved: [
					"Commission cards now look cleaner, with smoother corners and better image rounding.",
					"Sensitive content labels are shorter and easier to understand.",
				],
				Fixed: [
					"The hide content button now includes a tooltip, so its purpose is easier to understand.",
				],
			},
			v0_4_0: {
				Added: [
					"Added new profile modals for info selection, terms of service, and reviews.",
					"Commission detail pages can now be opened directly from artist profiles.",
				],
				Improved: ["Commission previews now load faster and look cleaner."],
			},
			v0_5_0: {
				Added: [
					"Mobile now has its own navigation menu, making the app easier to use on smaller screens.",
					"Portfolio posts can now be opened directly and shared with a link.",
					"Sensitive content is now blurred by default, with a quick tap to reveal it.",
				],
				Improved: [
					"The user menu now adapts to your device, with a dropdown on desktop and a drawer on mobile.",
					"Feed images can now autoplay on mobile as you scroll past them.",
					"FAM codes are now formatted automatically when typed or pasted.",
				],
			},
			v0_5_1: {
				Improved: [
					"Reels now feel steadier, with better progress tracking and smoother transitions.",
					"Links in posts now show a preview tooltip when you hover over them.",
					"Commission request forms now have a cleaner step-by-step flow.",
				],
				Added: ["Added a new filter icon for use across the app."],
			},
			v0_5_2: {
				Fixed: [
					"Reels no longer flicker or get stuck when switching between items.",
					"Profile pictures now load correctly, even while media is still being processed.",
					"Closed commissions can no longer be opened by accident.",
					"Staying logged in after refreshing the page is now more reliable.",
					"The app no longer briefly shows you as logged out when it first loads.",
					"Your selected theme now applies immediately, without flashing on startup.",
				],
				Improved: [
					"Folder cards now support custom colors and icons.",
					"License selection in commission modals is clearer and easier to use.",
					"Scrollable areas inside modals now behave more consistently.",
				],
			},
			v0_5_3: {
				Improved: [
					"Calendar, carousel, and multi-step form components are now more reliable and easier to use with a keyboard.",
				],
			},
			v0_5_4: {
				Improved: [
					"Reels now play more smoothly and pause correctly when you scroll away.",
					"The app should feel a bit faster thanks to general performance improvements.",
				],
				Fixed: [
					"The sign-up flow no longer gets stuck on the continue button in certain cases.",
				],
			},
			v0_6_0: {
				Added: [
					"Added a new filtering system for narrowing lists by date, text, numbers, or multiple options at once.",
					"Filters now work nicely on mobile too.",
				],
			},
			v0_7_0: {
				Added: [
					"You can now send and manage commission requests from start to finish.",
					"Added a new My Requests page where you can track the progress.",
				],
			},
			v0_7_1: {
				Improved: [
					"Commission requests now have clearer actions for submitting, accepting, rejecting, canceling, and attaching media.",
					"The request details page has a cleaner design, clearer status cards, and a hold-to-confirm button for sensitive actions.",
					"Artists now have a dashboard shortcut directly in the header.",
					"Filters now support grouped and nested options, making browsing easier.",
				],
			},
			v0_7_2: {
				Improved: [
					"Commission previews now load faster and look clearer.",
					"Archived commissions are now hidden from your list more reliably.",
				],
				Removed: [
					"Removed old placeholder data that was no longer needed.",
					"Portfolio post view is temporarily hidden while it is being reworked.",
				],
			},
			v0_7_3: {
				Added: [
					"Added release notes, so you can quickly see what is new, improved, and fixed in Familiar.",
				],
			},
			v0_7_4: {
				Improved: [
					"Release notes now support multiple languages, so more users can follow what changed.",
				],
				Fixed: [
					"Login and registration now share the same layout, so the pages feel more consistent.",
				],
			},
			v0_7_5: {
				Added: [
					"Added [Privacy Policy](/privacy) and [Terms of Service](/tos) pages.",
				],
				Improved: [
					"Privacy Policy and Terms of Service now have a cleaner reading layout with better typography.",
					"Legal pages now use translated content, including titles, descriptions, dates, sections, and list items.",
					"Release notes now look better on mobile, with a layout that gives each version more space.",
					"The footer is now easier to maintain and includes clearer links to legal resources.",
				],
				Fixed: [
					"Release note content no longer gets squeezed into narrow columns on small screens.",
					"Legal document sections now render correctly from translations.",
					"Markdown content in legal pages no longer creates invalid nested paragraph elements.",
				],
			},
			v0_8_1: {
				Improved: [
					"Unified form styling and validation across authentication and profile editing.",
					"Updated profiles with a refreshed layout, profile details, social links, and editing controls.",
				],
				Fixed: [
					"Corrected mobile profile spacing and reduced excess space above empty portfolios.",
					"Made mobile portfolio filter, new folder, and create post actions compact icon buttons while keeping search usable.",
					"Aligned the login form and artwork with the available page height and removed unnecessary desktop scrolling.",
					"Fixed repeated navigation when opening a user profile.",
				],
			},
			v0_8_0: {
				Added: [
					"Added the Shop feature with browsing, categories, and item filtering.",
					"Added a detailed Shop Item modal to view items and add them to your basket.",
					"Added a Basket dropdown in the header and a dedicated Checkout page.",
				],
			},
		},
	},
	privacyPolicy: {
		title: "Privacy Policy",
		eyebrow: "Legal",
		description:
			"Learn how Familiar collects, uses, and protects your information.",
		effectiveDateLabel: "Effective date",
		effectiveDate: "2026-06-07",
		sections: [
			{
				title: "Introduction",
				body: [
					"Familiar is a social platform for artists, clients, and creative communities. This Privacy Policy explains what information we collect, how we use it, and what choices you have.",
					"By using Familiar, you agree to the practices described in this policy.",
				],
			},
			{
				title: "Information we collect",
				body: [
					"We collect information that you provide directly when you create an account, edit your profile, post content, request commissions, or contact us.",
				],
				items: [
					"Account information, such as your email, username, display name, and account type.",
					"Profile information, such as avatar, bio, language badges, portfolio content, and public links.",
					"Content you upload or share, such as posts, images, commission details, and messages connected to requests.",
					"Technical information, such as device type, browser, IP address, session data, and basic usage logs.",
				],
			},
			{
				title: "How we use your information",
				body: [
					"We use your information to provide, secure, improve, and personalize Familiar.",
				],
				items: [
					"To create and manage your account.",
					"To display your profile, portfolio, posts, and commission information.",
					"To process commission requests and related actions.",
					"To protect the platform from abuse, spam, fraud, and unauthorized access.",
					"To improve performance, accessibility, and user experience.",
					"To contact you about important account, safety, or service updates.",
				],
			},
			{
				title: "Public content",
				body: [
					"Some information on Familiar is public by design. This may include your username, display name, avatar, profile page, portfolio, public posts, commission listings, and other content you choose to publish.",
					"Please avoid sharing private or sensitive information in public areas of the platform.",
				],
			},
			{
				title: "Cookies and similar technologies",
				body: [
					"Familiar may use cookies, local storage, and similar technologies to keep you signed in, remember your preferences, improve security, and understand how the platform is used.",
				],
			},
			{
				title: "How we share information",
				body: [
					"We do not sell your personal information. We may share limited information only when necessary to operate Familiar, comply with legal obligations, protect users, or use trusted service providers.",
				],
				items: [
					"Service providers that help us host, secure, analyze, or operate the platform.",
					"Authorities or legal parties when required by law or valid legal process.",
					"Other users, when you publish content or interact with public features.",
				],
			},
			{
				title: "Data retention",
				body: [
					"We keep your information for as long as needed to provide Familiar, comply with legal obligations, resolve disputes, prevent abuse, and enforce our terms.",
					"When your information is no longer needed, we will delete it or anonymize it where reasonably possible.",
				],
			},
			{
				title: "Your choices and rights",
				body: [
					"Depending on your location, you may have rights to access, correct, delete, export, or restrict the use of your personal information.",
				],
				items: [
					"You can update some account and profile information directly in your settings.",
					"You may request deletion or correction of certain personal information.",
					"You may contact us if you have privacy questions or requests.",
				],
			},
			{
				title: "Security",
				body: [
					"We use reasonable technical and organizational measures to protect your information. However, no online service can guarantee perfect security.",
				],
			},
			{
				title: "Children's privacy",
				body: [
					"Familiar is not intended for children below the minimum age required by applicable law. If we learn that we collected personal information from a child without proper consent, we will take appropriate steps to remove it.",
				],
			},
			{
				title: "Changes to this policy",
				body: [
					"We may update this Privacy Policy from time to time. When we make important changes, we will update the effective date and may notify users through the platform.",
				],
			},
			{
				title: "Contact",
				body: [
					"If you have questions about this Privacy Policy, you can contact the Familiar team through the official support or contact channels provided on the platform.",
				],
			},
		],
	},
	termsOfService: {
		title: "Terms of Service",
		eyebrow: "Legal",
		description: "Please read these terms carefully before using Familiar.",
		effectiveDateLabel: "Effective date",
		effectiveDate: "2026-06-07",
		sections: [
			{
				title: "Introduction",
				body: [
					"These Terms of Service explain the rules for using Familiar. Familiar is a social platform for artists, clients, and creative communities.",
					"By creating an account or using Familiar, you agree to these terms. If you do not agree, please do not use the platform.",
				],
			},
			{
				title: "Accounts",
				body: [
					"You may need an account to use some features of Familiar. You are responsible for keeping your login details safe and for all activity that happens through your account.",
				],
				items: [
					"You must provide accurate information when creating an account.",
					"You may not impersonate another person, brand, artist, or organization.",
					"You may not sell, transfer, or share access to your account without permission.",
					"You must contact us if you believe your account has been accessed without permission.",
				],
			},
			{
				title: "User content",
				body: [
					"You keep ownership of the content you create and upload to Familiar. However, by posting content on the platform, you allow us to display, store, process, and share that content as needed to operate Familiar.",
					"You are responsible for making sure that you have the rights to upload and share your content.",
				],
				items: [
					"You may not upload content that infringes someone else's rights.",
					"You may not upload illegal, abusive, hateful, harmful, or misleading content.",
					"You may not upload content that violates our community rules or platform policies.",
				],
			},
			{
				title: "Artist services and commissions",
				body: [
					"Familiar may allow artists and clients to communicate about commissions, requests, portfolios, and related services.",
					"Unless clearly stated otherwise, Familiar is not a party to individual agreements between artists and clients. Artists and clients are responsible for setting clear expectations, prices, deadlines, licenses, and delivery terms.",
				],
				items: [
					"Artists are responsible for describing their services accurately.",
					"Clients are responsible for reading service details before submitting a request.",
					"Both sides are responsible for respecting agreed terms, licenses, and payment arrangements.",
				],
			},
			{
				title: "Acceptable use",
				body: [
					"You agree to use Familiar in a safe, lawful, and respectful way.",
				],
				items: [
					"You may not use Familiar for spam, scams, fraud, harassment, or abuse.",
					"You may not attempt to disrupt, overload, scrape, reverse engineer, or attack the platform.",
					"You may not bypass security systems, access controls, bans, or account restrictions.",
					"You may not use Familiar to distribute malware or harmful links.",
				],
			},
			{
				title: "Content moderation",
				body: [
					"We may review, hide, restrict, remove, or report content if we believe it violates these terms, our policies, the law, or the safety of the platform.",
					"We may also suspend or terminate accounts that break the rules or create risk for Familiar, its users, or its community.",
				],
			},
			{
				title: "Intellectual property",
				body: [
					"Familiar, including its design, branding, interface, software, and platform features, is protected by intellectual property laws. You may not copy, modify, distribute, or misuse Familiar's own materials without permission.",
					"Content uploaded by users belongs to the relevant users or rights holders, unless stated otherwise.",
				],
			},
			{
				title: "Third-party services",
				body: [
					"Familiar may use third-party services for hosting, authentication, payments, analytics, storage, or other platform features. These services may have their own terms and privacy policies.",
				],
			},
			{
				title: "Availability and changes",
				body: [
					"We work to keep Familiar available and reliable, but we cannot guarantee that the platform will always be uninterrupted, error-free, or available.",
					"We may update, change, suspend, or remove features at any time, especially when needed for security, maintenance, legal compliance, or product improvement.",
				],
			},
			{
				title: "Disclaimers",
				body: [
					"Familiar is provided on an as-is and as-available basis. To the fullest extent allowed by law, we do not make warranties about uninterrupted access, perfect security, suitability for a specific purpose, or the accuracy of user content.",
				],
			},
			{
				title: "Limitation of liability",
				body: [
					"To the fullest extent allowed by law, Familiar and its team will not be liable for indirect, incidental, special, consequential, or punitive damages related to your use of the platform.",
				],
			},
			{
				title: "Termination",
				body: [
					"You may stop using Familiar at any time. We may suspend or terminate access if you violate these terms, create legal risk, harm other users, or misuse the platform.",
				],
			},
			{
				title: "Changes to these terms",
				body: [
					"We may update these Terms of Service from time to time. When we make important changes, we will update the effective date and may notify users through the platform.",
				],
			},
			{
				title: "Contact",
				body: [
					"If you have questions about these Terms of Service, you can contact the Familiar team through the official support or contact channels provided on the platform.",
				],
			},
		],
	},
	roadmap: {
		title: "Coming next to Familiar",
		eyebrow: "Roadmap",
		description:
			"A simple look at planned features and what we are working on next.",
		status: {
			Planned: "Planned",
			InProgress: "In progress",
			Exploring: "Exploring",
		},
		items: {
			"item-1": {
				title: "Better commission dashboard",
				description:
					"A clearer dashboard for artists and clients to manage commission requests more easily.",
				details: [
					"Clearer request status cards.",
					"Better actions for accepting, rejecting, canceling, and updating requests.",
					"Cleaner mobile layout for managing commissions on smaller screens.",
				],
			},
			"item-2": {
				title: "Improved portfolio posts",
				description:
					"Portfolio posts will return with a cleaner detail view and better sharing support.",
				details: [
					"Better post pages for artwork and commission examples.",
					"Cleaner media display for images and previews.",
					"Improved links for sharing portfolio posts.",
				],
			},
			"item-3": {
				title: "Notifications",
				description:
					"Notifications are being explored to help users follow important activity without checking every page manually.",
				details: [
					"Updates for commission request changes.",
					"Possible profile, follow, and activity notifications.",
					"Simple notification center inside the app.",
				],
			},
		},
		axis: {
			year: "Year",
		},
	},
	commissions: {
		"create-new": "Create commission",
	},
	commission_request_from: "From",
	common: {
		cancel: "Cancel",
		save_changes: "Save changes",
	},
	support: {
		features: {
			animated_avatar: {
				title: "Animated avatars",
				description:
					"Use a GIF or animated image as your avatar and bring your identity to life across Familiar.",
			},
			animated_cover: {
				title: "Animated profile covers",
				description:
					"Add movement to your profile header with an animated cover that matches your style.",
			},
			colored_folders: {
				title: "Colored folders",
				description:
					"Give each portfolio folder its own color so collections are easier to recognize and organize.",
			},
			profile_palettes: {
				title: "Profile palettes",
				description:
					"Apply coordinated accent palettes to profile controls, highlights, and small interface details.",
			},
			folder_icons: {
				title: "Folder icons",
				description:
					"Choose a small symbol for each folder to give portfolio collections more personality.",
			},
			portfolio_accents: {
				title: "Portfolio accents",
				description:
					"Add subtle visual accents to featured work without changing how the portfolio itself functions.",
			},
			eyebrow: "Visual customization",
			title: "More ways to make Familiar yours.",
			description:
				"Supporter features are cosmetic only. Portfolios, commissions, chat, discovery, and every functional part of Familiar remain available to everyone.",
			status: {
				confirmed: "Confirmed",
				soon: "Soon",
			},
		},
		faq: {
			subscription: {
				question: "How do the payment options work?",
				answer:
					"Monthly and yearly support renew automatically. Lifetime support is a single payment with no renewal.",
			},
			access: {
				question: "Will regular Familiar features become paid?",
				answer:
					"No. Functional features remain available to everyone. Supporter unlocks are limited to visual customization.",
			},
			features: {
				question: "Which visual features are confirmed?",
				answer:
					"Animated avatars, animated profile covers, and colored folders are confirmed. Other items shown here are ideas for later releases.",
			},
			title: "Questions about support",
		},
		plans: {
			monthly: {
				label: "Monthly",
				interval: "/ month",
				description:
					"Flexible recurring support with access to supporter visuals while your plan is active.",
				action: "Support monthly",
			},
			yearly: {
				label: "Yearly",
				interval: "/ year",
				description:
					"One annual renewal with the same visual extras and a lower effective monthly price.",
				action: "Support yearly",
			},
			lifetime: {
				label: "Lifetime",
				interval: "once",
				description:
					"A single payment that keeps supporter visual customization on your account permanently.",
				action: "Support for life",
			},
			eyebrow: "Support options",
			title: "Choose how you want to support Familiar",
			description:
				"Every option unlocks the same visual customization. Choose recurring support or make one lifetime contribution.",
			disclaimer:
				"This is an early mockup. Prices and planned visual ideas may change before checkout launches.",
			label: "Supporter access",
		},
		checkout: {
			mock: "Checkout is not available in this mockup yet.",
		},
		eyebrow: "Support Familiar",
		hero: {
			title: "Help us build a better home for artists.",
			description:
				"Familiar is built to make sharing art and working with clients feel more human. Your support helps us keep developing it independently.",
			cta: "Explore support options",
		},
	},
	ui: {
		add_to_portfolio: "Add to portfolio",
		empty_portfolio_owner_description:
			"Share your first artwork or organize your portfolio with a folder.",
		no_warnings_found: "No warnings found.",
		no_folders_found: "No folders found.",
		portfolio_creation_unavailable:
			"Portfolio creation is available to artist accounts.",
		account_type: "Account Type",
		username: "username",
		close: "Close",
		reset_your_password: "Reset your password",
		sign_in_to_share_your_work_and_follow_creators:
			"Sign in to share your work and follow creators.",
		sign_in: "Sign In",
		sign_up: "Sign Up",
		basket: "Basket",
		item: "item",
		from: "from",
		subtotal: "Subtotal",
		sales_tax_calculated_at_checkout: "Sales tax calculated at checkout",
		checkout: "Checkout",
		open_commission_request: "Open commission request",
		commission_request: "Commission request #",
		commission_request_7fac7a: "Commission request",
		request_lookup_failed: "request lookup failed",
		your_messages: "Your Messages",
		requests: "Requests",
		could_not_load_conversations: "Could not load conversations.",
		search_messages: "Search messages...",
		file_attachment: "File attachment",
		message: "Message",
		selected_media: "Selected media",
		attach_media: "Attach media",
		write_a_message_or_attach_media: "Write a message or attach media...",
		send_message: "Send message",
		new_messages: "New messages",
		media: "Media",
		review: "Review",
		active: "Active",
		paused: "Paused",
		draft: "Draft",
		delete_commission: "Delete commission",
		step: "Step",
		of: "of",
		title: "Title",
		portrait_commission: "Portrait commission",
		category: "Category",
		search_category: "Search category...",
		no_category_found: "No category found.",
		back: "Back",
		main_category: "Main category",
		base_price: "Base price",
		currency: "Currency",
		form_template: "Form Template",
		choose_a_form_template_that_clients_will_fill_out_when_requesting_this_comm:
			"Choose a form template that clients will fill out when requesting this commission.",
		edit_template: "Edit template",
		select_a_form_template: "Select a form template",
		none: "None",
		description: "Description",
		tags: "Tags",
		general_tags: "General tags",
		content_warnings: "Content warnings",
		cw: "CW:",
		show_your_best_work: "Show your best work",
		the_first_image_is_used_as_the_gallery_thumbnail_upload_up_to_10_images_dra:
			"The first image is used as the gallery thumbnail. Upload up to 10 images - drag to reorder. Existing media is loaded here in edit mode.",
		drag_and_drop_or_click_to_upload: "Drag and drop or click to upload",
		existing_media_is_loaded_here_in_edit_mode:
			"Existing media is loaded here in edit mode.",
		media_items: "Media items (",
		drag_to_reorder: "Drag to reorder",
		add_more: "Add more",
		summary: "Summary",
		price: "Price",
		items: "items",
		template: "Template",
		before_publishing: "Before publishing",
		review_before_publishing: "Review before publishing",
		once_published_your_listing_will_be_visible_to_all_users_you_can_pause_or_e:
			"Once published, your listing will be visible to all users. You can pause or edit it anytime.",
		continue: "Continue",
		required: "Required *",
		select_date: "Select date",
		choose_1: "(Choose 1)",
		select_an_option: "Select an option",
		please_specify: "Please specify...",
		option_label: "Option Label",
		value: "Value",
		price_mod: "Price Mod",
		no_price: "No Price",
		fixed: "Fixed (+)",
		percent: "Percent (+%)",
		delete_option: "Delete Option",
		are_you_sure_you_want_to_delete_the_option:
			"Are you sure you want to delete the option",
		this_action_cannot_be_undone: "? This action cannot be undone.",
		required_field: "Required field",
		delete_field: "Delete Field",
		options: "Options",
		add_option: "Add Option",
		define_the_fields_that_clients_must_fill_out_when_requesting_a_commission:
			"Define the fields that clients must fill out when requesting a commission.",
		template_name: "Template Name",
		cancel: "Cancel",
		saving: "Saving…",
		add_field: "Add Field",
		form_fields: "Form Fields (",
		preview: "Preview",
		no_fields_added_yet: "No fields added yet.",
		click_add_field_to_start_building_your_form:
			'Click "Add Field" to start building your form.',
		quick_math: "Quick math",
		internal_reference_use_only: "Internal reference use only",
		from_service: "From service",
		savings: "Savings",
		off: "% off",
		project_subtotal: "Project subtotal",
		for_all_services: "For all services",
		note_that_this_is_an_auto_generated_estimate_based_on_your_request_and_shou:
			"Note that this is an auto-generated estimate based on your request and should not be considered as the final price.",
		commissions_requests: "Commissions Requests",
		services: "Services",
		shop: "Shop",
		dashboard: "Dashboard",
		go_to_my_profile: "Go to my profile",
		commissions: "Commissions",
		pipeline: "Pipeline",
		terms_of_service_not_available: "Terms of service not available.",
		your_name: "Your name",
		name_nickname: "Name / nickname",
		your_email: "Your email",
		your_email_com: "your@email.com",
		verify_email: "Verify email",
		references_and_files: "References and files",
		character_reference_sheets_psd_for_rigging_mood_boards_etc:
			"Character reference sheets, PSD for rigging, mood boards, etc.",
		link_a_file: "Link a file",
		upload_file: "Upload file",
		extra_info: "Extra info",
		pose_traits_multiple_characters_add_ons_etc:
			"Pose, traits, multiple characters, add-ons, etc.",
		your_answer: "Your answer",
		i_understand_that_submitting_this_request_does_not_guarantee_that:
			"I understand that submitting this request does not guarantee that",
		will_accept_my_commission: "will accept my commission",
		i_agree_to_receive_marketing_emails: "I agree to receive marketing emails",
		estimated_total: "Estimated Total:",
		request_as_guest_or_sign_up_to: "Request as guest, or sign up to:",
		track_requests: "Track requests",
		follow_artists: "Follow artists",
		priority_support: "Priority support",
		sign_up_login: "Sign up / login",
		by_submitting_a_request_you_agree_to_terms_of_service_and_acknowledge_you_v:
			"By submitting a request, you agree to Terms of Service and acknowledge you've read our Privacy Policy.",
		commission_request_b8445a: "Commission Request",
		fill_out_the_form_to_request_a_commission_from:
			"Fill out the form to request a commission from",
		final_delivery: "Final delivery",
		personal: "Personal",
		accepted: "Accepted",
		set_to_wip: "Set to WIP",
		final_delivery_d8af9e: "Final Delivery",
		no_delivery_files_were_attached_yet: "No delivery files were attached yet.",
		help: "Help",
		submitted: "Submitted",
		overview: "Overview",
		enjoyed_the_result: "Enjoyed the result?",
		invoice: "Invoice",
		archive_this_request: "Archive this request",
		hold_to_archive: "Hold to archive",
		client: "Client",
		artist: "Artist",
		unknown: "Unknown",
		profile_data_is_not_available: "Profile data is not available.",
		description_3583fc: "description",
		back_88c197: "← Back",
		allowed_uses: "Allowed uses",
		download_all_files: "Download all files",
		file: "File",
		attached_media_ready_to_preview: "Attached media · ready to preview",
		delivery_update: "Delivery update",
		latest_update: "Latest update",
		verified_media: "Verified media",
		respecting_any_applicable_privacy_arrangements_the_artist_can_submit_media_:
			"Respecting any applicable privacy arrangements, the artist can submit media here to represent your commission.",
		tagged_characters: "Tagged Characters",
		your_commission_s_verified_media_may_be_publicly_featured_in_the_gallery_of:
			"Your commission's verified media may be publicly featured in the gallery of the characters you tag.",
		add: "Add",
		you_may_remove_or_tag_characters_whenever_you_please_as_long_as_the_charact:
			"You may remove or tag characters whenever you please, as long as the character curator allows it.",
		request_details: "Request details",
		this_review_is_now_visible_to_artists_when_you_submit_a_commission_request:
			"This review is now visible to artists when you submit a commission request.",
		recommend: "Recommend",
		recent: "Recent",
		difficulties: "Difficulties:",
		anonymize_semi_public_review: "Anonymize semi-public review",
		your_feedback_helps_make_the_platform_safer_for_everyone:
			"Your feedback helps make the platform safer for everyone.",
		no_image: "No image",
		commission_listing_selected_by_the_client:
			"Commission listing selected by the client",
		starting_at: "Starting at",
		licence: "Licence",
		request_id: "Request ID",
		client_brief: "Client brief",
		references_and_files_f7d356: "References and Files",
		preview_unavailable: "Preview unavailable",
		open_original_file: "Open original file",
		download_file: "Download file",
		no_references_attached: "No references attached.",
		more: "More",
		categories: "Categories",
		select_categories: "Select categories...",
		warnings: "Warnings",
		select_warnings: "Select warnings...",
		catalogs: "Catalogs",
		select_catalogs: "Select catalogs...",
		create_portfolio_folder: "Create portfolio folder",
		create_folder: "Create folder",
		new_portfolio_catalog: "New portfolio catalog",
		group_related_portfolio_posts_into_one_catalog:
			"Group related portfolio posts into one catalog.",
		folder_name: "Folder name *",
		character_illustrations: "Character illustrations",
		a_selected_collection_of_finished_character_artwork:
			"A selected collection of finished character artwork.",
		optional_you_can_edit_this_later: "Optional. You can edit this later.",
		rename_portfolio_folder: "Rename portfolio folder",
		rename_folder: "Rename folder",
		update_the_name_and_description_of_this_portfolio_catalog:
			"Update the name and description of this portfolio catalog.",
		folder_name_898add: "Folder name",
		optional_leave_this_empty_to_remove_the_current_description:
			"Optional. Leave this empty to remove the current description.",
		loading_shop_item: "Loading shop item...",
		follow: "Follow",
		"1_review": "• 1 review",
		sold: "sold",
		how_much_would_you_like_to_pay: "How much would you like to pay?",
		"25_72_or_more": "25.72 or more",
		was: "Was",
		off_1a3fb5: "% off)",
		suggests: "suggests",
		read_more: "Read more",
		buy_now: "Buy now",
		add_to_basket: "Add to basket",
		more_options: "More options",
		view_details: "View details",
		profile: "Profile",
		orders: "Orders",
		characters: "Characters",
		settings: "Settings",
		logout: "Logout",
		user_menu: "User Menu",
		no_characters_found: "No characters found",
		status: "Status",
		not_found: "Not found",
		manage_folder: "Manage folder",
		reviews: "reviews)",
		reviews_8ff41b: "reviews",
		loading_artist: "Loading artist…",
		loading_client: "Loading client…",
		payment: "Payment",
		confirmed: "Confirmed",
		timeline: "Timeline",
		showing: "Showing",
		requests_8f5fc4: "requests",
		page: "Page",
		refreshing: "Refreshing",
		no_requests_found: "No requests found",
		pending: "Pending",
		paid: "Paid",
		failed: "Failed",
		refunded: "Refunded",
		in_progress: "In progress",
		delivered: "Delivered",
		completed: "Completed",
		cancelled: "Cancelled",
		base_price_11973a: "Base Price",
		created: "Created",
		publish: "Publish",
		view_page: "View Page",
		delete: "Delete",
		services_35105e: "services",
		no_services_found_create_one_to_get_started:
			"No services found. Create one to get started!",
		see_all: "See all",
		selected: "selected",
		no_results_found: "No results found.",
		clear_filters: "Clear filters",
		asc: "Asc",
		desc: "Desc",
		pin_to_left: "Pin to left",
		pin_to_right: "Pin to right",
		move_to_left: "Move to Left",
		move_to_right: "Move to Right",
		columns: "Columns",
		toggle_columns: "Toggle Columns",
		select_row: "Select row",
		select_all: "Select all",
		breadcrumb: "breadcrumb",
		carousel: "Carousel",
		previous_slide: "Previous slide",
		next_slide: "Next slide",
		increase_value: "Increase value",
		decrease_value: "Decrease value",
		pagination: "pagination",
		go_to_previous_page: "Go to previous page",
		previous: "Previous",
		go_to_next_page: "Go to next page",
		next: "Next",
		more_pages: "More pages",
		sidebar: "Sidebar",
		displays_the_mobile_sidebar: "Displays the mobile sidebar.",
		toggle_sidebar: "Toggle Sidebar",
		loading: "Loading",
		create_commission: "Create Commission",
		form_templates: "Form Templates",
		new_template: "New Template",
		no_templates_yet: "No templates yet",
		start_by_creating_a_reusable_request_form_for_portraits_emotes_illustration:
			"Start by creating a reusable request form for portraits, emotes, illustrations, character sheets, or any other commission type.",
		create_template: "Create Template",
		no_matching_templates: "No matching templates",
		try_a_different_search_phrase_or_change_sorting:
			"Try a different search phrase or change sorting.",
		updated: "Updated",
		more_333b55: "more",
		no_fields_yet: "No fields yet",
		edit: "Edit",
		delete_template: "Delete Template",
		on_hold: "On Hold",
		archived: "Archived",
		service: "Service",
		archive_service: "Archive Service",
		from_218bca: "From",
		my_basket: "My basket",
		"1_item": "1 item •",
		remove_all: "Remove all",
		note_to_artist: "Note to artist",
		optional: "Optional",
		leave_an_important_note_say_thanks_or_just_say_something_nice_to_the_artist:
			"Leave an important note, say thanks, or just say something nice to the artist!",
		more_from: "More from",
		s_shop: "'s shop",
		no_more_items: "No more items",
		your_name_7b44f2: "Your name*",
		enter_your_name: "Enter your name",
		your_email_35787b: "Your email*",
		enter_your_email: "Enter your email",
		email_is_not_shared_with_anyone_only_used_by_familiar_for_order_updates:
			"Email is NOT shared with ANYONE. Only used by Familiar for order updates.",
		for_all_items: "For all items",
		due_now: "Due now",
		currency_conversion_fees_may_apply: "Currency conversion fees may apply",
		pay_with_mollie: "Pay with Mollie",
		by_purchasing_this_item_you_agree_to_familiar_s:
			"By purchasing this item, you agree to Familiar's",
		terms_of_service: "Terms of Service",
		and_acknowledge_our: "and acknowledge our",
		privacy_policy: "Privacy Policy",
		logging_out: "Logging out…",
		could_not_load_your_requests: "Could not load your requests",
		back_to_shop: "Back to shop",
		category_not_found: "Category not found",
		loading_items: "Loading items...",
		no_items_in_this_category: "No items in this category",
		loading_shop_items: "Loading shop items...",
		no_items_found: "No items found",
		in_folder: "in folder",
		user_not_found: "User not found",
		folder_not_found_for_tab: "Folder not found for tab",
		portfolio_folder_not_found: "Portfolio folder not found",
		could_not_load_profile_content: "Could not load profile content",
		tab_not_found: "Tab not found",
		website: "Website",
		select_a_conversation_to_start_chatting:
			"Select a conversation to start chatting.",
		dms: "DMs",
		no_messages_yet: "No messages yet",
		no_request_chats_found: "No inquiries yet",
		no_direct_messages_found: "No conversations yet",
		check_console_for_more_details: "Check console for more details.",
		details: "Details",
		title_pricing_category_forms: "Title, pricing, category & forms",
		showcase_your_work: "Showcase your work",
		review_and_publish: "Review and publish",
		edit_commission: "Edit commission",
		new_commission: "New commission",
		update_your_offering_details: "Update your offering details",
		set_up_a_new_offering: "Set up a new offering",
		existing_media: "Existing media",
		commission_updated_successfully: "Commission updated successfully.",
		commission_created_and_published: "Commission created and published.",
		create_commission_c13e6f: "Create commission",
		edit_your_commission_offering: "Edit your commission offering.",
		create_and_publish_a_commission_offering:
			"Create and publish a commission offering.",
		select_category: "Select category",
		assigned: "Assigned",
		title_and_description_are_complete: "Title and description are complete",
		at_least_one_media_item_uploaded: "At least one media item uploaded",
		price_is_set: "Price is set",
		save_changes: "Save changes",
		publish_commission: "Publish commission",
		free: "Free",
		included: "Included",
		new_field: "New Field",
		unnamed_option: "Unnamed Option",
		are_you_sure_you_want_to_delete_this_field_this_action_cannot_be_undone:
			"Are you sure you want to delete this field? This action cannot be undone.",
		field_label: "Field Label",
		description_help_text: "Description / Help Text",
		minimum_value: "Minimum Value",
		maximum_value: "Maximum Value",
		edit_form_template: "Edit Form Template",
		create_form_template: "Create Form Template",
		short_text: "Short Text",
		long_text: "Long Text",
		number: "Number",
		date: "Date",
		radio_buttons: "Radio Buttons",
		checkboxes: "Checkboxes",
		dropdown: "Dropdown",
		template_updated_successfully: "Template updated successfully",
		template_created_successfully: "Template created successfully",
		portfolio: "Portfolio",
		wallet: "Wallet",
		quests: "Quests",
		forms: "Forms",
		policies: "Policies",
		queue: "Queue",
		yes: "Yes",
		no: "No",
		preview_mode: "Preview Mode",
		request_as_guest: "Request as Guest",
		request_commission: "Request commission",
		commercial_redistribution: "Commercial redistribution",
		credit_required: "Credit required",
		request_cancelled: "Request cancelled",
		this_commission_request_is_no_longer_active:
			"This commission request is no longer active.",
		payment_required: "Payment required",
		accept_request: "Accept request",
		work_in_progress: "Work in progress",
		request_updated: "Request updated",
		check_the_latest_progress_and_details_below:
			"Check the latest progress and details below.",
		leave_an_optional_tip_for_the_artist:
			"Leave an optional tip for the artist.",
		leave_a_tip: "Leave a tip",
		download_a_copy_of_your_payment_invoice:
			"Download a copy of your payment invoice.",
		download_invoice: "Download invoice",
		hold_the_button_to_archive_this_completed_request:
			"Hold the button to archive this completed request.",
		client_12f3cb: "client",
		artist_02df47: "artist",
		client_accepted_terms: "Client Accepted Terms",
		accepted_terms: "Accepted Terms",
		manage_media: "Manage media",
		report_issue: "Report issue",
		only_upload_media_that_accurately_represents_the_work_completed_for_this_cl:
			"Only upload media that accurately represents the work completed for this client.",
		please_report_if_the_media_misrepresents_the_work_completed:
			"Please report if the media misrepresents the work completed.",
		no_usage_label_provided: "No usage label provided.",
		no_additional_details_provided: "No additional details provided.",
		folder_preview: "Preview",
		folder_create_failed: "The folder could not be created.",
		folder_rename_failed: "The folder could not be renamed.",
		direct_messages: "Direct messages",
		no_conversations_found: "No matching conversations",
		folder_name_is_required: "Folder name is required.",
		maximum_100_characters: "Maximum 100 characters.",
		creating: "Creating...",
		renaming: "Renaming...",
		new_portfolio_folder: "New portfolio folder",
		commercial_content: "Commercial: Content",
		commercial_merchandising: "Commercial: Merchandising",
		digital_download: "Digital download",
		files_are_instantly_available_after_purchase_returns_and_exchanges_are_not_:
			"Files are instantly available after purchase. Returns and exchanges are not accepted.",
		no_description_provided: "No description provided.",
		remove_bookmark: "Remove bookmark",
		save_bookmark: "Save bookmark",
		this_user_hasn_t_added_any_characters_yet:
			"This user hasn't added any characters yet.",
		play_auto: "Play auto",
		pause_auto: "Pause auto",
		no_commissions_found_matching_your_filters:
			"No commissions found matching your filters.",
		closed: "Closed",
		successfully_copied_profile_link: "Successfully copied profile link",
		awaiting_review: "Awaiting review",
		submitted_date: "Submitted date",
		mentors: "Mentors",
		met_in_person: "Met in person",
		no_data_available: "No data available",
		loading_2553d2: "Loading...",
		unpin_row: "Unpin row",
		pin_row: "Pin row",
		carousel_2c6160: "carousel",
		slide: "slide",
		scroll_to_end: "Scroll to end",
		scroll_to_start: "Scroll to start",
		commission_messaging_and_progress_updates:
			"Commission Messaging and Progress Updates",
		messaging: "Messaging",
		delivery_and_revision_workflow: "Delivery and Revision Workflow",
		delivery: "Delivery",
		better_artist_and_commission_discovery:
			"Better Artist and Commission Discovery",
		discovery: "Discovery",
		reviews_and_completed_work_showcases:
			"Reviews and Completed-Work Showcases",
		artist_availability_and_queue_management:
			"Artist Availability and Queue Management",
		mobile_experience: "Mobile Experience",
		mobile: "Mobile",
		a_look_at_what_we_are_building_planning_and_exploring_next:
			"A look at what we are building, planning, and exploring next.",
		failed_to_load_commission_requests: "Failed to load commission requests.",
		last_updated: "Last updated",
		are_you_sure_you_want_to_delete_this_template_this_action_cannot_be_undone:
			"Are you sure you want to delete this template? This action cannot be undone.",
		created_date: "Created date",
		status_updated: "Status updated",
		failed_to_update_status: "Failed to update status",
		are_you_sure_you_want_to_archive_this_service_this_action_cannot_be_undone_:
			"Are you sure you want to archive this service? This action cannot be undone and you will not be able to unarchive it later.",
		add_more_items_to_your_basket: "Add more items to your basket",
		subcategory: "Subcategory",
		try_adjusting_your_filters_or_search_query:
			"Try adjusting your filters or search query.",
		an_unknown_error_occurred: "An unknown error occurred.",
		shop_feature_is_coming_soon: "Shop feature is coming soon!",
		coming_soon: "Coming soon",
		try_a_different_search: "Try a different search.",
		request_conversations_will_show_up_here:
			"Request conversations will show up here.",
		start_a_new_conversation: "Start a conversation from someone’s profile.",
		image: "Image",
		video: "Video",
		you_have_accepted_this_request_and_are_waiting_for_the_client_to_complete_p:
			"You have accepted this request and are waiting for the client to complete payment before work begins.",
		this_request_was_accepted_and_is_waiting_for_payment_before_work_begins:
			"This request was accepted and is waiting for payment before work begins.",
		pending_response: "Pending response",
		waiting_for_artist_response: "Waiting for artist response",
		you_have_a_new_commission_request_waiting_for_your_response:
			"You have a new commission request waiting for your response.",
		the_artist_has_not_responded_to_this_request_yet:
			"The artist has not responded to this request yet.",
		you_have_accepted_this_request: "You have accepted this request.",
		the_artist_has_accepted_this_request:
			"The artist has accepted this request.",
		you_are_currently_working_on_this_commission:
			"You are currently working on this commission.",
		the_artist_is_currently_working_on_your_commission:
			"The artist is currently working on your commission.",
		delivery_sent: "Delivery sent",
		delivery_ready: "Delivery ready",
		you_have_sent_the_final_delivery_to_the_client_for_review:
			"You have sent the final delivery to the client for review.",
		your_files_are_ready_to_review_in_the_delivery_tab:
			"Your files are ready to review in the delivery tab.",
		uncategorized: "Uncategorized",
		in_progress_829ac8: "In Progress",
		ready_for_review: "Ready for review",
		img: "IMG",
		file_20ed7c: "FILE",
		value0_value1_unread_messages: "{{value0}}, {{value1}} unread messages",
		open_value0: "Open {{value0}}",
		remove_value0: "Remove {{value0}}",
		back_from_value0: "Back from {{value0}}",
		option_value0: "Option {{value0}}",
		view_post_value0: "View post: {{value0}}",
		pay_value0: "Pay {{value0}}",
		download_file_value0: "Download file {{value0}}",
		verified_media_value0: "Verified media {{value0}}",
		attachment_value0: "Attachment {{value0}}",
		show_image_value0: "Show image {{value0}}",
		search_value0: "Search {{value0}}...",
		preview_value0: "Preview {{value0}}",
		value0_cover: "{{value0}} cover",
		previous_image_for_value0: "Previous image for {{value0}}",
		next_image_for_value0: "Next image for {{value0}}",
		updated_value0: "Updated {{value0}}",
		submitted_value0: "Submitted {{value0}}",
		open_actions_for_value0: "Open actions for {{value0}}",
		unpin_value0_column: "Unpin {{value0}} column",
		enter_a_number: "Enter a number",
		confirm: "Confirm",
		search: "Search…",
		lifeline: "Lifeline",
		home: "Home",
		command_palette: "Command Palette",
		search_for_a_command_to_run: "Search for a command to run...",
		commission_request_id: "Commission request {{id}}",
		review_tab: "Review",
	},
};

export default en;
