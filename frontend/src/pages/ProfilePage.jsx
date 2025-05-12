import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const { user } = useAuth();
  console.log(user);

  return <div>Profile Page</div>;
}

export default ProfilePage;
