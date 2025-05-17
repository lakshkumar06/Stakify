import React, { Suspense, ComponentType } from "react";

// loadig component to change / upgrade  
function Loadable<T extends ComponentType<any>>(Component: T) {
  return function LoadableComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    );
  };
}

export default Loadable;