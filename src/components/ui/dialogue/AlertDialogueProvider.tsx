import useGlobalStore from "@/store/useGlobalStore";
import AlertDialogueWrapper from "./AlertDialogueWrapper";
import LoginAlertDialogueContent from "./LoginAlertDialogueContent";

const AlertDialogueProvider = ({
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

export default AlertDialogueProvider;
