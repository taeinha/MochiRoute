import type { ComponentProps, ElementType } from "react";
import { Suspense } from "react";
import Spinner from "./Spinner/Spinner";

function Loadable<T extends ElementType>(Component: T) {
  return (props: ComponentProps<T>) => (
    <Suspense fallback={<Spinner />}>
      <Component {...props} />
    </Suspense>
  );
}
export default Loadable;
