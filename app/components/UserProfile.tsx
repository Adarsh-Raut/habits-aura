import { GoGear } from "react-icons/go";
import type { Session } from "next-auth";
import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";

type UserProfileProps = {
  user?: Session["user"];
};

export default function UserProfile({ user }: UserProfileProps) {
  if (!user) {
    return null;
  }

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost gap-2 px-2 sm:px-3 normal-case"
      >
        <Avatar src={user.image} name={user.name ?? "User"} size={32} />

        <span className="hidden md:inline font-medium">{user.name}</span>

        <GoGear className="h-4 w-4 sm:h-5 sm:w-5 opacity-70" />
      </label>

      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-200 border border-base-300 rounded-xl w-52 sm:w-56 p-2 shadow-xl z-50 max-w-[90vw] overflow-hidden"
      >
        <li className="pointer-events-none">
          <div className="flex flex-col gap-0.5 max-w-full">
            <span className="font-semibold truncate">{user.name}</span>
            <span className="text-xs opacity-60 truncate">{user.email}</span>
          </div>
        </li>

        <li className="divider my-1" />

        <li>
          <LogoutButton />
        </li>
      </ul>
    </div>
  );
}
