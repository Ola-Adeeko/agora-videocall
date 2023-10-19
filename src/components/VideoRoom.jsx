import React, { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { VideoPlayer } from "./VideoPlayer";

const APP_ID = "0bc17a0b018e4264a5a50170fdbc5069";
const TOKEN =
  "007eJxTYFgsVMluds1XZ35d8kHDBbpSfZqftxk0bHiU+sF8r3R0C48Cg0FSsqF5okGSgaFFqomRmUmiaaKpgaG5QVpKUrKpgZmlkrhBakMgI8MPJ3smRgYIBPFZGJIzEksYGACO/hxP";
const CHANNEL = "chat";

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

export const VideoRoom = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const [isIn, setIsIn] = useState(false);
  const [me, setMe] = useState({});

  console.log(users, "???", localTracks);

  const handleUserJoined = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      setUsers((previousUsers) => [...previousUsers, user]);
    }

    if (mediaType === "audio") {
      // user.audioTrack.play()
    }
  };

  const handleUserLeft = (user) => {
    console.log(user, ">>>>");

    // Ensure the user is unsubscribed before removing them
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
  };

  useEffect(() => {
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    // Clean up event listeners when component unmounts
    return () => {
      for (let localTrack of localTracks) {
        localTrack.stop();
        localTrack.close();
      }
      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.unpublish(localTracks).then(() => client.leave());
      setUsers([]);
    };
  }, []);

  const onJoin = () => {
    client
      .join(APP_ID, CHANNEL, TOKEN, null)
      .then((uid) => {
        return Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid]);
      })
      .then(([tracks, uid]) => {
        const [audioTrack, videoTrack] = tracks;
        setLocalTracks(tracks);

        setUsers((previousUsers) => [
          ...previousUsers,
          {
            uid,
            videoTrack,
            audioTrack,
          },
        ]);
        setMe({
          uid,
          videoTrack,
          audioTrack,
        });
        client.publish(tracks);
        setIsIn(true);
      })
      .catch((error) => {
        console.error("Error joining call:", error);
      });
  };

  const onLeave = () => {
    for (let localTrack of localTracks) {
      localTrack.stop();
      localTrack.close();
    }

    handleUserLeft(me);
    client.off("user-published", handleUserJoined);
    client.off("user-left", handleUserLeft);
    client.unpublish(localTracks).then(() => client.leave());
    setIsIn(false);
    setUsers([]);
  };

  return (
    <div>
      {!isIn && <button onClick={() => onJoin()}>Join Room</button>}
      {isIn && <button onClick={() => onLeave()}>Leave Room</button>}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {users.map((user) => (
          <VideoPlayer key={user.uid} user={user} />
        ))}
      </div>
    </div>
  );
};
