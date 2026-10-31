import type { IconName } from '../../components/Icon';
import type { BuildingCategory } from '../../data/buildingTypes';

export const categoryIcon: Record<BuildingCategory, IconName> = {
  resources: 'wheat',
  infrastructure: 'buildings',
  military: 'shield',
};
