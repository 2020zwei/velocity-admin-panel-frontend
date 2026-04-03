import { useApi } from "@/hooks/useApi";
import Spinner from "@/components/Spinner";

type ProfileData = {
  name?: string;
  email?: string;
  organization_name?: string;
  company?: string;
  profile_picture?: string;
  phone_number?: string;
  department?: string;
  location?: string;
  date_joined?: string;
  is_company?: boolean;
  role?: string;
  bio?: string;
  address?: string;
};

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const Profile = () => {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useApi<ProfileData>({
    url: "/me/",
    auto: true,
    method: "get",
    transformResponse: (d) => d?.data?.profile ?? d?.data ?? d,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#2A3443] bg-[#0C1017] p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-red-400 mt-3">Unable to load profile information.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 h-10 px-4 rounded-lg bg-blue-gradient font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh]">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-sm text-[#9BA4B5] mt-1">
          View your account details and organization information.
        </p>
      </div>

      <section className="rounded-2xl border border-[#2A3443] bg-[#0A0F18] overflow-hidden">
        <div className="h-1 w-full bg-blue-gradient" />

        <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8">
          <div className="rounded-2xl border border-[#243042] bg-[#0D1320] p-6 flex flex-col items-center text-center">
            <div className="w-[120px] h-[120px] rounded-full p-[2px] bg-blue-gradient">
              <div className="w-full h-full rounded-full bg-[#0D1320] overflow-hidden flex items-center justify-center">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user?.name || "Profile picture"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-white/90">
                    {getInitials(user?.name)}
                  </span>
                )}
              </div>
            </div>

            <h2 className="mt-4 text-xl font-semibold">{user?.name || "User"}</h2>
            <p className="mt-1 text-sm text-[#9BA4B5] break-all">{user?.email || "-"}</p>

            <div className="mt-5 w-full rounded-xl border border-[#243042] bg-[#0A0F18] px-4 py-3">
              <p className="text-xs text-[#8F99AA]">Organization</p>
              <p className="text-sm mt-1 font-medium text-white">
                {user?.organization_name || "-"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#243042] bg-[#0D1320] p-6">
            <h3 className="text-lg font-semibold mb-5">Account Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Full Name</p>
                <p className="mt-1 text-sm font-medium">{user?.name || "-"}</p>
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Work Email</p>
                <p className="mt-1 text-sm font-medium break-all">{user?.email || "-"}</p>
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Organization Name</p>
                <p className="mt-1 text-sm font-medium">{user?.organization_name || "-"}</p>
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Company</p>
                <p className="mt-1 text-sm font-medium">{user?.company || "-"}</p>
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Phone</p>
                <p className="mt-1 text-sm font-medium">{user?.phone_number || "-"}</p>
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Role</p>
                <p className="mt-1 text-sm font-medium">{user?.role || "-"}</p>
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Department</p>
                <p className="mt-1 text-sm font-medium">{user?.department || "-"}</p>
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Location</p>
                <p className="mt-1 text-sm font-medium">{user?.location || "-"}</p>
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Date Joined</p>
                <p className="mt-1 text-sm font-medium">{user?.date_joined || "-"}</p>
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Account Type</p>
                <p className="mt-1 text-sm font-medium">{user?.is_company ? "Company" : "Individual"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
