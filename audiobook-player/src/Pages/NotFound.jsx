function NotFound () {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-inherit">
      <div className="bg-slate-400 p-8 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg">Sorry, the page you are looking for does not exist.</p>
      </div>
    </div>
  )
}
export default NotFound;