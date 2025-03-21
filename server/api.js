   // src/services/api.js
   import axios from 'axios';

   const API_URL = 'http://localhost:5000/api';

   // Books API
   export const getBooks = () => axios.get(`${API_URL}/books`);
   export const getBook = (id) => axios.get(`${API_URL}/books/${id}`);
   export const createBook = (book) => axios.post(`${API_URL}/books`, book);
   export const updateBook = (id, book) => axios.put(`${API_URL}/books/${id}`, book);
   export const deleteBook = (id) => axios.delete(`${API_URL}/books/${id}`);

   // Users API
   export const getUsers = () => axios.get(`${API_URL}/users`);
   export const getUser = (id) => axios.get(`${API_URL}/users/${id}`);
   export const createUser = (user) => axios.post(`${API_URL}/users`, user);
   export const updateUser = (id, user) => axios.put(`${API_URL}/users/${id}`, user);
   export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);

   // Loans API
   export const getLoans = () => axios.get(`${API_URL}/loans`);
   export const getLoan = (id) => axios.get(`${API_URL}/loans/${id}`);
   export const createLoan = (loan) => axios.post(`${API_URL}/loans`, loan);
   export const updateLoan = (id, loan) => axios.put(`${API_URL}/loans/${id}`, loan);
   export const deleteLoan = (id) => axios.delete(`${API_URL}/loans/${id}`);
   