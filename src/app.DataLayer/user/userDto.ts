import type { components } from '@/app.DataLayer/apiSchema';
import type { Concrete } from '@/app.Commons/dataLayer/apiTypes';
import type { InboundUploadedMediaDto, UploadedMediaDto } from '@/app.DataLayer/other/uploadedMediaDto';

type UserDtoSchema = components['schemas']['UserDto'];

// UserController always populates these for an existing user.
// Medias is handled separately from Concrete<>: the schema's own array item
// type leaves every field optional/nullable, so narrowing just the array
// wouldn't narrow its items — UploadedMediaDto (see uploadedMediaDto.ts) does
// that narrowing already, so we swap it in directly.
export type User = Concrete<
  UserDtoSchema,
  'Id' | 'DisplayName' | 'UserName' | 'FullName' | 'Phone' | 'Email'
> & {
  Medias: UploadedMediaDto[];
};

// export type NewUser = Concrete<
//   UserDtoSchema,
//   'UserName' | 'DisplayName' | 'FullName' | 'Phone' | 'Email'
// >;

// Unlike UserDtoSchema, this one doesn't need Concrete<>'s null-narrowing — the
// server's Optional<T> schema transformer faithfully encodes each field's real
// nullability (see UserPatchDto.cs / OptionalPropertySchemaTransformer.cs), so
// the generated type is already accurate. InsertMedias is the exception: its
// schema item type leaves every field optional, so we swap in the already-
// narrowed InboundUploadedMediaDto (see uploadedMediaDto.ts) instead.
export type UserPatch = Pick<
  components['schemas']['UserPatchDto'],
  'DisplayName' | 'FullName' | 'Phone' | 'Email' | 'RemoveMediaIds'
> & {
  InsertMedias?: InboundUploadedMediaDto[] | null;
};
