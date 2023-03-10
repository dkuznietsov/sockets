import { showInputModal, showMessageModal } from "./views/modal.mjs";
import {
  appendRoomElement,
  roomExists,
  updateNumberOfUsersInRoom,
  removeRoomElement,
} from "./views/room.mjs";
import { addClass, removeClass } from "./helpers/domHelper.mjs";
import { appendUserElement } from "./views/user.mjs";

import socket from "./socket.standalone.mjs";

const addRoomBtn = document.getElementById("add-room-btn");

addRoomBtn.addEventListener("click", () => onAddRoom());

const onAddRoom = () => {
  showInputModal({
    title: "Enter room name",
    onSubmit: (roomName) => {
      socket.emit("ADD_ROOM", roomName);
    },
  });
};

socket.on("ADD_ROOM_FAIL", (message) => showMessageModal(message));
socket.on("ADD_ROOM_SUCCESS", (roomName) => {
  socket.emit("JOIN_ROOM", roomName);
});

const updateRooms = ({ roomName, numberOfUsers }) => {
  if (!roomName) {
    return;
  }

  if (roomExists(roomName)) {
    updateNumberOfUsersInRoom({ name: roomName, numberOfUsers });
  } else {
    appendRoomElement({
      name: roomName,
      numberOfUsers: numberOfUsers,
      onJoin: () => onJoinRoom(roomName),
    });
  }
};

const joinRoomDone = (roomName) => {
  const gamePage = document.getElementById("game-page");
  const roomsPage = document.getElementById("rooms-page");

  addClass(roomsPage, "display-none");
  removeClass(gamePage, "display-none");

  const roomTitle = document.getElementById("room-name");
  roomTitle.innerText = roomName;
};

const onleaveRoom = () => {
  const roomName = document.getElementById("room-name");
  socket.emit("LEAVE_ROOM", roomName.innerText);
};

const quitRoomBtn = document.getElementById("quit-room-btn");
quitRoomBtn.addEventListener("click", onleaveRoom);

const leaveRoomDone = () => {
  const gamePage = document.getElementById("game-page");
  const roomsPage = document.getElementById("rooms-page");

  addClass(gamePage, "display-none");
  removeClass(roomsPage, "display-none");
};

socket.on("ADD_USER", appendUserElement);

socket.on("LEAVE_ROOM_SUCCESS", leaveRoomDone);
socket.on("JOIN_ROOM_SUCCESS", joinRoomDone);
socket.on("ROOM_UPDATED", updateRooms);

socket.on("ROOM_DELETED", ({ roomName }) => removeRoomElement(roomName));

socket.on("LIST_ROOMS_RESPONSE", (list) => {
  for (const [room, number] of list) {
    updateRooms({ roomName: room, numberOfUsers: room });
  }
});
