import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { getCategory } from '@/constants/categories';

export function CategoryIcon({ categoryId, size = 40 }: { categoryId: string; size?: number }) {
  const category = getCategory(categoryId);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: category.color + '22',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <MaterialCommunityIcons
        name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={size * 0.55}
        color={category.color}
      />
    </View>
  );
}
