export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}
