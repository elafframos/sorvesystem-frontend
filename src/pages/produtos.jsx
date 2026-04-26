import { useState } from 'react';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const styles = {
  container: { padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Segoe UI' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginRight: '10px', marginBottom: '10px' },
  btn: { padding: '10px 20px', borderRadius: '8px', border: 'none', color: 'white', cursor: 'pointer' }
};

function Produtos({ produtos = [], aoAlterar }) {
  const [form, setForm] = useState({ nome: '', codigo: '', preco: 0, quantidade: 0 });
  const [editandoId, setEditandoId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // 1. Verificamos se é POST (novo) ou PUT (editar)
    const metodo = editandoId ? 'PUT' : 'POST';
    const url = editandoId 
      ? `${import.meta.env.VITE_API_URL}/api/produtos/${editandoId}/`
      : `${import.meta.env.VITE_API_URL}/api/produtos/`;

    fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}` // Autenticação por Token
      },
      body: JSON.stringify(form) // Use 'form', que é o seu estado!
    })
    .then(res => {
      if (res.ok) {
        alert("Sucesso!");
        setForm({ nome: '', codigo: '', preco: 0, quantidade: 0 });
        setEditandoId(null);
        if (aoAlterar) aoAlterar();
      } else {
        alert("Erro ao salvar. Verifique os dados.");
      }
    });
  };

  const deletarProduto = (id) => {
    if (!window.confirm("Deseja excluir?")) return;
    const token = localStorage.getItem('token');

    fetch(`${import.meta.env.VITE_API_URL}/api/produtos/${id}/`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Token ${token}` // Adicionado Token aqui também
      }
    }).then(() => aoAlterar());
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3>{editandoId ? "Editar Picolé" : "Novo Produto"}</h3>
        <form onSubmit={handleSubmit}>
          <input placeholder="Cód" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} style={styles.input} />
          <input placeholder="Sabor" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} style={styles.input} />
          <input type="number" step="0.01" value={form.preco} onChange={e => setForm({...form, preco: Number(e.target.value)})} style={styles.input} />
          <input type="number" value={form.quantidade} onChange={e => setForm({...form, quantidade: Number(e.target.value)})} style={styles.input} />
          <button type="submit" style={{ ...styles.btn, backgroundColor: '#6c5ce7' }}>
            {editandoId ? "Atualizar" : "Cadastrar"}
          </button>
          {editandoId && <button onClick={() => setEditandoId(null)} style={{...styles.btn, backgroundColor: 'gray', marginLeft: '5px'}}>Cancelar</button>}
        </form>
      </div>

      <div style={styles.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', color: '#666' }}><th>Cód</th><th>Sabor</th><th>Estoque</th><th>Ações</th></tr></thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{p.codigo}</td>
                <td><strong>{p.nome}</strong></td>
                <td>{p.quantidade} un</td>
                <td>
                  <button onClick={() => {setForm(p); setEditandoId(p.id)}} style={{ color: '#6c5ce7', background: 'none', border: 'none', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => deletarProduto(p.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Produtos;