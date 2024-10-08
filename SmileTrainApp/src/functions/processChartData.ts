import Evaluation from "../interfaces/Evaluation";
import { Period } from "../types/Period";
import moment from "moment"

export default function processChartData(history: Evaluation[], period: Period) {
    let labels: string[] = [];
    let data: number[] = [];
    const today = moment();

    if (period === "week") {
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        data = Array(7).fill(0);
        let countPerDay = Array(7).fill(0);

        history.forEach(evaluation => {
            const evaluationDate = moment(evaluation.date);
            const diffInDays = today.diff(evaluationDate, 'days');

            if (diffInDays >= 0 && diffInDays < 7) {
                const dayOfWeek = evaluationDate.isoWeekday() - 1;
                data[dayOfWeek] += evaluation.score;
                countPerDay[dayOfWeek] += 1;
            }
        });

        data = data.map((score, index) => (countPerDay[index] > 0 ? score / countPerDay[index] : 0));

        data = data.slice(today.isoWeekday()).concat(data.slice(0, today.isoWeekday()));
        labels = labels.slice(today.isoWeekday()).concat(labels.slice(0, today.isoWeekday()));
        console.log(data)

    } else if (period === "month") {
        for (let i = 0; i < 4; i++) {
            const startOfWeek = today.clone().subtract((i + 1) * 7, 'days').format('DD/MM');
            const endOfWeek = today.clone().subtract(i * 7, 'days').format('DD/MM');
            labels.push(`${startOfWeek} - ${endOfWeek}`);
        }
        labels.reverse()
        data = Array(4).fill(0);
        let countPerWeek = Array(4).fill(0);

        history.forEach(evaluation => {
            const evaluationDate = moment(evaluation.date);
            const diffInWeeks = today.diff(evaluationDate, 'weeks');

            if (diffInWeeks >= 0 && diffInWeeks < 4) {
                const weekIndex = Math.floor(diffInWeeks);
                data[3 - weekIndex] += evaluation.score;
                countPerWeek[3 - weekIndex] += 1;
            }
        });

        data = data.map((score, index) => (countPerWeek[index] > 0 ? score / countPerWeek[index] : 0));

        // Set date range for each week
    } else if (period === "year") {
        // This year
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        data = Array(12).fill(0);
        let countPerMonth = Array(12).fill(0);

        history.forEach(evaluation => {
            const evaluationDate = moment(evaluation.date);
            const month = evaluationDate.month(); // 0: Jan, 11: Dec
            if (evaluationDate.year() === today.year()) {
                data[month] += evaluation.score;
                countPerMonth[month] += 1;
            }
        });

        data = data.map((score, index) => (countPerMonth[index] > 0 ? score / countPerMonth[index] : 0));
    }

    return ({
        labels,
        datasets: [{ data }],
    });
};