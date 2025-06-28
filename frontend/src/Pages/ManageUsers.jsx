import Header from "../Components/Header";

function ManageUsers() {
  return (
    <div>
      <Header />
      <div className="bg-inherit pt-16 w-full flex justify-center">
        <div className="bg-inherit m-auto h-4/5 shadow-slate-500 border-2 border-slate-700 rounded-lg p-5 bg-slate-700 mt-[5%] sm:ml-32 sm:mr-32 sm:w-1/2">
          <h1 className="text-4xl text-slate-100 pt-5 text-center">
            Manage Users
          </h1>
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;
