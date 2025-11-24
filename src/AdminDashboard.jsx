import Protected from "../components/Protected";

export default function AdminDashboard() {
  return (
    <Protected>
      <div>
        <h1>Panel de Administrador</h1>
        {/* el resto del dashboard */}
      </div>
    </Protected>
  );
}
