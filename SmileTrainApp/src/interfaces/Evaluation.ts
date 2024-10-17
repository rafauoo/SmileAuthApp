import { CommentData } from "./Comment";

export default interface Evaluation {
    score: number;
    comment: CommentData;
    date: string;
    video: null | string;
}
