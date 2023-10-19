import React, { useEffect, useRef } from "react";

export const VideoPlayer = ({ user }) => {
  const ref = useRef();

  useEffect(() => {
    user.videoTrack.play(ref.current);
  }, []);

  console.log(user.videoTrack);

  return (
    <div style={{ background: "#fff", padding: "15px" }}>
      Uid: {user.uid}
      <div
        ref={ref}
        style={{ width: "300px", height: "300px", borderRadius: "10px" }}
      ></div>
    </div>
  );
};
