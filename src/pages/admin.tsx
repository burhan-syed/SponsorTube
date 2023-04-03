import Header from "@/components/Header";
import { Button } from "@/components/ui/common/Button";
import { trpc } from "@/utils/trpc";
import React from "react";

const SearchPage = () => {
  const processAll = trpc.video.processAll.useMutation();
  const updateAll = trpc.channel.summarizeAllChannels.useMutation();
  return (
    <div>
      <Header />
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
    </div>
  );
};

export default SearchPage;
