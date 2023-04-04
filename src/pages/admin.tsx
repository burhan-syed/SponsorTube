import Header from "@/components/Header";
import { Button } from "@/components/ui/common/Button";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import React from "react";

const SearchPage = () => {
  const session = useSession();
  const role = api.auth.getUserRole.useQuery();
  const processAll = api.video.processAll.useMutation();
  const updateAll = api.channel.summarizeAllChannels.useMutation();
  const adminTest = api.example.admin.useMutation();

  return (
    <div>
      <Header />
      {session.status === "loading" ? (
        <>loading..</>
      ) : session?.data?.user?.role === "ADMIN" ? (
        <div>
          <Button
            loading={processAll.isLoading}
            disabled={processAll.isLoading}
            onClick={() => processAll.mutate()}
          >
            Process All
          </Button>
          <Button
            loading={updateAll.isLoading}
            disabled={updateAll.isLoading}
            onClick={() => updateAll.mutate()}
          >
            Update All
          </Button>
          <Button
            loading={adminTest.isLoading}
            disabled={adminTest.isLoading}
            onClick={() => adminTest.mutate()}
          >
            Test Admin
          </Button>
        </div>
      ) : (
        <>You don't have permission for this page</>
      )}
    </div>
  );
};

export default SearchPage;
