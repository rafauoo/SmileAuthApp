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
            labels = [...labelsXaxis.year]; // Kopia etykiet
            data = Array(12).fill(0);
            let countPerMonth = Array(12).fill(0);
        
            let monthsMap = new Map();
        
            // Tworzenie mapy dla ostatnich 12 miesięcy
            for (let i = 11; i >= 0; i--) {
                let date = moment().subtract(i, 'months');
                let key = date.format('YYYY-MM');
                let monthIndex = date.month(); // Indeks miesiąca zgodnie z labelsXaxis.year
        
                monthsMap.set(key, { index: monthIndex, score: 0, count: 0 });
            }
        
            history.forEach(evaluation => {
                const evaluationDate = moment(new Date(evaluation.date));
                let key = evaluationDate.format('YYYY-MM');
        
                if (monthsMap.has(key)) {
                    let entry = monthsMap.get(key);
                    data[entry.index] += evaluation.score;
                    countPerMonth[entry.index] += 1;
                }
            });
        
            // Obliczanie średnich wyników
            data = data.map((score, index) => (countPerMonth[index] > 0 ? score / countPerMonth[index] : 0));
        
            // Przesunięcie etykiet zgodnie z ostatnimi 12 miesiącami
            let shiftIndex = today.month() + 1; // Indeks, od którego zaczynamy przesunięcie
            data = data.slice(shiftIndex).concat(data.slice(0, shiftIndex));
            labels = labels.slice(shiftIndex).concat(labels.slice(0, shiftIndex));
        
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