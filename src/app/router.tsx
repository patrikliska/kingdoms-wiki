import { createBrowserRouter } from 'react-router';
import { BuildingDetailPage } from '../modules/buildings/BuildingDetailPage';
import { BuildingsPage } from '../modules/buildings/BuildingsPage';
import { DailyQuestsPage } from '../modules/quests/DailyQuestsPage';
import { QuestsPage } from '../modules/quests/QuestsPage';
import { TribesPage } from '../modules/tribes/TribesPage';
import { UnitsPage } from '../modules/units/UnitsPage';
import { WallsPage } from '../modules/walls/WallsPage';
import { HomePage } from './HomePage';
import { Layout } from './Layout';
import { MorePage } from './MorePage';
import { NotFoundPage } from './NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'quests', element: <QuestsPage /> },
      { path: 'quests/daily', element: <DailyQuestsPage /> },
      { path: 'quests/:questId', element: <QuestsPage /> },
      { path: 'tribes', element: <TribesPage /> },
      { path: 'buildings', element: <BuildingsPage /> },
      { path: 'buildings/:buildingId', element: <BuildingDetailPage /> },
      { path: 'walls', element: <WallsPage /> },
      { path: 'units', element: <UnitsPage /> },
      { path: 'units/:unitId', element: <UnitsPage /> },
      { path: 'more', element: <MorePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
