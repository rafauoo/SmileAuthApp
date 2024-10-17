import { CommentData } from "./Comment";

export default interface SendVideoResult {
    result?: string;
    comment?: CommentData;
    success: boolean;
    error?: string;
    nonStandard?: boolean;
  }