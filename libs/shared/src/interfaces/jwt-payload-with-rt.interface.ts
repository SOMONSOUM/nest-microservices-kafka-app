import { JwtPayload } from './jwt-payload.interface';

export interface JwtPayloadWithRt extends JwtPayload {
  refresh_token: string;
}
