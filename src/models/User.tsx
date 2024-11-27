interface User {
  firstName: string;
  lastName: string;
  role: "instructor" | "ta";
  email: string;
  joinTime: string;
}

export default User;
