import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  set,
  update,
} from "firebase/database";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { firebaseConfig } from "./firebaseConfig";
import { User } from "./user";

export const Chat = ({ onLogout }) => {
  initializeApp(firebaseConfig);
  const db = getDatabase();
  const user = JSON.parse(localStorage.getItem("user"));
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [tabHasFocus, setTabHasFocus] = useState(true);

  useEffect(() => {
    const handleFocus = () => {
      console.log("Tab has focus");
      setTabHasFocus(true);
    };

    const handleBlur = () => {
      console.log("Tab lost focus");
      setTabHasFocus(false);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    let firstKey;
    onValue(ref(db, "/Users"), (snapshot) => {
      setUsers([...Object.values(snapshot.val())]);
      firstKey = Object.values(snapshot.val())[0];
    });
    if (!selectedUser) {
      setSelectedUser(firstKey);
    }
  }, []);

  console.log(selectedUser);

  useEffect(() => {
    onValue(ref(db, "messages"), (snap) => {
      const data = Object.values(snap.val());
      setMessages(
        data.filter(
          (msg) =>
            (msg.sender === selectedUser?.id && msg.to === user?.id) ||
            (msg.to === selectedUser?.id && msg.sender === user.id)
        )
      );
    });
  }, [selectedUser]);

  useEffect(() => {
    if (tabHasFocus) setStatus("online");
    else setStatus("offline");
  }, [tabHasFocus]);

  const setStatus = (type) => {
    update(ref(db, "Users/" + user.id), { status: type, ts: Date.now() }).then(
      (res) => {
        console.log("updated");
      }
    );
  };

  const sendMessage = () => {
    const newPush = push(ref(db, "messages/"));
    set(newPush, {
      sender: user.id,
      to: selectedUser.id,
      message: message,
      ts: Date.now(),
    });
  };

  const logout = () => {
    setStatus("offline");
    signOut(getAuth()).then(() => {
      localStorage.clear();
      onLogout();
    });
  };

  return (
    <div className="container clearfix body">
      <div className="people-list" id="people-list">
        <div className="search">
          <input type="text" placeholder="search" />
          <i className="fa fa-search" />
        </div>
        <ul className="list">
          {users.length > 0 &&
            users.map((user) => (
              <User
                user={user}
                selected={selectedUser}
                setSelected={(e) => setSelectedUser(e)}
              />
            ))}
        </ul>
      </div>
      <div className="chat">
        <div className="chat-header clearfix">
          <img src={selectedUser?.image} className="img-user" alt="avatar" />
          <div className="chat-about">
            <div className="chat-with">Chat with {selectedUser?.name}</div>
            <div className="status">
              <i className={`fa fa-circle ${selectedUser?.status}`} />{" "}
              {selectedUser?.status}
            </div>
          </div>
          <i className="fa fa-star" onClick={() => logout()} />
        </div>{" "}
        {/* end chat-header */}
        <div className="chat-history">
          <ul>
            {messages.length > 0 &&
              messages.map((message) => {
                return (
                  <li className={user.id === message?.sender ? `` : "clearfix"}>
                    <div
                      className={`message-data ${
                        user.id !== message.sender ? "align-right" : ""
                      }`}
                    >
                      {message.sender !== user.id && (
                        <span className="message-data-time">
                          {moment(new Date(message.ts)).fromNow()}
                        </span>
                      )}
                      &nbsp; &nbsp;
                      <span className="message-data-name">
                        {message.sender === user.id ? (
                          <>
                            <i className="fa fa-circle online" /> {user.name}
                          </>
                        ) : (
                          <>{selectedUser.name} &nbsp;&nbsp;</>
                        )}
                      </span>
                      {message.sender !== user.id && (
                        <i className="fa fa-circle me" />
                      )}
                      {message.sender === user.id && (
                        <span className="message-data-time">
                          {moment(new Date(message.ts)).fromNow()}
                        </span>
                      )}
                    </div>
                    <div
                      className={`message ${
                        message.sender === user.id
                          ? "my-message"
                          : "other-message float-right"
                      }`}
                    >
                      {message.message}
                    </div>
                  </li>
                );
              })}
            <li>
              <div className="message-data">
                <span className="message-data-name">
                  <i className="fa fa-circle online" /> Vincent
                </span>
                <span className="message-data-time">10:31 AM, Today</span>
              </div>
              <i className="fa fa-circle online" />
              <i className="fa fa-circle online" style={{ color: "#AED2A6" }} />
              <i className="fa fa-circle online" style={{ color: "#DAE9DA" }} />
            </li>
          </ul>
        </div>{" "}
        {/* end chat-history */}
        <div className="chat-message clearfix">
          <textarea
            name="message-to-send"
            id="message-to-send"
            placeholder="Type your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          <i className="fa fa-file-o" /> &nbsp;&nbsp;&nbsp;
          <i className="fa fa-file-image-o" />
          <button onClick={() => sendMessage()}>Send</button>
        </div>{" "}
        {/* end chat-message */}
      </div>
      {/* end chat */}
    </div>
  );
};
