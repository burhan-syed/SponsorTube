import useGlobalStore from "@/store/useGlobalStore";
import React from "react";
import GeneralDialogueWrapper from "./GeneralDialogueWrapper";
import GeneralDialogueContent from "./GeneralDialogueContent";

const GeneralDialogueProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dialogueTrigger = useGlobalStore(
    (state) => state.generalDialogueTrigger
  );
  return (
    <>
      <GeneralDialogueWrapper
        triggerAlert={dialogueTrigger[0]}
        content={
          <>
            <GeneralDialogueContent {...dialogueTrigger[1]} />
          </>
        }
      >
        {children}
      </GeneralDialogueWrapper>
    </>
  );
};

export default GeneralDialogueProvider;
