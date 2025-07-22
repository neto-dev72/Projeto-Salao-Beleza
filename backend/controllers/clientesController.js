const express = require('express');
const router = express.Router();
const Usuario  = require('../models/usuarios');
const Clientes  = require('../models/clientes');
const Servico  = require("../models/servicos")
const Vendas = require("../models/vendas")
const VendaServico = require("../models/VendaServico");

const Produtos = require("../models/Produtos");

const AgendamentoProduto = require("../models/agendaProdutos");
const VendaProduto = require("../models/VendaProduto");

const bcrypt = require('bcrypt');



const Funcionarios = require("../models/Funcionarios");


const Salao = require("../models/salao");

const CategoriaServico = require("../models/CategoriaServico");



const auth = require('../middleware/auth'); // ajuste o caminho conforme necessário






// PUT /saloes/:id/status — Atualiza status do salão
router.put('/saloes/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(req.body)

  // Validação simples dos status permitidos
  const statusValidos = ['pendente', 'ativo', 'bloqueado'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }

  try {
    const salao = await Salao.findByPk(id);
    if (!salao) {
      return res.status(404).json({ erro: 'Salão não encontrado.' });
    }

    salao.status = status;
    await salao.save();

    return res.json({ mensagem: 'Status atualizado com sucesso.', salao });
  } catch (error) {
    console.error('Erro ao atualizar status do salão:', error);
    return res.status(500).json({ erro: 'Erro interno ao atualizar status.' });
  }
});




router.post('/cadastrar-clientes', auth, async (req, res) => {
  try {
    const {
      nome,
      telefone,
      email,
      dataNascimento,
      localidade,
      metodoPagamentoId
    } = req.body;

    console.log(req.body);

    // Buscar usuário logado
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;

    // Criar cliente
    const novoCliente = await Clientes.create({
      nome,
      telefone,
      email,
      dataNascimento,
      localidade,
      SalaoId,
      MetodoPagamentoId: metodoPagamentoId || null
    });

    res.status(201).json({ cliente: novoCliente });

  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar cliente.' });
  }
});




const MetodoPagamento = require("../models/metodopagamento")


router.post('/cadastrar-pagamento', auth, async (req, res) => {
  try {
    const { tipo, detalhes } = req.body;

    // Busca o usuário logado
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;
    const UsuarioId = usuario.id;

    const novoMetodo = await MetodoPagamento.create({
      tipo,
      detalhes,
      SalaoId,
      UsuarioId
    });

    res.status(201).json(novoMetodo);
  } catch (error) {
    console.error('Erro ao criar método de pagamento:', error);
    res.status(500).json({ erro: 'Erro ao criar método de pagamento.' });
  }
});


router.get('/todos-pagamento', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;

    const metodos = await MetodoPagamento.findAll({
      where: { SalaoId }
    });

    res.status(200).json(metodos);
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    res.status(500).json({ erro: 'Erro ao buscar métodos de pagamento.' });
  }
});








router.post('/agendar-cliente-existente', auth, async (req, res) => {
  const t = await Clientes.sequelize.transaction(); // Iniciando transação

  console.log(req.body); // Logando o corpo da requisição para depuração

  try {
    const {
      clienteId,
      dataAgendamento,
      observacoes,
      servicosIds = [],  // IDs dos serviços selecionados
      produtosAgendados = [],  // Produtos agendados
      metodoPagamentoId,
      funcionarioId  // ID do funcionário que será registrado no agendamento
    } = req.body;

    // Busca o usuário logado
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;  // ID do salão do usuário
    const UsuarioId = usuario.id;  // ID do usuário logado

    // Busca o cliente pelo ID
    const cliente = await Clientes.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    // Criação do novo agendamento
    const novoAgendamento = await Agendamento.create({
      dataHora: dataAgendamento || new Date(),  // Se dataAgendamento não for fornecida, usa a data atual
      observacoes,
      ClienteId: clienteId,
      finalizado: false,
      MetodoPagamentoId: metodoPagamentoId || null,
      SalaoId,
      UsuarioId
    }, { transaction: t });

    // Registra os serviços no AgendamentoServico
    if (servicosIds.length > 0) {
      const servicos = await Servico.findAll({
        where: { id: servicosIds }
      });

      const registrosServicos = servicos.map(servico => ({
        preco: servico.preco,
        duracao: servico.duracao || null,
        observacoes: '',  // Caso tenha observações, pode ser ajustado
        AgendamentoId: novoAgendamento.id,
        ServicoId: servico.id,
        SalaoId,
        FuncionarioId: funcionarioId,  // Registrando o FuncionarioId
        UsuarioId
      }));

      await AgendamentoServico.bulkCreate(registrosServicos, { transaction: t });
    }

    // Registra os produtos no AgendamentoProduto
    if (produtosAgendados.length > 0) {
      const idsProdutos = produtosAgendados.map(p => p.id);

      const produtos = await Produtos.findAll({
        where: { id: idsProdutos }
      });

      const produtosNaoEncontrados = produtosAgendados.filter(
        p => !produtos.find(prod => prod.id === p.id)
      );

      if (produtosNaoEncontrados.length > 0) {
        return res.status(404).json({
          erro: 'Alguns produtos não foram encontrados: ' +
            produtosNaoEncontrados.map(p => p.id).join(', ')
        });
      }

      const registrosProdutos = produtosAgendados.map(prodAgendado => {
        const produto = produtos.find(p => p.id === prodAgendado.id);
        return {
          preco: produto?.precoVenda || 0,  // Usando preço de venda
          quantidade: prodAgendado.quantidade || 1,
          observacoes: '',  // Caso queira adicionar observações
          AgendamentoId: novoAgendamento.id,
          ProdutoId: produto.id,
          SalaoId,
          UsuarioId
        };
      });

      await AgendamentoProduto.bulkCreate(registrosProdutos, { transaction: t });
    }

    // Commitando a transação
    await t.commit();
    res.status(201).json({ agendamento: novoAgendamento });

  } catch (erro) {
    // Caso ocorra algum erro, a transação será revertida
    await t.rollback();
    console.error('Erro ao agendar cliente existente:', erro);
    res.status(500).json({ erro: 'Erro ao agendar cliente existente.', detalhes: erro.message || erro.toString() });
  }
});




