
import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import MaintenancePage from "@pages/MaintenancePage";
import AppRouter from "./AppRouter";
import { LAUNCH_TIMESTAMP, LAUNCH_DATE } from "@config/index";
import LaunchAnimation from "@components/ui/LaunchAnimation";
import { AnimatePresence } from "framer-motion";

type LaunchState = "countingDown" | "launching" | "live";

const RootRouter: React.FC = () => {
  const location = useLocation();
  const [launchState, setLaunchState] = useState<LaunchState>(() =>
    Date.now() >= LAUNCH_TIMESTAMP ? "live" : "countingDown"
  );

  useEffect(() => {
    if (launchState !== "countingDown") return;

    const timer = setInterval(() => {
      if (Date.now() >= LAUNCH_TIMESTAMP) {
        setLaunchState("launching");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchState]);

  const handleLaunchAnimationComplete = useCallback(() => {
    setLaunchState("live");
  }, []);

  return (
    <AnimatePresence mode="wait">
      {launchState === "live" ? (
        <div key="live">
          <AppRouter />
        </div>
      ) : (
        <Routes location={location} key="maintenance-container">
          <Route
            path="*"
            element={
              <>
                <MaintenancePage
                  title="Launching Soon"
                  message="Our arena is getting polished for an epic launch. Get ready for the action!"
                  launchDate={LAUNCH_DATE}
                  onCountdownEnd={() => setLaunchState("launching")}
                  isLaunching={launchState === "launching"}
                />
                {launchState === "launching" && (
                  <LaunchAnimation onComplete={handleLaunchAnimationComplete} />
                )}
              </>
            }
          />
        </Routes>
      )}
    </AnimatePresence>
  );
};

export default RootRouter;
