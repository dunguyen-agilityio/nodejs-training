import React from "react";
import Redirect from "./Redirect";

async function SignOut() {
  return (
    <div className="absolute inset-0 bg-gray-300/80 flex justify-center items-center">
      <span>Loading...</span>
      <Redirect />
    </div>
  );
}

export default SignOut;
