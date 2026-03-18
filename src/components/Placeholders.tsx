import { PlaceholderView } from './PlaceholderView';
import { UserProfileView } from './UserProfileView';
import { FeedbackView as FeedbackViewComponent } from './FeedbackView';
import { ChangelogView as ChangelogViewComponent } from './ChangelogView';

export { PlaceholderView };
export const Dashboard = (props: any) => <PlaceholderView title="Dashboard" {...props} />;
export const NewsHub = (props: any) => <PlaceholderView title="News & Updates" {...props} />;
export const ChangelogView = (props: any) => <ChangelogViewComponent {...props} />;
export const BlockedView = (props: any) => <PlaceholderView title="Account Blocked" {...props} />;
export const ExperimentView = (props: any) => <PlaceholderView title="Sleep Experiments" {...props} />;
export const DiaryView = (props: any) => <PlaceholderView title="Sleep Journal" {...props} />;
export const AdminView = (props: any) => <PlaceholderView title="Admin Console" {...props} />;
export const UserProfile = (props: any) => <UserProfileView {...props} />;
export const FeedbackView = (props: any) => <FeedbackViewComponent {...props} />;