router.post('/registra-venda-avulsa', auth, async (req, res) => {
  const t = await Vendas.sequelize.transaction();

  try {
    const {
      clienteId,
      dataVenda,
      observacoes,
      servicos = [],
      produtos = [],
      metodoPagamentoId,
      funcionarioId,  // Recebendo o ID do funcionário
    } = req.body;

   

    console.log("Metodo de pagamento:" ,metodoPagamentoId);
    console.log("ID do funcionário:" ,funcionarioId);  // Logando o ID do funcionário
    console.log("as vendas:" ,req.body);

    if (!clienteId || (servicos.length === 0 && produtos.length === 0)) {
      return res.status(400).json({ erro: 'Cliente e ao menos um serviço ou produto são obrigatórios.' });
    }

    // Busca o usuário logado
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;

    // Calcula valor total dos serviços
    const totalServicos = servicos.reduce((total, s) => total + (parseFloat(s.preco) || 0), 0);

    // Para produtos, buscar no banco os preços corretos
    const idsProdutos = produtos.map(p => p.id);
    const produtosNoBanco = await Produtos.findAll({
      where: { id: idsProdutos },
      transaction: t
    });

    if (produtosNoBanco.length !== idsProdutos.length) {
      return res.status(404).json({ erro: 'Alguns produtos não foram encontrados.' });
    }

    // Calcula total dos produtos baseado no precoVenda e quantidade informada
    let totalProdutos = 0;
    for (const p of produtos) {
      const produtoBanco = produtosNoBanco.find(prod => prod.id === p.id);
      if (!produtoBanco) {
        await t.rollback();
        return res.status(404).json({ erro: `Produto com id ${p.id} não encontrado.` });
      }
      totalProdutos += produtoBanco.precoVenda * (p.quantidade || 1);
    }

    const valorTotal = totalServicos + totalProdutos;

    // Busca cliente
    const cliente = await Clientes.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    // Cria venda
    const novaVenda = await Vendas.create({
      clienteId,
      dataVenda: dataVenda || new Date(),
      valorTotal,
      observacoes: observacoes || '',
      MetodoPagamentoId: metodoPagamentoId || null,
      SalaoId, // SalaoId corretamente atribuído
      UsuarioId: usuario.id
    }, { transaction: t });

    // Registra serviços
    const registrosServicos = servicos.map(s => ({
      preco: s.preco,
      ServicoId: s.id,
      VendaId: novaVenda.id,
      SalaoId: SalaoId, // Adicionando SalaoId
      FuncionarioId: funcionarioId  // Adicionando ID do funcionário ao registro de serviço
    }));
    await VendaServico.bulkCreate(registrosServicos, { transaction: t });

    // Registra produtos
    const registrosProdutos = [];
    for (const p of produtos) {
      const produto = produtosNoBanco.find(prod => prod.id === p.id);
      if (!produto) {
        await t.rollback();
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }

      if (produto.quantidade < (p.quantidade || 1)) {
        await t.rollback();
        return res.status(400).json({ erro: `Produto ${produto.nome} sem estoque suficiente.` });
      }

      // Subtrai a quantidade vendida do estoque
      produto.quantidade -= (p.quantidade || 1);
      await produto.save({ transaction: t });

      registrosProdutos.push({
        preco: produto.precoVenda,
        ProdutoId: produto.id,
        VendaId: novaVenda.id,
        SalaoId: SalaoId,  // Adicionando SalaoId
        quantidade: p.quantidade || 1
      });
    }
    await VendaProduto.bulkCreate(registrosProdutos, { transaction: t });

    console.log('Venda criada com sucesso:', novaVenda.id);
    await t.commit();

    res.status(201).json({ mensagem: 'Venda registrada com sucesso!', venda: novaVenda });

  } catch (erro) {
    await t.rollback();
    console.error('Erro ao registrar venda avulsa:', erro);
    res.status(500).json({ erro: 'Erro ao registrar venda avulsa.', detalhes: erro.message || erro.toString() });
  }
});









