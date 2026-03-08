## Packages
recharts | Dashboard analytics and charts
date-fns | Formatting dates for invoices and tables
lucide-react | Icons for the UI

## Notes
- Using custom JWT Authentication. Tokens are stored in localStorage (`jwt_token`).
- All API requests MUST include `Authorization: Bearer <token>`.
- We implement a custom `fetchWithAuth` wrapper to handle this automatically for React Query.
- Tailwind config needs font family extensions for `sans` (DM Sans) and `display` (Manrope).
