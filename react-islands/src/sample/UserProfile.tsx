interface UserProfileProps {
  name: string;
}

const UserProfile = ({ name }: UserProfileProps) => {
  return (
    <div className="react-island-container wics-card">
      <div className="wics-header">User Profile</div>
      <div className="p-4">Hello, {name}! This is the UserProfile component.</div>
    </div>
  );
};

export default UserProfile;
