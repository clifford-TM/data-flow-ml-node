// Função para atualizar as opções de ETD com base no turno selecionado
function updateEtdOptions() {
    const turno = document.getElementById('turno').value;
    const etdSelect = document.getElementById('etd');
    etdSelect.innerHTML = '<option value="">Escolha o ETD</option>';  // Limpar as opções anteriores

    let etds = [];
    
    if (turno === '1') {
        etds = ['9', '12', '13', '14'];
    } else if (turno === '2') {
        etds = ['17', '19', '20', '22'];
    } else if (turno === '3') {
        etds = ['00', '01', '02', '03', '04'];
    }

    // Adicionar as opções de ETD com base no turno
    etds.forEach(etd => {
        const option = document.createElement('option');
        option.value = etd;
        option.textContent = etd;
        etdSelect.appendChild(option);
    });
}

// Função para enviar a requisição
function enviarRequisicao() {
    const turno = document.getElementById('turno').value;
    const etd = document.getElementById('etd').value;
    const canalizacao = document.getElementById('canalizacao').value;
    const data = document.getElementById('data').value;
  
        // Monta o datetime no formato 'YYYY-MM-DD HH:00:00'
    const etdDatetime = `${data} ${etd.padStart(2, '0')}:00:00`;

    const dados = {
      turno: turno,
      etd: etdDatetime,
      canalizacao: canalizacao,
      data: data
    };

  
    // Enviar a requisição para o servidor
    axios.post('/auditoria', dados)
    .then(response => {
      console.log('Resposta do servidor:', response.data);
  
      const resultadosDiv = document.getElementById('resultados');
      resultadosDiv.innerHTML = ''; // Limpar resultados anteriores
  
      // Se houver dados
      if (response.data.data.length > 0) {
        // REMOVE DUPLICADOS AQUI
        const unicos = [];
        const vistos = new Set();
        
        response.data.data.forEach(item => {
          const chave = `${item.hu}-${item.status}-${item.pacotes}-${item.canalizacao}-${item.posicao}-${item.data_criacao}-${item.data_final}`;
          if (!vistos.has(chave)) {
            vistos.add(chave);
            unicos.push(item);
          }
        });
  
        // Tabela exibindo os resultados da consulta
        const table = document.createElement('table');
        table.innerHTML = `
          <tr>
            <th>HU</th>
            <th>Canalização</th>
            <th>Posição</th>
          </tr>
        `;
        unicos.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.hu}</td>
            <td>${item.canalizacao}</td>
            <td>${item.posicao}</td>
          `;
          table.appendChild(row);
        });
  
        resultadosDiv.appendChild(table);
      } else {
        resultadosDiv.innerHTML = 'Nenhum desvio encontrado para o critério informado.';
      }
    })
  
      .catch(error => {
        console.error('Erro ao enviar a requisição:', error);
      });
  }
  