router.post('/agendar-cliente', auth, async (req, res) => {
  const t = await Clientes.sequelize.transaction();

  console.log(req.body);

  try {
    const {
      nome,
      telefone,
      email,
      dataNascimento,
      localidade,
      dataAgendamento,
      observacoes,
      servicosIds = [],
      produtosAgendados = [], // [{ id, quantidade }]
      metodoPagamentoId
    } = req.body;

    // Busca o usuário logado e seu SalaoId
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;
    const UsuarioId = usuario.id;

    // 1. Cria o cliente com SalaoId
    const novoCliente = await Clientes.create({
      nome,
      telefone,
      email,
      dataNascimento,
      localidade,
      dataAgendamento,
      observacoes,
      SalaoId
    }, { transaction: t });

    // 2. Cria o agendamento com SalaoId e UsuarioId
    const novoAgendamento = await Agendamento.create({
      dataHora: dataAgendamento || new Date(),
      observacoes,
      ClienteId: novoCliente.id,
      finalizado: false,
      MetodoPagamentoId: metodoPagamentoId || null,
      SalaoId,
      UsuarioId
    }, { transaction: t });

    // 3. Relaciona os serviços (se houver)
    if (servicosIds.length > 0) {
      const servicos = await Servico.findAll({ where: { id: servicosIds }, transaction: t });

      const registrosServicos = servicos.map(servico => ({
        preco: servico.preco,
        duracao: servico.duracao || null,
        observacoes: '',
        AgendamentoId: novoAgendamento.id,
        ServicoId: servico.id,
        SalaoId,
        UsuarioId
      }));

      await AgendamentoServico.bulkCreate(registrosServicos, { transaction: t });
    }

    // 4. Relaciona os produtos (se houver)
    if (produtosAgendados.length > 0) {
      const idsProdutos = produtosAgendados.map(p => p.id);

      const produtos = await Produtos.findAll({ where: { id: idsProdutos }, transaction: t });

      // Validar se todos produtos existem
      const produtosNaoEncontrados = produtosAgendados.filter(pAg => !produtos.find(p => p.id === pAg.id));
      if (produtosNaoEncontrados.length > 0) {
        await t.rollback();
        return res.status(404).json({
          erro: 'Alguns produtos não foram encontrados: ' + produtosNaoEncontrados.map(p => p.id).join(', ')
        });
      }

      // Validar estoque
      for (const pAg of produtosAgendados) {
        const produto = produtos.find(p => p.id === pAg.id);
        const qtd = pAg.quantidade || 1;
        if (produto.quantidade < qtd) {
          await t.rollback();
          return res.status(400).json({ erro: `Produto ${produto.nome} sem estoque suficiente.` });
        }
      }

      // Atualizar estoque e preparar registros
      const registrosProdutos = [];
      for (const pAg of produtosAgendados) {
        const produto = produtos.find(p => p.id === pAg.id);
        const qtd = pAg.quantidade || 1;

        produto.quantidade -= qtd;
        await produto.save({ transaction: t });

        registrosProdutos.push({
          preco: produto.precoVenda,
          quantidade: qtd,
          observacoes: '',
          AgendamentoId: novoAgendamento.id,
          ProdutoId: produto.id,
          SalaoId,
          UsuarioId
        });
      }

      await AgendamentoProduto.bulkCreate(registrosProdutos, { transaction: t });
    }

    // 5. Finaliza transação
    await t.commit();
    res.status(201).json({ agendamento: novoAgendamento });

  } catch (erro) {
    await t.rollback();
    console.error('Erro ao agendar cliente:', erro);
    res.status(500).json({ erro: 'Erro ao agendar cliente.' });
  }
});





