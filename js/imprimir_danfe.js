// =========================================================================
    // CONFIGURAÇÃO DA API
    // =========================================================================
    const API_URL = 'https://back-end-sefaz-notafiscal.onrender.com/api/nfe/processar-completo'; 

    // =========================================================================
    // PAYLOAD JSON (ENVIADO VIA POST)
    // =========================================================================
    const PAYLOAD_NFE = {
      "emitente": {
        "nome": "Autocenter",
        "nome_fantasia": "Pereira",
        "cpf_cnpj": "1236666",
        "inscricao_estadual": "1111",
        "endereco": [
          {
            "logradouro": "Rua teste Pereira",
            "numero": "666",
            "bairro": "bairro xx",
            "cidade": "cidade xxx",
            "uf": "sp",
            "cep": "0000000",
            "complemento": "ddfgdg"
          }
        ]
      },  
      "detinatario": {
        "nome": "Marcel",
        "cpf_cnpj": "456789879",
        "endereco": [
          {
            "logradouro": "Rua do SENAI",
            "numero": "1A",
            "bairro": "bairro xx",
            "cidade": "cidade xxx",
            "uf": "sp",
            "cep": "0000000",
            "complemento": "ddfgdg"
          }
        ]
      },
      "produtos": [
        {
          "codigo": "P101",
          "descricao": "Pastilha de Freios",
          "ncm": "85234990",
          "quantidade": 4,
          "valor_unitario": 100,
          "valor_produto_compra": 400
        },
        {
          "codigo": "P102",
          "descricao": "Pneu",
          "ncm": "49019900",
          "quantidade": 1,
          "valor_unitario": 250.00,
          "valor_produto_compra": 250
        }
      ],
      "chave": "35261012345678000195550010000000011234567890"
    };

    let pdfBase64Global = '';

    // =========================================================================
    // FUNÇÃO PRINCIPAL DE REQUISIÇÃO (FETCH)
    // =========================================================================
    async function emitirNFe() {
      const btn = document.getElementById('btnEmitir');
      const divStatus = document.getElementById('divStatus');
      const iframe = document.getElementById('iframePdf');
      const divAcoes = document.getElementById('divAcoes');

      btn.disabled = true;
      btn.innerText = 'Processando...';
      divStatus.style.display = 'block';
      divStatus.className = 'status';
      divStatus.innerText = 'Enviando dados para a API...';
      iframe.style.display = 'none';
      divAcoes.style.display = 'none';

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(PAYLOAD_NFE)
        });

        const data = await response.json();

        if (!response.ok || !data.sucesso) {
          throw new Error(data.erro || data.mensagem || 'Falha ao processar a NF-e na API.');
        }

        // Trata o retorno do Base64 (com ou sem o prefixo data:application/pdf)
        let base64String = data.pdfBase64 || data.danfeBase64 || '';

        if (!base64String) {
          throw new Error('A API respondeu com sucesso, mas o campo "pdfBase64" veio vazio.');
        }

        if (!base64String.startsWith('data:application/pdf;base64,')) {
          base64String = `data:application/pdf;base64,${base64String}`;
        }

        pdfBase64Global = base64String;

        // Sucesso
        divStatus.className = 'status sucesso';
        divStatus.innerText = `✅ DANFE gerado com sucesso! Chave: ${data.chaveAcesso || PAYLOAD_NFE.chave}`;

        // Exibe o PDF no iframe
        iframe.src = pdfBase64Global;
        iframe.style.display = 'block';
        divAcoes.style.display = 'block';

      } catch (error) {
        console.error('Erro na integração:', error);
        divStatus.className = 'status erro';
        divStatus.innerText = `❌ Erro: ${error.message}`;
      } finally {
        btn.disabled = false;
        btn.innerText = 'Enviar Requisição e Gerar DANFE';
      }
    }

    // Função utilitária para abrir o Base64 diretamente em uma nova aba do navegador
    function abrirNovaAba() {
      if (pdfBase64Global) {
        const win = window.open();
        win.document.write(`
          <style>body { margin: 0; padding: 0; font-family: Arial; }</style>
          <iframe src="${pdfBase64Global}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>
        `);
      }
    }