import { useEffect, useState } from "react";
import Header from "../Components/Header";

function ManageUsers({ token }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    console.log("Fetching users with token:", token);
    fetch("/api/get-all-users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [token]);

  function deleteUser(id) {
    fetch(`/api/user-status/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("User deleted successfully:", data);
        setUsers(users.filter((user) => user.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  }

  function validateUser(id) {
    fetch(`/api/user-status/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("User validated successfully:", data);
        setUsers(users.filter((user) => user.id !== id));
      })
      .catch((error) => {
        console.error("Error validating user:", error);
      });
  }

  return (
    <div>
      <Header />
      <div className="bg-inherit pt-16 w-full flex justify-center">
        <div className="bg-inherit m-auto h-4/5 shadow-slate-500 border-2 border-slate-700 rounded-lg p-5 bg-slate-700 mt-[5%] sm:ml-32 sm:mr-32 sm:w-1/2">
          <h1 className="text-4xl text-slate-100 pt-5 text-center">
            Manage Users
          </h1>

          <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table class="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
              <thead class="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="col" class="px-6 py-3">
                    Username
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Created
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Role
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {user.username}
                    </th>
                    <td class="px-6 py-4">
                      {" "}
                      {new Date(user.created)
                        .toLocaleString("sv-SE")
                        .replace(" ", " ")
                        .slice(0, 16)}
                    </td>
                    <td class="px-6 py-4">{user.status}</td>
                    <td class="px-6 py-4">{user.role}</td>
                    <td class="px-6 py-4">
                      {user.status === "pending" ? (
                        <>
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 w-1/2 min-w-fit"
                            onClick={() => validateUser(user.id)}
                          >
                            Accept
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 w-1/2 min-w-fit"
                            onClick={() => deleteUser(user.id)}
                          >
                            Deny
                          </button>
                        </>
                      ) : user.status === "verified" ? (
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 w-1/2 min-w-fit"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </button>
                      ) : user.status === "deleted" ? (
                        <span className="text-gray-400 italic">
                          User deleted
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;