router.post('/agendamentos/:id/finalizar', auth, async (req, res) => {
  const { id } = req.params;
  const t = await Vendas.sequelize.transaction(); // Inicia a transação

  try {
    const usuarioId = req.usuario.id;
    const usuario = await Usuario.findByPk(usuarioId, { transaction: t });

    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;

    // 1. Busca o agendamento
    const agendamento = await Agendamento.findByPk(id, { transaction: t });

    if (!agendamento) {
      await t.rollback();
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    if (agendamento.finalizado) {
      await t.rollback();
      return res.status(400).json({ erro: 'Agendamento já finalizado' });
    }

    // 2. Busca os serviços do agendamento
    const agendamentoServicos = await AgendamentoServico.findAll({
      where: { AgendamentoId: id },
      transaction: t
    });

    // 3. Busca os produtos do agendamento
    const agendamentoProdutos = await AgendamentoProduto.findAll({
      where: { AgendamentoId: id },
      transaction: t
    });

    if (agendamentoServicos.length === 0 && agendamentoProdutos.length === 0) {
      await t.rollback();
      return res.status(400).json({ erro: 'Nenhum serviço ou produto encontrado para este agendamento' });
    }

    // 4. Calcula valor total e prepara dados
    let valorTotal = 0;
    const vendaServicos = [];
    const vendaProdutos = [];

    // Processa os serviços
    for (const registro of agendamentoServicos) {
      const servico = await Servico.findByPk(registro.ServicoId, { transaction: t });
      const preco = servico?.preco ?? registro.preco ?? 0;
      const precoNumerico = parseFloat(preco) || 0;

      valorTotal += precoNumerico;

      vendaServicos.push({
        ServicoId: registro.ServicoId,
        preco: precoNumerico,
        FuncionarioId: registro.FuncionarioId // Pegando o FuncionarioId de AgendamentoServico
      });
    }

    // Busca todos os produtos agendados no banco para validar estoque e pegar preçoVenda
    const idsProdutos = agendamentoProdutos.map(p => p.ProdutoId);
    const produtosNoBanco = await Produtos.findAll({
      where: { id: idsProdutos },
      transaction: t
    });

    // Processa os produtos
    for (const produtoAgendado of agendamentoProdutos) {
      const produto = produtosNoBanco.find(p => p.id === produtoAgendado.ProdutoId);
      if (!produto) {
        await t.rollback();
        return res.status(404).json({ erro: `Produto com id ${produtoAgendado.ProdutoId} não encontrado.` });
      }

      const quantidade = produtoAgendado.quantidade ?? 1;

      if (produto.quantidade < quantidade) {
        await t.rollback();
        return res.status(400).json({ erro: `Estoque insuficiente para o produto ${produto.nome}.` });
      }

      const preco = produto.precoVenda ?? produto.preco ?? 0;
      const precoTotalProduto = preco * quantidade;
      valorTotal += precoTotalProduto;

      vendaProdutos.push({
        ProdutoId: produto.id,
        preco,
        quantidade,
        produto // Passando a referência para atualizar depois
      });
    }

    // 5. Cria a venda
    const novaVenda = await Vendas.create({
      clienteId: agendamento.ClienteId,
      dataVenda: new Date(),
      valorTotal,
      observacoes: agendamento.observacoes || '',
      UsuarioId: usuarioId,
      SalaoId,
      MetodoPagamentoId: agendamento.MetodoPagamentoId || null
    }, { transaction: t });

    // 6. Relaciona serviços e registra FuncionarioId
    for (const item of vendaServicos) {
      await VendaServico.create({
        VendaId: novaVenda.id,
        ServicoId: item.ServicoId,
        preco: item.preco,
        FuncionarioId: item.FuncionarioId, // Registrando o FuncionarioId
        SalaoId
      }, { transaction: t });
    }

    // 7. Relaciona produtos e atualiza estoque
    for (const item of vendaProdutos) {
      await VendaProduto.create({
        VendaId: novaVenda.id,
        ProdutoId: item.ProdutoId,
        preco: item.preco,
        quantidade: item.quantidade,
        SalaoId
      }, { transaction: t });

      // Atualiza o estoque
      item.produto.quantidade -= item.quantidade;
      await item.produto.save({ transaction: t });
    }

    // 8. Marca o agendamento como finalizado
    agendamento.finalizado = true;
    await agendamento.save({ transaction: t });

    // Commit da transação
    await t.commit();

    res.json({ mensagem: 'Atendimento finalizado e venda registrada com sucesso.' });
  } catch (err) {
    await t.rollback();
    console.error('Erro ao finalizar atendimento:', err);
    res.status(500).json({ erro: 'Erro ao finalizar atendimento', detalhes: err.message });
  }
});



  
router.get('/clientes', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;

    const lista = await Clientes.findAll({
      where: {
        ativo: 1,
        SalaoId
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(lista);
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).json({ erro: 'Falha ao listar clientes.' });
  }
});




router.get('/clientes/:id/historico', async (req, res) => {
  const id = req.params.id;

  try {
    // Buscar todas as vendas realizadas pelo cliente
    const vendas = await Vendas.findAll({
      where: { clienteId: id },
      order: [['dataVenda', 'DESC']]
    });

    // Variáveis para contar o total gasto e os serviços/produtos mais comprados
    let totalGasto = 0;
    const servicosCount = {};
    const produtosCount = {};

    const resultado = await Promise.all(
      vendas.map(async (venda) => {
        if (!venda || !venda.id) {
          console.warn('Venda inválida encontrada:', venda);
          return null;
        }

        // Total gasto
        totalGasto += Number(venda.valorTotal);

        // Buscar serviços relacionados à venda
        const vendaServicos = await VendaServico.findAll({
          where: { vendaId: venda.id }
        });

        // Contabilizando os serviços mais comprados
        await Promise.all(vendaServicos.map(async (vendaServico) => {
          const servicoId = vendaServico.ServicoId;
          const servico = await Servico.findByPk(servicoId);
          if (servico) {
            const servicoNome = servico.nome;
            servicosCount[servicoNome] = (servicosCount[servicoNome] || 0) + 1;
          }
        }));

        // Buscar produtos relacionados à venda
        const vendaProdutos = await VendaProduto.findAll({
          where: { vendaId: venda.id }
        });

        // Contabilizando os produtos mais comprados
        await Promise.all(vendaProdutos.map(async (vendaProduto) => {
          const produtoId = vendaProduto.ProdutoId;
          const produto = await Produtos.findByPk(produtoId);
          if (produto) {
            const produtoNome = produto.nome;
            produtosCount[produtoNome] = (produtosCount[produtoNome] || 0) + 1;
          }
        }));

        // Obter os serviços e produtos dessa venda
        const servicos = await Promise.all(
          vendaServicos.map(async (vendaServico) => {
            const servico = await Servico.findByPk(vendaServico.ServicoId);
            return servico ? { id: servico.id, nome: servico.nome, preco: Number(servico.preco) } : null;
          })
        );

        const produtos = await Promise.all(
          vendaProdutos.map(async (vendaProduto) => {
            const produto = await Produtos.findByPk(vendaProduto.ProdutoId);
            return produto ? { id: produto.id, nome: produto.nome, preco: Number(produto.precoVenda) } : null;
          })
        );

        return {
          id: venda.id,
          dataVenda: venda.dataVenda,
          valorTotal: Number(venda.valorTotal),
          observacoes: venda.observacoes,
          servicos: servicos.filter(s => s !== null),
          produtos: produtos.filter(p => p !== null)
        };
      })
    );

    // Filtra valores nulos
    const resultadoFiltrado = resultado.filter((r) => r !== null);

    // Agora, vamos buscar o serviço e produto mais comprados
    const servicoMaisComprado = Object.keys(servicosCount).length > 0
      ? Object.keys(servicosCount).reduce((a, b) =>
          servicosCount[a] > servicosCount[b] ? a : b
        )
      : null; // Se o array estiver vazio, retorna null ou uma string vazia

    const produtoMaisComprado = Object.keys(produtosCount).length > 0
      ? Object.keys(produtosCount).reduce((a, b) =>
          produtosCount[a] > produtosCount[b] ? a : b
        )
      : null; // Se o array estiver vazio, retorna null ou uma string vazia

    res.json({
      historico: resultadoFiltrado,
      totalGasto,
      servicoMaisComprado,
      produtoMaisComprado
    });
  } catch (err) {
    console.error('Erro ao buscar histórico:', err);
    res.status(500).json({ erro: 'Falha ao carregar histórico.' });
  }
});




// DELETE /clientes/:id - Exclui um cliente por ID
router.delete('/clientes/:id', async (req, res) => {
  const id = req.params.id
  try {
    const cliente = await Clientes.findByPk(id)

    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' })
    }

    await cliente.destroy()
    res.json({ mensagem: 'Cliente excluído com sucesso.' })
  } catch (err) {
    console.error('Erro ao excluir cliente:', err)
    res.status(500).json({ erro: 'Erro ao excluir cliente.' })
  }
})















