import React from 'react';
import { PlaceholderView } from './PlaceholderView';
import { UserProfileView } from './UserProfileView';

export { PlaceholderView };
export const Dashboard = (props: any) => <PlaceholderView title="Dashboard" {...props} />;
export const NewsHub = (props: any) => <PlaceholderView title="News & Updates" {...props} />;
export const ChangelogView = (props: any) => <PlaceholderView title="Changelog" {...props} />;
export const BlockedView = (props: any) => <PlaceholderView title="Account Blocked" {...props} />;
export const ExperimentView = (props: any) => <PlaceholderView title="Sleep Experiments" {...props} />;
export const DiaryView = (props: any) => <PlaceholderView title="Sleep Journal" {...props} />;
export const AdminView = (props: any) => <PlaceholderView title="Admin Console" {...props} />;
export const UserProfile = (props: any) => <UserProfileView {...props} />;
export const FeedbackView = (props: any) => <PlaceholderView title="Feedback" {...props} />;
