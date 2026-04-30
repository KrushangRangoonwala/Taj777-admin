import CasinoList from "../pages/casino/CasinoList";
import PremiumCasino from "../pages/casino/PremiumCasino";
import TemboCasino from "../pages/casino/TemboCasino";
import VipCasino from "../pages/casino/VipCasino";
import VirtualCasino from "../pages/casino/VirtualCasino";
import Dashboard from "../pages/Dashboard";
import AccountStatement from "../pages/reports/AccountStatement";
import AuthList from "../pages/reports/AuthList";
import Bank from "../pages/reports/Bank";
import CasinoResult from "../pages/reports/CasinoResult";
import CurrentBets from "../pages/reports/CurrentBets";
import GeneralLock from "../pages/reports/GeneralLock";
import LiveCasinoResult from "../pages/reports/LiveCasinoResult";
import MarketAnalysis from "../pages/reports/MarketAnalysis";
import ProfitLoss from "../pages/reports/ProfitLoss";
import SportBookReport from "../pages/reports/SportBookReport";
import TotalProfitLoss from "../pages/reports/TotalProfitLoss";
import Turnover from "../pages/reports/Turnover";
import UserHistory from "../pages/reports/UserHistory";
import UserRegisterDetail from "../pages/reports/UserRegisterDetail";
import UserWinLoss from "../pages/reports/UserWinLoss";
import AccountList from "../pages/users/AccountList";
import ActiveUsers from "../pages/users/ActiveUsers";
import AssignAgent from "../pages/users/AssignAgent";
import CreateAccount from "../pages/users/CreateAccount";
import InsertUser from "../pages/users/InsertUser";


export const menuItems = [
    {
        label: "Dashboard",
        href: "/admin/home",
        icon: "bx bx-home-circle",
        liClassName: "mm-active",
        linkClasses: "side-nav-link-ref router-link-exact-active router-link-active ", // active    
        ariaCurrent: "page",
        Component: Dashboard,
        backend_key: "",
    },
    {
        label: "Market Analysis",
        href: "/admin/market-analysis",
        icon: "bx bxs-bar-chart-alt-2",
        linkClasses: "side-nav-link-ref",
        Component: MarketAnalysis,
        backend_key: "",
    },
    {
        label: "Multi Login Account",
        href: "/admin/createaccount",
        icon: "bx bx-user-plus",
        linkClasses: "side-nav-link-ref",
        Component: CreateAccount,
        backend_key: "",
    },
    {
        label: "Account",
        icon: "bx bx-user-circle",
        subItems: [
            { label: "Account List For Active Users", href: "/admin/activeusers", Component: ActiveUsers, backend_key: "" },
            { label: "Account List", href: "/admin/users", Component: AccountList, backend_key: "" },
            { label: "Create Account", href: "/admin/users/insertuser", Component: InsertUser, backend_key: "" },
        ],
    },
    {
        label: "Assign Agent",
        href: "/admin/assign-agent",
        icon: "bx bx-user",
        linkClasses: "side-nav-link-ref",
        Component: AssignAgent,
        backend_key: "",
    },
    {
        label: "Bank",
        href: "/admin/reports/bank",
        icon: "bx bxs-bank",
        linkClasses: "side-nav-link-ref",
        Component: Bank,
        backend_key: "",
    },
    {
        label: "Reports",
        icon: "bx bx-file",
        subItems: [
            { label: "Account Statement", href: "/admin/reports/accountstatement", Component: AccountStatement, backend_key: "" },
            { label: "Party Win Loss", href: "/admin/reports/profitloss", Component: ProfitLoss, backend_key: "" },
            { label: "Current Bets", href: "/admin/reports/currentbets", Component: CurrentBets, backend_key: "" },
            { label: "User History", href: "/admin/reports/userhistory", Component: UserHistory, backend_key: "" },
            { label: "General Lock", href: "/admin/reports/userlock", Component: GeneralLock, backend_key: "" },
            { label: "Our Casino Result", href: "/admin/reports/casinoresult", Component: CasinoResult, backend_key: "" },
            { label: "Live Casino Result", href: "/admin/reports/livecasinoreport", Component: LiveCasinoResult, backend_key: "" },
            { label: "Sportbook Report", href: "/admin/reports/sportbookreport", Component: SportBookReport, backend_key: "" },
            { label: "Turn Over", href: "/admin/reports/turnover", Component: Turnover, backend_key: "" },
            { label: "User Authentication", href: "/admin/reports/authlist", Component: AuthList, backend_key: "" },
            { label: "User Register Detail", href: "/admin/reports/userregisterdetail", Component: UserRegisterDetail, backend_key: "" },
            { label: "Total Profit Loss", href: "/admin/reports/totalprofitloss", Component: TotalProfitLoss, backend_key: "" },
            { label: "User Win Loss", href: "/admin/reports/userwinloss", Component: UserWinLoss, backend_key: "" },
        ],
    },
    {
        label: "Our Casino",
        href: "/admin/casino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        Component: CasinoList,
        backend_key: "",
    },
    {
        label: "Vip Casino",
        href: "/admin/casino/vip",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
        Component: VipCasino,
        backend_key: "",
    },
    {
        label: "Virtual Casino",
        // href: "/admin/vcasino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
        Component: VirtualCasino,
        backend_key: "",
    },
    {
        label: "Premium Casino",
        // href: "/admin/pcasino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
        Component: PremiumCasino,
        backend_key: "",
    },
    {
        label: "Tembo Casino",
        // href: "/admin/tcasino/list",
        icon: "mdi mdi-cards-playing-outline",
        linkClasses: "side-nav-link-ref",
        badge: "New",
        Component: TemboCasino,
        backend_key: "",
    },
];