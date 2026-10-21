import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InitialPage } from '@/pages/test/InitialPage';
import { RootPage } from '@/pages/test/RootPage';
import { EditUserProfile } from '@/pages/user/EditUserProfile';
import { ReportIssuePage } from '@/pages/core/ReportIssuePage';
import { CrashTestPage } from '@/pages/test/CrashTestPage';
import { MapPage } from '@/pages/map/MapPage';
import { JoinTeamPage } from '@/pages/team/join-team';
import { CreateTeamPage } from '@/pages/team/create-team';
import { TeamDetailsPage } from '@/pages/team/team-details';

export type NavigatorPages = {
    TfTestingPage: undefined;
    InitialPage: undefined;
    RootPage: undefined;
    EditUserProfile: undefined;
    ReportIssuePage: { issueContext?: string } | undefined;
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
    JoinTeamPage: { joinKey?: string } | undefined;
    CreateTeamPage: undefined;
    TeamDetailsPage: undefined;
    UpdatesPage: undefined;
    SettingsPage: undefined;
}

/** Props injected by the navigator into a page registered as a screen. */
export type ScreenProps<T extends keyof NavigatorPages> = NativeStackScreenProps<NavigatorPages, T>;

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
    },
    {
        name: 'JoinTeamPage',
        component: JoinTeamPage
    },
    {
        name: 'CreateTeamPage',
        component: CreateTeamPage
    },
    {
        name: 'TeamDetailsPage',
        component: TeamDetailsPage
    }
];


export const screensLinks = {
    JoinSearchParty: 'JoinSearchParty/:joinKey',
    JoinTeamPage: 'JoinTeamPage/:joinKey'
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
