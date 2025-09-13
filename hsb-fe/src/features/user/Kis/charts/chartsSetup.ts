import {
  Chart as ChartJS,
  TimeScale, LinearScale, CategoryScale,
  Tooltip, Legend, Filler, PointElement, LineElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// 중요: 이 한 줄이 "candlestick/ohlc" 타입을 Chart.js 레지스트리에 등록하면서
// 타입(Module Augmentation)도 붙여줍니다.
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';

ChartJS.register(
  TimeScale, LinearScale, CategoryScale,
  Tooltip, Legend, Filler, PointElement, LineElement,
  CandlestickController, CandlestickElement,
);