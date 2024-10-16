import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { role } = useContext(UserContext);

  // Lista de roles válidos en tu sistema
  const validRoles = ['Cliente', 'mesero', 'administrador'];

  // Si el usuario no tiene un rol válido o no está autenticado, redirige al login
  if (!role || !validRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  // Si el usuario está autenticado con un rol válido, renderiza el contenido
  return children;
};

export default ProtectedRoute;
