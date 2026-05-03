import { useState, useEffect } from 'react';

const styles = {
  container: { padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif' },
  card: { background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' },
  th: { padding: '15px', textAlign: 'left', color: '#636e72', borderBottom: '2px solid #f1f3f5' },
  td: { padding: '15px', backgroundColor: '#fff', borderBottom: '1px solid #f1f3f5' },
  badge: { padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }
};

function Dashboard() {
  const [vendas, setVendas] = useState([]);
  const [erro, setErro] = useState(null);

  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dataISO));
  };

  // Estilização dinâmica por método
  const getStyleMetodo = (metodo) => {
    const config = {
      'PIX': { bg: '#e3f2fd', color: '#1976d2' },
      'DIN': { bg: '#e8f5e9', color: '#2e7d32' },
      'DEB': { bg: '#fff3e0', color: '#ef6c00' },
      'CRE': { bg: '#f3e5f5', color: '#7b1fa2' }
    };
    return config[metodo] || { bg: '#eee', color: '#333' };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`${import.meta.env.VITE_API_URL}/api/vendas/`, { 
      headers: {
        'Authorization': `Token ${token}` 
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Acesso negado. Faça login novamente.');
        return res.json();
      })
      .then(data => {
        
        const listaVendas = Array.isArray(data) ? data : (data.results || []);
        
        const vendasOrdenadas = listaVendas.sort((a, b) => {
          return new Date(b.data_venda) - new Date(a.data_venda);
        });

        setVendas(vendasOrdenadas);
      })
      .catch(err => setErro(err.message));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>📊 Histórico de Vendas</h2>
          <button 
            onClick={() => window.print()} 
            style={{ backgroundColor: '#6c5ce7', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}
          >
            Imprimir Relatório
          </button>
        </div>

        {erro ? (
          <p style={{ color: '#ff7675' }}>{erro}</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Data e Hora</th>
                <th style={styles.th}>Método</th>
                <th style={styles.th}>Qtd</th>
                <th style={styles.th}>Valor Total</th>
                <th style={styles.th}>Troco</th>
                <th style={styles.th}>Operador</th>
              </tr>
            </thead>
            <tbody>
              {vendas.length > 0 ? (
                vendas.map((venda) => {
                  const style = getStyleMetodo(venda.metodo);
                  return (
                    <tr key={venda.id}>
                      <td style={styles.td}>{formatarData(venda.data_venda)}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, backgroundColor: style.bg, color: style.color }}>
                          {venda.metodo}
                        </span>
                      </td>
                      <td style={styles.td}>{venda.quantidade_vendida} un</td>
                      <td style={styles.td}><strong>R$ {venda.valor_recebido}</strong></td>
                      <td style={styles.td}>R$ {venda.troco}</td>
                      <td style={styles.td}>{venda.operador}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#b2bec3' }}>
                    Nenhuma venda registrada até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;