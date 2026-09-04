import { apiSlice } from '@/app.Commons/dataLayer/apiSlice';
import { v4 as uuidv4 } from 'uuid';

import type { User, UserPatch } from './userDto';
import { APP_CONFIG } from '@/app.Impl/configs/app-config';
const BASE_USERS_URL = APP_CONFIG.BASE_API_URL + 'users';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<User, number>({
      query: (userId) => BASE_USERS_URL + `/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),
    getMyUser: builder.query<User, void>({
      query: () => BASE_USERS_URL + '/me',
      providesTags: (result) => [{ type: 'User', id: result?.Id ?? 'ME' }],
    }),
    getUsers: builder.query<User[], void>({
      query: () => BASE_USERS_URL,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ Id }) => ({ type: 'User' as const, id: Id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),
    patchUser: builder.mutation<User, { userId: number; patch: UserPatch }>({
      query: ({ userId, patch }) => ({
        url: BASE_USERS_URL + `/${userId}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'User', id: userId }],
    })
  })
});

export const {
  useGetUserQuery,
  useLazyGetUserQuery,
  useGetMyUserQuery,
  useLazyGetMyUserQuery,
  useGetUsersQuery,
  useLazyGetUsersQuery,
  usePatchUserMutation
} = userApi;

/** Alias for the RTK-generated `useGetUserQuery`. */
export const useGetUser = useGetUserQuery;

/** Alias for the RTK-generated `useGetMyUserQuery`. */
export const useGetMyUser = useGetMyUserQuery;

/** Alias for the RTK-generated `useGetUsersQuery`. */
export const useGetUsers = useGetUsersQuery;

/** Alias for the RTK-generated `usePatchUserMutation`. */
export const usePatchUser = usePatchUserMutation;

