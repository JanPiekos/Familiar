# Familiar
Familiar line

## Development profiling

React Scan is disabled by default so normal development previews avoid its rendering overhead.
To profile React renders, set `VITE_REACT_SCAN=true` in your local environment and restart the development server.
The profiler is never included in production builds.

## Trusted checkout links

The external-link guard lets the Przelewy24 checkout at `https://secure.przelewy24.pl` open directly. To trust another provider, set `VITE_EXTERNAL_LINK_ALLOWED_ORIGINS` to a comma-separated list of exact HTTPS origins before building Familiar. For example, a test deployment can set it to `https://sandbox.przelewy24.pl`. Restart the dev server after changing it locally. Each subdomain and non-default port needs its own entry.
