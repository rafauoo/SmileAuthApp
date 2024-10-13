import Evaluation from '@/src/interfaces/Evaluation';
import processChartData from '../processChartData';
import moment from 'moment';

describe('processChartData', () => {
    const periodList = ['weekly', 'monthly', 'yearly'];
    const labelsXaxis = {
        week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    };

    // Set a fixed date for the tests
    const fixedDate = moment('2024-12-31'); // Example fixed date (YYYY-MM-DD)
    
    beforeAll(() => {
        // Mock the current date
        jest.spyOn(Date, 'now').mockImplementation(() => fixedDate.valueOf());
    });

    afterAll(() => {
        // Restore the original Date function
        jest.restoreAllMocks();
    });

    // Full Evaluation objects with required properties: score, date, comment, video
    const evaluations: Evaluation[] = [
        { score: 80, date: fixedDate.clone().subtract(1, 'days').toISOString(), comment: 'Great job', video: 'video1.mp4' },  // 2024-10-09
        { score: 90, date: fixedDate.clone().subtract(2, 'days').toISOString(), comment: 'Well done', video: 'video2.mp4' },  // 2024-10-08
        { score: 70, date: fixedDate.clone().subtract(7, 'days').toISOString(), comment: 'Needs improvement', video: 'video3.mp4' },  // 2024-10-03
        { score: 100, date: fixedDate.clone().subtract(14, 'days').toISOString(), comment: 'Perfect', video: 'video4.mp4' }, // 2024-09-26
        { score: 60, date: fixedDate.clone().subtract(8, 'days').toISOString(), comment: 'Keep practicing', video: 'video5.mp4' },  // 2024-10-02
    ];

    it('should process data correctly for weekly period', () => {
        const result = processChartData(evaluations, periodList[0], periodList, labelsXaxis);
        expect(result.labels).toEqual(['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue']);
        expect(result.datasets[0].data).toEqual([80, 90, 0, 0, 0, 0, 0]); // Adjust based on actual calculations
    });

    it('should process data correctly for monthly period', () => {
        const result = processChartData(evaluations, periodList[1], periodList, labelsXaxis);
        expect(result.labels).toEqual(["03/12-10/12","10/12-17/12","17/12-24/12","24/12-31/12"]);
        expect(result.datasets[0].data).toEqual([0, 80, 90, 0]); // Adjust based on actual calculations
    });

    it('should process data correctly for yearly period', () => {
        const result = processChartData(evaluations, periodList[2], periodList, labelsXaxis);
        expect(result.labels).toEqual(labelsXaxis.year);
        expect(result.datasets[0].data).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80]); // Adjust based on actual calculations
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