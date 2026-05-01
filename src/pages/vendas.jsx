import { useState, useEffect } from 'react';

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
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#fdfcfe', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' },
  card: { background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  input: { padding: '12px 16px', borderRadius: '10px', border: '1px solid #e0e0e0', fontSize: '16px', outline: 'none' },
  btnPrimary: { backgroundColor: '#6c5ce7', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
  td: { padding: '15px', backgroundColor: '#f8f9fa' },
  trocoDestaque: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#fff9db', // Amarelo suave para chamar atenção
    borderRadius: '10px',
    border: '1px solid #fab005',
    textAlign: 'center',
    color: '#e67700',
    fontWeight: 'bold',
    fontSize: '18px'
  }
};

function Vendas({ produtos, aoVender, onLoginSuccess }) {
  const [carrinho, setCarrinho] = useState([]);
  const [codigoLeitor, setCodigoLeitor] = useState('');
  const [quantidadeDesejada, setQuantidadeDesejada] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState('PIX');
  const [valorEntregue, setValorEntregue] = useState(0);
  const [listaOperadores, setListaOperadores] = useState([]);
  const [operadorAtual, setOperadorAtual] = useState(localStorage.getItem('operador') || '');
  const [fundoCaixa, setFundoCaixa] = useState(Number(localStorage.getItem('fundo')) || 0);
  const [caixaAberto, setCaixaAberto] = useState(!!localStorage.getItem('operador'));
  const [vendasDoTurno, setVendasDoTurno] = useState([]);
  const [senhaInput, setSenhaInput] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  const adicionarAoCarrinho = (e) => {
    if (e) e.preventDefault(); // Impede o recarregamento da página

    // .trim() remove espaços e String() garante que estamos comparando texto com texto
    const codigoLimpo = String(codigoLeitor).trim();
    
    if (!codigoLimpo) return;

    const produto = produtos.find(p => String(p.codigo).trim() === codigoLimpo);

    if (produto) {
      // Verifica se o item já existe no carrinho pelo ID
      const itemExistente = carrinho.find(item => item.id === produto.id);

      if (itemExistente) {
        setCarrinho(carrinho.map(item => 
          item.id === produto.id 
            ? { ...item, qtd: item.qtd + (quantidadeDesejada || 1) } 
            : item
        ));
      } else {
        // Adiciona novo item garantindo que todas as propriedades existam
        setCarrinho([
          ...carrinho, 
          { 
            id: produto.id, 
            nome: produto.nome, 
            preco: Number(produto.preco), 
            qtd: quantidadeDesejada || 1 
          }
        ]);
      }
      
      // Limpa os campos para o próximo item
      setQuantidadeDesejada(1);
      setCodigoLeitor('');
    } else { 
      alert(`Picolé com código "${codigoLimpo}" não encontrado!`); 
    }
  };

  const finalizarVenda = () => {
  if (carrinho.length === 0) return alert("Carrinho vazio!");
  
  const token = localStorage.getItem('token');
  
  // Calculamos os valores para salvar no estado local
  const valorVenda = totalGeral;

  const itemParaVenda = {
    produto: carrinho[0].id,
    quantidade_vendida: carrinho[0].qtd,
    metodo: metodoPagamento,
    operador: operadorAtual,
    valor_recebido: metodoPagamento === 'DIN' ? valorEntregue : totalGeral,
    troco: metodoPagamento === 'DIN' ? trocoCalculado : 0
  };

  fetch(`${import.meta.env.VITE_API_URL}/api/vendas/`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify(itemParaVenda)
  })
  .then(async (res) => {
    if (res.ok) {
      // 1. Captura o valor total ANTES de limpar o carrinho
      const valorDaVendaAtual = totalGeral; 

      // 2. Cria o objeto com a propriedade "total" (que o seu saldoEmDinheiro espera)
      const novaVendaParaEstado = {
        metodo: metodoPagamento,
        total: valorDaVendaAtual 
      };

      // 3. Atualiza o estado das vendas do turno
      setVendasDoTurno(prevVendas => [...prevVendas, novaVendaParaEstado]);

      alert("✅ Venda realizada!");
      setCarrinho([]);
      setValorEntregue(0);
      if (aoVender) aoVender();
    } else {
      const erro = await res.json();
      alert("Erro: " + JSON.stringify(erro));
    }
  });
};

  const validarLoginNoDjango = () => {
    setErroLogin(''); // Limpa erro anterior

    fetch(`${import.meta.env.VITE_API_URL}/api/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: operadorAtual, password: senhaInput })
    })
    .then(res => {
      if (res.ok) return res.json();
      // Não diga se o erro foi na senha ou no usuário
      throw new Error('Usuário ou senha incorretos.'); 
    })
    .then(data => {
      localStorage.setItem('token', data.token); // Salva o Token de segurança
      localStorage.setItem('operador', operadorAtual);
      localStorage.setItem('fundo', String(fundoCaixa));
      setCaixaAberto(true);
      if (onLoginSuccess) onLoginSuccess();
    })
    .catch(err => {
      setErroLogin(err.message);
    });
  };

  const fecharCaixa = () => {
  const totalPix = vendasDoTurno.filter(v => v.metodo === 'PIX').reduce((acc, v) => acc + v.total, 0);
  const totalDinheiro = vendasDoTurno.filter(v => v.metodo === 'DIN').reduce((acc, v) => acc + v.total, 0);
  const totalCartao = vendasDoTurno.filter(v => ['DEB', 'CRE'].includes(v.metodo)).reduce((acc, v) => acc + v.total, 0);
  
  const resumo = `
    --- FECHAMENTO DE CAIXA ---
    Operador: ${operadorAtual}
    Fundo Inicial: R$ ${fundoCaixa.toFixed(2)}
    
    Vendas PIX: R$ ${totalPix.toFixed(2)}
    Vendas Cartão: R$ ${totalCartao.toFixed(2)}
    Vendas Dinheiro: R$ ${totalDinheiro.toFixed(2)}
    
    TOTAL NO CAIXA (Dinheiro + Fundo): R$ ${(fundoCaixa + totalDinheiro).toFixed(2)}
    ---------------------------
  `;

  alert(resumo);
  localStorage.clear();
  window.location.href = "/"; // Desloga e limpa tudo
};

  

  const totalGeral = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  const trocoCalculado = valorEntregue > totalGeral ? valorEntregue - totalGeral : 0;
  const saldoEmDinheiro = fundoCaixa + vendasDoTurno.filter(v => v.metodo === 'DIN').reduce((acc, v) => acc + v.total, 0);

  if (!caixaAberto) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#6c5ce7' }}>
        <div style={{ ...styles.card, width: '350px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#6c5ce7' }}>🍦 Picolé +</h2>
          
          <div style={{ textAlign: 'left', marginBottom: '15px' }}>
            <label style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>USUÁRIO</label>
            <input 
              type="text" 
              placeholder="Digite seu usuário" 
              value={operadorAtual}
              onChange={(e) => setOperadorAtual(e.target.value)} 
              style={{ ...styles.input, width: '100%', boxSizing: 'border-box', marginTop: '5px' }} 
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>SENHA</label>
            <input 
              type="password" 
              placeholder="Digite sua senha" 
              value={senhaInput}
              onChange={(e) => setSenhaInput(e.target.value)} 
              style={{ ...styles.input, width: '100%', boxSizing: 'border-box', marginTop: '5px' }} 
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '25px' }}>
            <label style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>FUNDO DE CAIXA (R$)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              onChange={(e) => setFundoCaixa(Number(e.target.value))} 
              style={{ ...styles.input, width: '100%', boxSizing: 'border-box', marginTop: '5px' }} 
            />
          </div>

          <button onClick={validarLoginNoDjango} style={{ ...styles.btnPrimary, width: '100%' }}>
            ENTRAR E ABRIR CAIXA
          </button>

          {erroLogin && (
            <p style={{ color: '#ff7675', marginTop: '15px', fontWeight: 'bold', fontSize: '14px' }}>
              ⚠️ {erroLogin}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
      <h3>🍦 PDV Aberto - {operadorAtual}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ color: '#00b894', fontWeight: 'bold' }}>Caixa: R$ {saldoEmDinheiro.toFixed(2)}</div>
        <button 
          onClick={fecharCaixa}
          style={{ backgroundColor: '#ff7675', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          FECHAR CAIXA
        </button>
      </div>
    </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
        <div style={styles.card}>
          <form onSubmit={adicionarAoCarrinho} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
  <input 
    type="number" 
    value={quantidadeDesejada} 
    onChange={(e) => setQuantidadeDesejada(Number(e.target.value))} 
    style={{ ...styles.input, width: '70px' }} 
  />
  <input 
    type="text" 
    placeholder="Código e Enter..." 
    value={codigoLeitor} 
    onChange={(e) => setCodigoLeitor(e.target.value)} 
    autoFocus 
    style={{ ...styles.input, flex: 1 }} 
  />
  {/* Botão oculto apenas para permitir o Enter no formulário */}
  <button type="submit" style={{ display: 'none' }}>Adicionar</button>
</form>
          <table style={styles.table}>
            <tbody>
              {carrinho.map(item => (
                <tr key={item.id}>
                  <td style={{ ...styles.td, borderRadius: '10px 0 0 10px' }}>{item.nome}</td>
                  <td style={styles.td}>{item.qtd}x</td>
                  <td style={{ ...styles.td, borderRadius: '0 10px 10px 0' }}>R$ {(item.qtd * item.preco).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ ...styles.card, backgroundColor: '#f9f9ff' }}>
  <h4>Total</h4>
  <h2 style={{ fontSize: '32px', margin: '0 0 20px 0' }}>R$ {totalGeral.toFixed(2)}</h2>
  
  <label>Forma de Pagamento:</label>
  <select value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)} style={{ ...styles.input, width: '100%', marginBottom: '20px' }}>
    <option value="PIX">PIX</option>
    <option value="DIN">Dinheiro (Cédulas)</option>
    <option value="DEB">Cartão de Débito</option>
    <option value="CRE">Cartão de Crédito</option>
  </select>

  {metodoPagamento === 'DIN' && (
    <div>
      <label>Valor Recebido (R$):</label>
      <input 
        type="number" 
        step="0.01"
        placeholder="Quanto o cliente deu?" 
        value={valorEntregue}
        onChange={(e) => setValorEntregue(Number(e.target.value))} 
        style={{ ...styles.input, width: '100%', marginBottom: '10px', boxSizing: 'border-box' }} 
      />
      
      {valorEntregue > 0 && (
        <div style={styles.trocoDestaque}>
          TROCO: R$ {trocoCalculado.toFixed(2)}
        </div>
      )}
    </div>
  )}

  <button 
    onClick={finalizarVenda} 
    style={{ ...styles.btnPrimary, width: '100%', backgroundColor: '#00b894', marginTop: '20px' }}
  >
    FINALIZAR VENDA
  </button>
</div>
      </div>
    </div>
  );
}

export default Vendas;