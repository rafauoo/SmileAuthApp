import chroma from "chroma-js";
export default function getColor(score: number) {
    if (score <= 50) {
      return chroma.mix("#F44336", "#FFEB3B", score / 50, "rgb").hex();
    }
    return chroma.mix("#FFEB3B", "#4CAF50", (score - 50) / 50, "rgb").hex();
};