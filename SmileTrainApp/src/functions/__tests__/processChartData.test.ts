import Evaluation from '@/src/interfaces/Evaluation';
import processChartData from '../processChartData';
import moment from 'moment';

describe('processChartData', () => {
    const periodList = ['weekly', 'monthly', 'yearly'];
    const labelsXaxis = {
        week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    };

    const fixedDate = moment('2024-12-31');

    beforeAll(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => fixedDate.valueOf());
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    const evaluations: Evaluation[] = [
        { score: 80, date: fixedDate.clone().subtract(1, 'days').toISOString(), comment: { pl: 'Dobrze', en: 'Great job' }, video: 'video1.mp4' },
        { score: 90, date: fixedDate.clone().subtract(2, 'days').toISOString(), comment: { pl: 'Brawo', en: 'Well done' }, video: 'video2.mp4' },
        { score: 70, date: fixedDate.clone().subtract(7, 'days').toISOString(), comment: { pl: 'Poćwicz', en: 'Needs improvement' }, video: 'video3.mp4' },
        { score: 100, date: fixedDate.clone().subtract(14, 'days').toISOString(), comment: { pl: 'Perfekcyjnie', en: 'Perfect' }, video: 'video4.mp4' },
        { score: 60, date: fixedDate.clone().subtract(8, 'days').toISOString(), comment: { pl: 'Postaraj się', en: 'Practice more' }, video: 'video5.mp4' },
    ];

    it('should process data correctly for weekly period', () => {
        const result = processChartData(evaluations, periodList[0], periodList, labelsXaxis);
        expect(result.labels).toEqual(['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue']);
        expect(result.datasets[0].data).toEqual([0, 0, 0, 0, 90, 80, 0]); // Adjust based on actual calculations
    });

    it('should process data correctly for monthly period', () => {
        const result = processChartData(evaluations, periodList[1], periodList, labelsXaxis);
        expect(result.labels).toEqual(["03/12-10/12","10/12-17/12","17/12-24/12","24/12-31/12"]);
        expect(result.datasets[0].data).toEqual([0, 100, 65, 85]);
    });

    it('should process data correctly for yearly period', () => {
        const result = processChartData(evaluations, periodList[2], periodList, labelsXaxis);
        expect(result.labels).toEqual(labelsXaxis.year);
        expect(result.datasets[0].data).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80]);
    });

    it('should return empty data when no evaluations are provided', () => {
        const result = processChartData([], periodList[0], periodList, labelsXaxis);
        expect(result.labels).toEqual(['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue']);
        expect(result.datasets[0].data).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('should handle invalid period gracefully', () => {
        const result = processChartData(evaluations, 'invalid', periodList, labelsXaxis);
        expect(result.labels).toEqual([]);
        expect(result.datasets[0].data).toEqual([]);
    });
});