router.post('/cadastrar-servicos', auth, async (req, res) => {
  try {
    const { nome, descricao, preco, ativo = true, CategoriaServicoId } = req.body;

    console.log(req.body)

    if (!nome || !preco || !CategoriaServicoId) {
      return res.status(400).json({ erro: 'Nome, preço e categoria são obrigatórios.' });
    }

    const usuario = await Usuario.findByPk(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Verifica se a categoria existe e pertence ao mesmo salão do usuário
    const categoria = await CategoriaServico.findOne({
      where: {
        id: CategoriaServicoId,
        SalaoId: usuario.SalaoId
      }
    });

    if (!categoria) {
      return res.status(400).json({ erro: 'Categoria de serviço inválida ou não pertence ao salão.' });
    }

    const novoServico = await Servico.create({
      nome,
      descricao,
      preco,
      ativo,
      SalaoId: usuario.SalaoId,
      UsuarioId: usuario.id,
      CategoriaServicoId
    });

    res.status(201).json(novoServico);
  } catch (error) {
    console.error('Erro ao cadastrar serviço:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar serviço.' });
  }
});






router.post('/cadastrar-categoria-servico', auth, async (req, res) => {
  try {
    const { nome, descricao } = req.body

    if (!nome) {
      return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' })
    }

    const usuario = await Usuario.findByPk(req.usuario.id)

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' })
    }

    const SalaoId = usuario.SalaoId

    const novaCategoria = await CategoriaServico.create({
      nome,
      descricao,
      SalaoId
    })

    res.status(201).json(novaCategoria)
  } catch (error) {
    console.error('Erro ao cadastrar categoria:', error)
    res.status(500).json({ erro: 'Erro ao cadastrar categoria.' })
  }
})



// Exemplo: routes/servicoRoutes.js ou onde estão suas rotas
router.get('/categorias-servicos', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id)

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' })
    }

    const categorias = await CategoriaServico.findAll({
      where: { SalaoId: usuario.SalaoId },
      attributes: ['id', 'nome'],
      order: [['nome', 'ASC']]
    })

    res.json(categorias)
  } catch (error) {
    console.error('Erro ao listar categorias:', error)
    res.status(500).json({ erro: 'Erro ao buscar categorias.' })
  }
})


  

router.post('/cadastrar-produtos', auth, async (req, res) => {
  console.log(req.body)
  try {
    const {
      nome,
      descricao,
      precoCompra,
      precoVenda,
      quantidade,
      categoria,
      ativo
    } = req.body;

    // Verificações básicas
    if (!nome || precoCompra == null || precoVenda == null || quantidade == null) {
      return res.status(400).json({
        erro: 'Nome, preço de compra, preço de venda e quantidade são obrigatórios.'
      });
    }

    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;
    const UsuarioId = usuario.id;

    const novoProduto = await Produtos.create({
      nome,
      descricao,
      precoCompra,
      precoVenda,
      quantidade,
      categoria,
      ativo: ativo !== undefined ? ativo : true,
      SalaoId,
      UsuarioId
    });

    res.status(201).json(novoProduto);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar produto.' });
  }
});




