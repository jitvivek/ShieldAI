import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface WeeklyChartProps {
  data: number[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const screenWidth = Dimensions.get('window').width - 40;
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = data.length === 7 ? data : [0, 0, 0, 0, 0, 0, 0];

  return (
    <View className="bg-surface-light rounded-xl p-3">
      <BarChart
        data={{
          labels,
          datasets: [{ data: chartData }],
        }}
        width={screenWidth - 24}
        height={160}
        fromZero
        showValuesOnTopOfBars
        withInnerLines={false}
        chartConfig={{
          backgroundColor: '#F8FAFC',
          backgroundGradientFrom: '#F8FAFC',
          backgroundGradientTo: '#F8FAFC',
          decimalCount: 0,
          color: () => '#0D9488',
          labelColor: () => '#64748B',
          barPercentage: 0.6,
          propsForLabels: { fontSize: 10, fontFamily: 'NotoSans' },
        }}
        style={{ borderRadius: 12 }}
        yAxisLabel=""
        yAxisSuffix=""
      />
    </View>
  );
}
