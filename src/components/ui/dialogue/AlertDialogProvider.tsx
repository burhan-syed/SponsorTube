import useGlobalStore from "@/store/useGlobalStore";
import AlertDialogWrapper from "./AlertDialogWrapper";
import LoginAlertDialogContent from "./LoginAlertDialogContent";
const AlertDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const dialogueTrigger = useGlobalStore(
    (state) => state.sessionRequiredTrigger
  );
  return (
    <>
      <AlertDialogWrapper
        triggerAlert={dialogueTrigger[0]}
        content={
          <>
            <LoginAlertDialogContent description={dialogueTrigger[1]} />
          </>
        }
      >
        <>{children}</>
      </AlertDialogWrapper>
    </>
  );
};

export default AlertDialogProvider;