// Atualizar serviço
router.patch('/salvar-servicos/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, ativo, CategoriaServicoId } = req.body;

  try {
    const servico = await Servico.findByPk(id);

    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado.' });
    }

    // Verifica se o usuário logado pertence ao mesmo salão
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario || usuario.SalaoId !== servico.SalaoId) {
      return res.status(403).json({ erro: 'Permissão negada.' });
    }

    // Atualiza os dados do serviço
    await servico.update({
      nome,
      descricao,
      preco,
      ativo,
      CategoriaServicoId
    });

    return res.json(servico);
  } catch (erro) {
    console.error('Erro ao atualizar serviço:', erro);
    return res.status(500).json({ erro: 'Erro interno ao atualizar serviço.' });
  }
});





  

  
const Op = require("sequelize");
const Agendamento = require('../models/agendamento');
const AgendamentoServico = require('../models/agendaServico');

  

router.get('/agendamentos', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;
    const { data } = req.query;

    const where = { SalaoId };

    if (data) {
      where.dataHora = {
        [Op.gte]: new Date(`${data}T00:00:00`),
        [Op.lt]: new Date(`${data}T23:59:59`)
      };
    }

    const agendamentos = await Agendamento.findAll({
      where,
      order: [['dataHora', 'ASC']]
    });

    const agendamentosComCliente = await Promise.all(
      agendamentos.map(async (agendamento) => {
        const cliente = await Clientes.findByPk(agendamento.ClienteId);
        return {
          ...agendamento.toJSON(),
          clienteNome: cliente ? cliente.nome : 'Desconhecido'
        };
      })
    );

    res.json(agendamentosComCliente);
  } catch (err) {
    console.error('Erro ao buscar agendamentos:', err);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
});

  


router.get('/agendamentos/:id/ficha', async (req, res) => {
  try {
    const { id } = req.params;

    // Busca o agendamento com o método de pagamento incluído
    const agendamento = await Agendamento.findByPk(id, {
      include: [{ model: MetodoPagamento, as: 'MetodoPagamento' }]
    });

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    // Busca os serviços vinculados ao agendamento
    const agendamentoServicos = await AgendamentoServico.findAll({
      where: { AgendamentoId: id }
    });

    const servicos = await Promise.all(
      agendamentoServicos.map(async (registro) => {
        const servico = await Servico.findByPk(registro.ServicoId);
        const funcionario = await Funcionarios.findByPk(registro.FuncionarioId); // Busca o funcionário

        return {
          ...registro.toJSON(),
          nome: servico?.nome || 'Serviço removido',
          preco: servico?.preco ?? registro.preco ?? 0,
          funcionario: funcionario ? {
            id: funcionario.id,
            nome: funcionario.nome,
            funcao: funcionario.funcao
          } : null // Inclui as informações do funcionário
        };
      })
    );

    // Busca os produtos vinculados ao agendamento
    const agendamentoProdutos = await AgendamentoProduto.findAll({
      where: { AgendamentoId: id }
    });

    const produtos = await Promise.all(
      agendamentoProdutos.map(async (registro) => {
        const produto = await Produtos.findByPk(registro.ProdutoId);
        return {
          ...registro.toJSON(),
          nome: produto?.nome || 'Produto removido',
          preco: produto?.precoVenda ?? registro.preco ?? 0,
          quantidade: registro.quantidade || 0
        };
      })
    );

    // Busca o cliente
    const cliente = await Clientes.findByPk(agendamento.ClienteId);

    res.json({
      agendamento,
      cliente: cliente || null,
      servicos,
      produtos,  // Incluindo os produtos no retorno
      metodoPagamento: agendamento.MetodoPagamento || null
    });
  } catch (err) {
    console.error('Erro ao buscar ficha do agendamento:', err);
    res.status(500).json({ erro: 'Erro ao buscar ficha do agendamento' });
  }
});




