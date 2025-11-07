# Munify Development Prompt

You are developing for the Munify application, a React 19 + TypeScript + Vite project using shadcn/ui components and TanStack Query. Follow the established patterns in `src/features/master/pages/RolesManagement.tsx` as the reference implementation.

---

## Requirements

### 1. Project Structure & Organization
- Place pages in `src/features/{domain}/pages/` matching existing domain structure
- Add routes to `src/routes/index.tsx` under `/main` protected routes
- Update `src/components/app-sidebar.tsx` navigation
- Use PascalCase for component file names

### 2. Data Management with TanStack Query
- **ALWAYS** use `useQuery` from `@tanstack/react-query` for fetching data (GET operations)
- **ALWAYS** use `useMutation` from `@tanstack/react-query` for create/update/delete operations
- Import and use `useQueryClient()` for cache invalidation
- Reference `RolesManagement.tsx` for the exact pattern
- Use descriptive `queryKey` arrays (plural nouns: `['roles']`, `['organizations']`)
- Call `queryClient.invalidateQueries({ queryKey })` in mutation `onSuccess`
- Call `apiService` inside `queryFn` and `mutationFn` only
- Destructure `data`, `isLoading`, `error`, `isError` from queries
- Use `isPending` from mutations for loading states
- Configure `onSuccess` to show alerts, close dialogs, and reset forms
- Configure `onError` to show error alerts

### 3. API Integration
- Use `apiService` from `@/services/api` (methods: `get()`, `post()`, `put()`, `patch()`, `delete()`)
- Call `apiService` only inside `queryFn` and `mutationFn`
- Use `alerts.success()` and `alerts.error()` from `@/lib/alerts` for all user feedback
- Handle all errors gracefully with clear messages

### 4. UI Components & Styling
- Use ONLY shadcn/ui components from `@/components/ui/`
- Use Lucide React icons exclusively
- Apply Tailwind CSS classes only (no custom CSS)
- Pages must use existing `AppLayout` wrapper

### 5. Data Tables
- Use `DataTable` component from `@/components/data-table/data-table.tsx` for tabular data
- Define columns with `ColumnDef<TData, TValue>[]` from `@tanstack/react-table`
- Include built-in features: sorting, filtering, pagination, column visibility, export

### 6. Form Handling
- Use `useState` for form state management
- Implement custom validation with specific error messages
- Use shadcn/ui form components exclusively
- Reset forms in mutation `onSuccess` callbacks
- Display validation errors below form fields

### 7. Loading & Error States
- Show loading indicators when `isLoading` is true
- Disable buttons/inputs when mutation `isPending` is true
- Use `Alert` component from shadcn/ui for error displays
- Provide fallback UI when data fails to load
- Handle all states: loading, success, error, empty

### 8. TypeScript & Code Quality
- Define proper TypeScript interfaces for all data types
- Use path aliases (`@/components`, `@/lib`, `@/hooks`) for imports
- Remove unused imports, variables, and console logs
- Use Tailwind responsive classes for mobile-first design
- Maintain consistency with existing patterns

---

## Implementation Steps

1. Create page in `src/features/{domain}/pages/`
2. Add route in `src/routes/index.tsx` under `/main`
3. Update navigation in `src/components/app-sidebar.tsx`
4. Define TypeScript interfaces for data types
5. Implement `useQuery` with proper `queryKey` and `queryFn`
6. Implement `useMutation` with `mutationFn`, `onSuccess`, `onError`
7. Call `invalidateQueries` in mutation `onSuccess`
8. Handle loading, error, and empty states
9. Use shadcn/ui components exclusively
10. Use `DataTable` for tabular displays
11. Use `alerts.success()` and `alerts.error()` for feedback
12. Show loaders during data operations
13. Implement form validation
14. Test all states (loading, success, error, empty)
15. Clean up unused imports

---

## Reference Implementation
Study `src/features/master/pages/RolesManagement.tsx` as the standard implementation pattern.

