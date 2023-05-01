import useGlobalStore from "@/store/useGlobalStore";
import React from "react";
import GeneralDialogWrapper from "./GeneralDialogWrapper";
import GeneralDialogContent from "./GeneralDialogContent";

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
      <GeneralDialogWrapper
        triggerAlert={dialogueTrigger[0]}
        content={
          <>
            <GeneralDialogContent {...dialogueTrigger[1]} />
          </>
        }
      >
        {children}
      </GeneralDialogWrapper>
    </>
  );
};

export default GeneralDialogueProvider;