router.get('/contador-agendamentos', auth, async (req, res) => {
  try {
    // Pega o usuário logado
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;

    // Conta agendamentos pendentes do salão do usuário
    const count = await Agendamento.count({
      where: {
        SalaoId,
        finalizado: 0
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Erro ao contar agendamentos pendentes:', error);
    res.status(500).json({ error: 'Erro ao contar agendamentos pendentes' });
  }
});










router.get('/funcionarios', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;

    // Busca os funcionários ativos no salão do usuário
    const lista = await Funcionarios.findAll({
      where: {
        ativo: 1, // Considerando que o valor de "ativo" seja 1 para funcionários ativos
        SalaoId
      },
      order: [['createdAt', 'DESC']] // Ordena pela data de criação (mais recentes primeiro)
    });

    res.json(lista);
  } catch (err) {
    console.error('Erro ao listar funcionários:', err);
    res.status(500).json({ erro: 'Falha ao listar funcionários.' });
  }
});





// Rota de cadastro de funcionários
router.post('/cadastrar-funcionarios', auth, async (req, res) => {
  try {
    // Recupera os dados do corpo da requisição
    const { nome, funcao, ativo, dataAdmissao } = req.body;

    // Verificar se todos os campos obrigatórios foram preenchidos
    if (!nome || !funcao || !dataAdmissao) {
      return res.status(400).json({ erro: 'Nome, função e data de admissão são obrigatórios.' });
    }

    // Recupera o usuário autenticado
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Pega o SalaoId do usuário autenticado
    const SalaoId = usuario.SalaoId;

    // Criar o novo funcionário no banco de dados
    const novoFuncionario = await Funcionarios.create({
      nome,
      funcao,
      ativo: ativo || true,  // Se não enviar, por padrão será ativo
      dataAdmissao,
      SalaoId, // Associa o SalaoId do usuário autenticado
    });

    // Retornar a resposta com o funcionário criado
    res.status(201).json(novoFuncionario);
  } catch (err) {
    console.error('Erro ao cadastrar funcionário:', err);
    res.status(500).json({ erro: 'Falha ao cadastrar funcionário.' });
  }
});













// Rota para obter o histórico de um funcionário (somente serviços)
router.get('/funcionarios/:id/historico', async (req, res) => {
  try {
    const { id } = req.params; // ID do funcionário

    // Buscar o funcionário no banco
    const funcionario = await Funcionarios.findByPk(id);
    if (!funcionario) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }

    // Obter as vendas de serviços associadas ao funcionário
    const vendas = await VendaServico.findAll({
      where: { FuncionarioId: id }
    });

    // Se não houver vendas, retorna um histórico vazio
    if (vendas.length === 0) {
      return res.status(200).json({
        historico: [],
        totalGanho: 0,
        servicoMaisRealizado: null
      });
    }

    // Buscar todos os serviços
    const servicos = await Servico.findAll();

    // Calcular o total ganho e montar o histórico detalhado
    let totalGanho = 0;
    const servicosRealizados = [];

    const historico = vendas.map(venda => {
      const servico = servicos.find(s => s.id === venda.ServicoId);

      if (!servico) {
        // Caso algum serviço não seja encontrado, ignora essa venda
        return null;
      }

      servicosRealizados.push(servico.nome);
      totalGanho += parseFloat(servico.preco);

      return {
        data: venda.createdAt,
        servicoNome: servico.nome,
        valor: parseFloat(servico.preco)
      };
    }).filter(Boolean); // Remove itens null

    // Determinar o serviço mais realizado
    const servicoMaisRealizado = servicosRealizados.length > 0
      ? servicosRealizados
          .sort((a, b) =>
            servicosRealizados.filter(v => v === a).length - servicosRealizados.filter(v => v === b).length
          )
          .pop()
      : null;

    // Retornar o histórico com o total ganho e o serviço mais realizado
    res.status(200).json({
      historico,
      totalGanho,
      servicoMaisRealizado
    });

  } catch (err) {
    console.error('Erro ao buscar histórico do funcionário:', err);
    res.status(500).json({ erro: 'Falha ao buscar histórico do funcionário.' });
  }
});

































// Rota para gerar o relatório de clientes
router.get('/relatorio/clientes', async (req, res) => {
  const { periodo, inicio, fim, clientes } = req.query;

  console.log(req.query);

  try {
    // Filtrar clientes selecionados
    const clientesSelecionados = await Clientes.findAll({
      where: {
        id: clientes.split(','),
      },
    });

    // Preparar intervalo de datas
    const dataInicio = inicio ? new Date(inicio) : new Date();
    const dataFim = fim ? new Date(fim) : new Date();

    // Buscar todas as vendas no período solicitado
    const vendas = await Vendas.findAll({
      where: {
        clienteId: clientesSelecionados.map(cliente => cliente.id),
        dataVenda: {
          [Op.between]: [dataInicio, dataFim],
        },
      },
    });

    // Buscar todos os produtos e serviços consumidos no período
    const vendaProdutos = await VendaProduto.findAll({
      where: {
        VendaId: vendas.map(venda => venda.id),
      },
    });

    const vendaServicos = await VendaServico.findAll({
      where: {
        VendaId: vendas.map(venda => venda.id),
      },
    });

    // Buscar os detalhes dos produtos e serviços
    const produtos = await Produtos.findAll({
      where: {
        id: vendaProdutos.map(vendaProduto => vendaProduto.ProdutoId),
      },
    });

    const servicos = await Servico.findAll({
      where: {
        id: vendaServicos.map(vendaServico => vendaServico.ServicoId),
      },
    });

    // Buscar os detalhes dos funcionários
    const funcionarios = await Funcionarios.findAll({
      where: {
        id: vendaServicos.map(vendaServico => vendaServico.FuncionarioId),
      },
    });

    // Processar os dados para cada cliente
    const dadosRelatorio = clientesSelecionados.map(cliente => {
      // Filtra as vendas que pertencem ao cliente
      const vendasCliente = vendas.filter(venda => venda.clienteId === cliente.id);

      // Calcular o total comprado
      const totalComprado = vendasCliente.reduce((total, venda) => total + parseFloat(venda.valorTotal), 0);

      // Identificar a última compra (venda mais recente)
      const ultimaCompra = vendasCliente.reduce((maisRecente, venda) => {
        return new Date(venda.dataVenda) > new Date(maisRecente.dataVenda) ? venda : maisRecente;
      }, vendasCliente[0]);

      // Identificar a data do último atendimento (última venda)
      const ultimaVenda = vendasCliente.reduce((maisRecente, venda) => {
        return new Date(venda.createdAt) > new Date(maisRecente.createdAt) ? venda : maisRecente;
      }, vendasCliente[0]);

      // Obter os produtos consumidos
      const produtosConsumidos = vendaProdutos.filter(vendaProduto => vendaProduto.VendaId === ultimaCompra.id)
        .map(vendaProduto => produtos.find(produto => produto.id === vendaProduto.ProdutoId).nome);

      // Obter os serviços consumidos e identificar o funcionário
      const servicosConsumidos = vendaServicos.filter(vendaServico => vendaServico.VendaId === ultimaCompra.id)
        .map(vendaServico => {
          // Buscar o serviço
          const servico = servicos.find(s => s.id === vendaServico.ServicoId);
          
          // Buscar o nome do funcionário que fez o serviço
          const funcionario = funcionarios.find(f => f.id === vendaServico.FuncionarioId);
          
          return `${servico.nome} efetuado por ${funcionario ? funcionario.nome : 'Desconhecido'}`;
        });

      // Retornar os dados processados para o cliente
      return {
        nome: cliente.nome,
        totalComprado: totalComprado.toFixed(2),
        ultimaCompra: ultimaCompra ? parseFloat(ultimaCompra.valorTotal).toFixed(2) : '0.00',
        dataUltimoAtendimento: ultimaVenda ? new Date(ultimaVenda.createdAt).toISOString().slice(0, 10) : 'N/A',
        produtosConsumidos: produtosConsumidos.join(', '), // Lista dos produtos comprados
        servicosConsumidos: servicosConsumidos.join(', '), // Lista dos serviços consumidos com o nome do funcionário
      };
    });

    // Retornar dados para o frontend
    res.json(dadosRelatorio);
  } catch (error) {
    console.error('Erro ao gerar o relatório de clientes:', error);
    res.status(500).json({ message: 'Erro ao gerar o relatório' });
  }
});






















