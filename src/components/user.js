import React from "react";

export const User = ({ user, setSelected, selected }) => {
  return (
    <li
      className={`clearfix ${selected?.id === user.id ? "active" : ""}`}
      onClick={() => setSelected(user)}
    >
      <img className="img-user" src={user.image} alt="avatar" />
      <div className="about">
        <div className="name">{user.name}</div>
        <div className="status">
          <i className={`fa fa-circle ${user.status}`} /> {user.status}
        </div>
      </div>
    </li>
  );
};
