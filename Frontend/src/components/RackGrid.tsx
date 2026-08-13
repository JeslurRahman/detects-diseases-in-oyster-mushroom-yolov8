/** RackGrid — grid of BagCards (5 columns, matching the mockup). */
import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import type { BagStatus } from '@/types';

import { BagCard } from './BagCard';

interface Props {
  bags: BagStatus[];
  onSelect: (bag: BagStatus) => void;
  columns?: number;
}

export function RackGrid({ bags, onSelect, columns = 5 }: Props) {
  const { spacing } = useAppTheme();
  const gap = spacing.sm;
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const cellWidth = width > 0 ? (width - gap * (columns - 1)) / columns : 0;

  return (
    <View
      onLayout={onLayout}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}
    >
      {width > 0 &&
        bags.map((bag, i) => (
          <View key={`${bag.bag_id}-${bag.detection_id}`} style={{ width: cellWidth }}>
            <BagCard
              bagId={bag.bag_id}
              status={bag.status}
              index={i}
              onPress={() => onSelect(bag)}
            />
          </View>
        ))}
    </View>
  );
}
