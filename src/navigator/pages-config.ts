import { InitialPage } from '@/pages/core/InitialPage';
import { RootPage } from '@/pages/core/RootPage';
import { EditUserProfile } from '@/pages/core/EditUserProfile';
import { ReportIssuePage } from '@/pages/core/ReportIssuePage';
import { CrashTestPage } from '@/pages/core/CrashTestPage';
import { MapPage } from '@/pages/map/MapPage';

export type NavigatorPages = {
    TfTestingPage: undefined;
    InitialPage: undefined;
    RootPage: undefined;
    EditUserProfile: undefined;
    ReportIssuePage: undefined;
    CrashTestPage: undefined;
    MainMap: { userId?: number } | undefined;
    TermsOfUse: { nextPageName?: string };
    EditProfile: undefined;
    JoinSearchParty_UserInfo:undefined;
    JoinSearchParty: { joinKey?: string };
    CreateSearchParty_UserInfo: undefined;
    CreateSearchParty_ShowCode: undefined;
    CreateSearchParty_Details: undefined;
    //InitialSearchParty: undefined;
    UserActiveSearchPartyInfo: undefined;
    TeamPage: undefined;
    UpdatesPage: undefined;
    SettingsPage: undefined;
}
const corePages: NavigatorItem[] = [

    {
        name: 'InitialPage',
        component: InitialPage
    },
    {
        name: 'RootPage',
        component: RootPage
    },
    {
        name: 'EditUserProfile',
        component: EditUserProfile
    },
    {
        name: 'ReportIssuePage',
        component: ReportIssuePage
    },
    {
        name: 'CrashTestPage',
        component: CrashTestPage
    },
    {
        name: 'MainMap',
        component: MapPage
    }
];


export const screensLinks = {
    JoinSearchParty: 'JoinSearchParty/:joinKey'
};

export const appPages: NavigatorItem[] = corePages;

export const appCorePages: NavigatorItem[] = corePages; //.concat(devPages, pgSystem, pgSelectors, pgMap, pgCoreOthers);

export type BaseNavigatorPageProps = {
    title: string,
}
export type NavigatorItem = {
    name?: keyof NavigatorPages,
    component?: any,
    children?: NavigatorItem[];
    options?: any,
    initialParams?: any,
    _description?: string,
    _title?: string,
    _isNotForMenu?: boolean,
    _kbItemKey?: string
};
