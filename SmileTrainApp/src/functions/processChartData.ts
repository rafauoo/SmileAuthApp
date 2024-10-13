import Evaluation from "../interfaces/Evaluation";
import moment from "moment"
import ChartData from "../interfaces/ChartData";
import Labels from "../interfaces/Labels";

export default function processChartData(history: Evaluation[], period: string, periodList: string[], labelsXaxis: Labels): ChartData {
    let labels: string[] = [];
    let data: number[] = [];
    const today = moment();
    switch (period) {
        case periodList[0]:
            // labels
            labels = labelsXaxis.week;
            
            data = Array(7).fill(0);
            let countPerDay = Array(7).fill(0);
            history.forEach(evaluation => {
                const evaluationDate = moment((new Date(evaluation.date)));
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
            break;
        case periodList[1]:
            // labels
            for (let i = 0; i < 4; i++) {
                const startOfWeek = today.clone().subtract((i + 1) * 7, 'days').format('DD/MM');
                const endOfWeek = today.clone().subtract(i * 7, 'days').format('DD/MM');
                labels.push(`${startOfWeek}-${endOfWeek}`);
            }
            labels.reverse()

            data = Array(4).fill(0);
            let countPerWeek = Array(4).fill(0);
    
            history.forEach(evaluation => {
                const evaluationDate = moment((new Date(evaluation.date)));
                const diffInWeeks = today.diff(evaluationDate, 'weeks');
    
                if (diffInWeeks >= 0 && diffInWeeks < 4) {
                    const weekIndex = Math.floor(diffInWeeks);
                    data[3 - weekIndex] += evaluation.score;
                    countPerWeek[3 - weekIndex] += 1;
                }
            });
    
            data = data.map((score, index) => (countPerWeek[index] > 0 ? score / countPerWeek[index] : 0));
            break;
        case periodList[2]:
            // labels
            labels = labelsXaxis.year;

            data = Array(12).fill(0);
            let countPerMonth = Array(12).fill(0);

            history.forEach(evaluation => {
                const evaluationDate = moment((new Date(evaluation.date)));
                const month = evaluationDate.month();
                if (evaluationDate.year() === today.year()) {
                    data[month] += evaluation.score;
                    countPerMonth[month] += 1;
                }
            });
    
            data = data.map((score, index) => (countPerMonth[index] > 0 ? score / countPerMonth[index] : 0));
            
            data = data.slice(today.month() + 1).concat(data.slice(0, today.month() + 1));
            labels = labels.slice(today.month() + 1).concat(labels.slice(0, today.month() + 1));
            break;
        default:
            break;
    }
    const newData = data.map(value => value === 0 ? 0 : value)
    return ({
        labels,
        datasets: [{ data: newData },         {
            data: [100],
            withDots: false,
          }]
    });
};