import useGlobalStore from "@/hooks/useGlobalStore";
import AlertDialogueWrapper from "./AlertDialogueWrapper";
import LoginAlertDialogueContent from "./LoginAlertDialogueContent";

const SessionRequiredDialogueWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dialogueTrigger = useGlobalStore(
    (state) => state.sessionRequiredTrigger
  );
  return (
    <>
      <AlertDialogueWrapper
        triggerAlert={dialogueTrigger[0]}
        content={
          <>
            <LoginAlertDialogueContent description={dialogueTrigger[1]} />
          </>
        }
      >
        <>{children}</>
      </AlertDialogueWrapper>
    </>
  );
};

export default SessionRequiredDialogueWrapper;
