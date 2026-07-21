import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const Profile = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [userName, setUserName] = useState(user?.name || "User Name");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setUserName(user?.name || "User Name");
    setUserEmail(user?.email || "");
  }, [user]);

  return (
    <div className="w-full max-w-300 mx-auto mt-10">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        Profile
      </h1>

      <div className="max-w-md mt-5 space-y-6">
        <Field>
          <FieldLabel htmlFor="user-name">Your Name</FieldLabel>
          <Input
            id="user-name"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            disabled
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="user-email">Your Email</FieldLabel>
          <Input
            id="user-email"
            placeholder="Your Email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            disabled
          />
        </Field>

        <Button>Update Profile</Button>
      </div>
      <Button
        className="mt-10"
        variant={"destructive"}
        onClick={() => {
          setLoggingOut(true);
          logout();
          navigate("/");
        }}
      >
        {loggingOut && <Spinner data-icon="inline-start" />}
        Logout
      </Button>
    </div>
  );
};

export default Profile;
