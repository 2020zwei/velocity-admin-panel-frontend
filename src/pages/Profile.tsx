import { useApi } from "@/hooks/useApi";
import Spinner from "@/components/Spinner";
import { useEffect, useMemo, useState } from "react";

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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

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

  const { isLoading: isUpdating, refetch: updateProfile } = useApi<any>({
    url: "/update/",
    auto: false,
    method: "put",
    transformResponse: (d) => d,
  });

  useEffect(() => {
    setPhoneNumber(user?.phone_number ?? "");
  }, [user?.phone_number]);

  const hasPendingChanges = useMemo(() => {
    const initialPhone = user?.phone_number ?? "";
    const phoneChanged = phoneNumber !== initialPhone;
    const pictureChanged = Boolean(profileFile);
    return phoneChanged || pictureChanged;
  }, [phoneNumber, profileFile, user?.phone_number]);

  const handleSave = async () => {
    setSaveMessage("");
    setSaveError("");
    try {
      const formData = new FormData();
      formData.append("phone_number", phoneNumber);
      if (profileFile) {
        formData.append("profile_picture", profileFile);
      }
      await updateProfile({ body: formData as any });
      await refetch();
      setProfileFile(null);
      setSaveMessage("Profile updated successfully.");
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || "Unable to update profile right now.");
    }
  };

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
            <div className="mt-4 w-full">
              <label
                htmlFor="profile-picture-input"
                className="h-10 px-4 rounded-lg border border-[#243042] bg-[#0A0F18] text-sm font-medium flex items-center justify-center cursor-pointer hover:opacity-80 duration-300"
              >
                {profileFile ? "Change selected picture" : "Change profile picture"}
              </label>
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setProfileFile(file);
                }}
              />
              {profileFile && (
                <p className="mt-2 text-xs text-[#9BA4B5] truncate">{profileFile.name}</p>
              )}
            </div>

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
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-2 bg-[#12171F] h-11 rounded-lg px-3 border border-[#2A3443] w-full text-white placeholder:text-[#6D7685] text-sm"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Role</p>
                <p className="mt-1 text-sm font-medium">{user?.role || "-"}</p>
              </div>

              

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Territory</p>
                <p className="mt-1 text-sm font-medium">{user?.location || "-"}</p>
              </div>

              <div className="rounded-xl border border-[#243042] bg-[#0A0F18] p-4">
                <p className="text-xs text-[#8F99AA]">Date Joined</p>
                <p className="mt-1 text-sm font-medium">{user?.date_joined || "-"}</p>
              </div>

              
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isUpdating || !hasPendingChanges}
                className="h-10 px-5 rounded-lg bg-blue-gradient font-semibold text-sm hover:opacity-90 duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
              {saveMessage && <p className="text-sm text-green-400">{saveMessage}</p>}
              {saveError && <p className="text-sm text-red-400">{saveError}</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