const Sequelize = require("sequelize")


// Rota para gerar relatório de funcionários
router.get('/relatorio/funcionarios-rota', auth, async (req, res) => {
  try {
    const { periodo, inicio, fim, funcionarios } = req.query;

    // Verifica se ao menos um funcionário foi selecionado
    if (!funcionarios || funcionarios.length === 0) {
      return res.status(400).json({ erro: 'Nenhum funcionário selecionado.' });
    }

    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const SalaoId = usuario.SalaoId;

    // Criação da data final com horário configurado
    const dataFim = new Date(fim);
    dataFim.setHours(23, 59, 59, 999); // Final do dia

    // Criação da data de início com horário configurado
    const dataInicio = new Date(inicio);
    dataInicio.setHours(0, 0, 0, 0); // Início do dia

    // Monta o filtro para a consulta de vendas e serviços
    const whereConditions = {
      SalaoId,
      FuncionarioId: funcionarios.split(',').map(id => parseInt(id)), // Filtra pelos funcionários selecionados
      createdAt: {
        [Op.between]: [dataInicio, dataFim] // Filtra pelo período
      }
    };

    // Consulta agregada para contar atendimentos e calcular a receita total
    const relatorio = await VendaServico.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalAtendimentos'],
        [Sequelize.fn('SUM', Sequelize.col('valor')), 'receitaTotal'],
        'FuncionarioId'
      ],
      where: whereConditions,
      group: ['FuncionarioId'], // Agrupar por funcionário
      raw: true,
    });

    // Se não houver dados, enviar uma resposta apropriada
    if (relatorio.length === 0) {
      return res.status(404).json({ erro: 'Nenhum atendimento encontrado para os critérios fornecidos.' });
    }

    // Buscar os dados dos funcionários (nomes) manualmente após a consulta
    const funcionarioIds = relatorio.map(item => item.FuncionarioId);
    const funcionariosData = await Funcionarios.findAll({
      where: {
        id: funcionarioIds
      },
      attributes: ['id', 'nome'],
      raw: true,
    });

    // Criar um mapa de Funcionarios para facilitar a associação pelo ID
    const funcionariosMap = funcionariosData.reduce((acc, func) => {
      acc[func.id] = func.nome;
      return acc;
    }, {});

    // Formata os resultados para exibir o nome do funcionário junto com as métricas
    const resultado = relatorio.map(item => ({
      nome: funcionariosMap[item.FuncionarioId], // Recupera o nome do funcionário do mapa
      totalAtendimentos: parseInt(item.totalAtendimentos), // Assegura que é um número
      receitaTotal: parseFloat(item.receitaTotal), // Assegura que é um número
      status: 'Ativo', // Pode adicionar lógica para status de funcionários
    }));

    console.log("relatorio gerado: ", resultado);

    res.json(resultado);
  } catch (err) {
    console.error('Erro ao gerar relatório de funcionários:', err);
    res.status(500).json({ erro: 'Falha ao gerar relatório de funcionários.' });
  }
});



module.exports = router;
