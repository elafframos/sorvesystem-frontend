import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Vendas from './pages/vendas';
import Produtos from './pages/produtos';
import Dashboard from './pages/dashboard';

function App() {
  const [listaProdutos, setListaProdutos] = useState([]);
  const [autenticado, setAutenticado] = useState(!!localStorage.getItem('operador'));

  const carregarDados = () => {

  const token = localStorage.getItem('token'); 
  
  if (!token) return; 
  fetch(`${import.meta.env.VITE_API_URL}/api/produtos/`, { 
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`, 
      'Content-Type': 'application/json'
    }
  })
  .then(res => {
    if (res.ok) return res.json();
    // Se o token expirou ou é inválido, desloga o usuário
    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      setAutenticado(false);
    }
    throw new Error("Erro na requisição");
  })
  .then(data => setListaProdutos(data.results || data))
  .catch(err => console.warn("Aguardando login ou erro de conexão..."));
};

useEffect(() => {
  if (autenticado) {
    carregarDados();
  }
}, [autenticado]);

  return (
    <Router>
      {autenticado && (
        <nav style={{ 
          padding: '15px', 
          backgroundColor: '#fff', 
          borderBottom: '1px solid #eee', 
          display: 'flex', 
          gap: '30px', 
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#6c5ce7', fontWeight: 'bold' }}>🛒 VENDAS</Link>
          <Link to="/produtos" style={{ textDecoration: 'none', color: '#6c5ce7', fontWeight: 'bold' }}>📦 ESTOQUE</Link>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: '#6c5ce7', fontWeight: 'bold' }}>📊 RELATÓRIOS</Link>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = "/"; }}
            style={{ background: 'none', border: 'none', color: '#ff7675', cursor: 'pointer', fontWeight: 'bold' }}
          >
            SAIR
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/" element={
          <Vendas 
            produtos={listaProdutos} 
            aoVender={carregarDados} 
            onLoginSuccess={() => setAutenticado(true)} 
          />
        } />
        
        <Route path="/produtos" element={
          <Produtos 
            produtos={listaProdutos} 
            aoAlterar={carregarDados} 
          />
        } />

        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;