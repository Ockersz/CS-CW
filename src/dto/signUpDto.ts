export class SignUpDto {
  username: string;
  password: string;
  email: string;
  mfa: boolean;
  refreshToken: string | null;
}
