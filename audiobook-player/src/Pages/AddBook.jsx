import React from 'react';
import Header from '../Components/Header';
function AddBook({setIsAuthenticated}){
    return (
        <div className="bg-inherit">
            <Header setIsAuthenticated={setIsAuthenticated} />
            <h1 className="text-4xl text-center text-slate-100 pt-16">Add Book</h1>
        </div>
    );
}
export default AddBook;