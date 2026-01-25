// import axiosInstance from './axiosInstance';

// export interface FetchUsersParams {
//   page?: number;
//   limit?: number;
//   search?: string;
//   role?: string;
// }

// export const fetchUsers = async (params: FetchUsersParams) => {
//   const res = await axiosInstance.get('/users', { params });
//   return res.data;
// };

// export const updateUser = async (userId: string, data: {
//   role?: string;
//   departmentId?: string | null;
//   isActive?: boolean;
// }) => {
//   const res = await axiosInstance.patch(`/users/${userId}`, data);
//   return res.data;
// };

// export const deactivateUser = async (userId: string) => {
//   const res = await axiosInstance.patch(`/users/${userId}/deactivate`);
//   return res.data;
// };

// export const fetchFaculties = async () => {
//   const res = await axiosInstance.get('/users/faculties');
//   return res.data;
// };

// export const fetchDepartments = async (facultyId: string) => {
//   const res = await axiosInstance.get(`/users/departments/${facultyId}`);
//   return res.data;
// };
