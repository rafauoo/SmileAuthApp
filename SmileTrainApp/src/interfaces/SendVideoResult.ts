import { CommentData } from "./CommentData";

export default interface SendVideoResult {
    result?: string;
    comment?: CommentData;
    success: boolean;
    error?: string;
    nonStandard?: boolean;
  }