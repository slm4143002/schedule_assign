import { QueryResult } from "pg";
export interface ResultSet extends QueryResult {
  success: boolean;
  errCode: string;
}
