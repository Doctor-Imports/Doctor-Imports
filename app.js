// ==========================================================================
// Doctor Imports - Lógica de Negócio e Componentização
// ==========================================================================

// Variáveis de Estado
let carrinho = JSON.parse(localStorage.getItem('doctor_imports_cart')) || [];
let filtroGeneroSelecionado = 'todos';
let ordenacaoSelecionada = 'padrao';

// Elementos do DOM
const inputBusca = document.getElementById('inputBusca');
const msgSemResultados = document.getElementById('msgSemResultados');
const gridPerfumes = document.getElementById('secaoPerfumesGrid');
const gridCelulares = document.getElementById('secaoCelularesGrid');
// Elemento do select de ordenação customizado (gerenciado via wrapper)
const customSelectWrapper = document.getElementById('customSelectWrapper');

// Modal Elements
const modal = document.getElementById('meuModal');
const modalNome = document.getElementById('modalNome');
const modalTexto = document.getElementById('modalTexto');
const modalPreco = document.getElementById('modalPreco');
const modalImagem = document.getElementById('modalImagem');
const fecharModal = document.getElementById('fecharModal');
const btnConsultarDirect = document.getElementById('btnConsultarDirect');

// Cart Drawer Elements
const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartBadge = document.getElementById('cartBadge');
const cartTotalValue = document.getElementById('cartTotalValue');
const btnCheckoutCart = document.getElementById('btnCheckoutCart');
const closeCartBtn = document.getElementById('closeCart');
const cartFloatBtn = document.getElementById('cartFloatBtn');

// ==========================================================================
// 1. Renderização Dinâmica de Produtos
// ==========================================================================

// Mapeamento das 4 Novas Grids Separadas
const gridPerfumesImportados = document.getElementById('gridPerfumesImportados');
const gridPerfumesArabes = document.getElementById('gridPerfumesArabes');
const gridIphonesNovos = document.getElementById('gridIphonesNovos');
const gridIphonesSeminovos = document.getElementById('gridIphonesSeminovos');

function renderizarProdutos(produtosFiltrados) {
    // Limpar todas as 4 grids
    if (gridPerfumesImportados) gridPerfumesImportados.innerHTML = '';
    if (gridPerfumesArabes) gridPerfumesArabes.innerHTML = '';
    if (gridIphonesNovos) gridIphonesNovos.innerHTML = '';
    if (gridIphonesSeminovos) gridIphonesSeminovos.innerHTML = '';

    // Contadores para gerenciamento visual de seções vazias
    let contImportados = 0;
    let contArabes = 0;
    let contNovos = 0;
    let contSeminovos = 0;

    produtosFiltrados.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'card-produto';
        card.dataset.id = produto.id;
        
        // Tratar indisponibilidade visual
        const isIndisponivel = produto.status.toLowerCase().includes('indisponível') || produto.status.toLowerCase().includes('indisponivel');
        const statusClass = isIndisponivel ? 'status-indisponivel' : 'status-disponivel';

        // Badges HTML
        let badgesHTML = '';
        if (produto.badges && produto.badges.length > 0) {
            badgesHTML = `<div class="wrapper-variacoes">`;
            produto.badges.forEach(b => {
                // SE FOR IPHONE: Fica sempre em destaque (active)
                // SE FOR PERFUME: Só fica em destaque se for o gênero correspondente
                const deveDestacar = produto.tipo === 'iphone' ? true : b.active;
                
                badgesHTML += `<span class="badge-spec ${deveDestacar ? 'active' : ''}">${b.name}</span>`;
            });
            badgesHTML += `</div>`;
        }

        // Especificações (perfume)
        const specHTML = produto.especificacao ? `<div class="especificacoes-perfume">${produto.especificacao}</div>` : '';

        const imgPrincipal = produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : (produto.imagem || 'https://via.placeholder.com/200');

        // Montar estrutura do card
        let imagensHTML = '';
        let arrowsHTML = '';
        if (produto.imagens && produto.imagens.length > 1) {
            produto.imagens.forEach(img => {
                imagensHTML += `<img src="${img}" alt="${produto.nome}" class="img-produto-slide" loading="lazy">`;
            });
            arrowsHTML = `
                <button class="card-nav-btn prev" onclick="navCardCarousel(event, this, -1)"><i class="fa-solid fa-chevron-left"></i></button>
                <button class="card-nav-btn next" onclick="navCardCarousel(event, this, 1)"><i class="fa-solid fa-chevron-right"></i></button>
            `;
        } else {
            imagensHTML = `<img src="${imgPrincipal}" alt="${produto.nome}" class="img-produto" loading="lazy">`;
        }

        card.innerHTML = `
            <div class="container-img">
                <div class="card-carousel">
                    ${imagensHTML}
                </div>
                ${arrowsHTML}
            </div>
            <div class="info-produto">
                <div class="info-header">
                    <span class="categoria">${produto.categoria}</span>
                    <h4 class="nome-produto">${produto.nome}</h4>
                    ${specHTML}
                    <div class="preco">${produto.preco}</div>
                    ${badgesHTML}
                </div>
                <div class="card-actions">
                    <span class="${statusClass}">${produto.status}</span>
                    <button class="add-to-cart-btn" ${isIndisponivel ? 'disabled' : ''}>
                        <i class="fa-solid fa-bag-shopping"></i> Sacola
                    </button>
                </div>
            </div>
        `;

        // Eventos de clique
        card.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                adicionarAoCarrinho(produto.id);
                return;
            }
            abrirDetalhesProduto(produto);
        });

        // ==========================================
        // Lógica de Distribuição nas 4 Grids
        // ==========================================
        if (produto.tipo === 'perfume') {
            if (produto.categoria.toLowerCase().includes('árabe')) {
                gridPerfumesArabes.appendChild(card);
                contArabes++;
            } else {
                gridPerfumesImportados.appendChild(card);
                contImportados++;
            }
        } else if (produto.tipo === 'iphone') {
            if (produto.categoria.toLowerCase().includes('seminovo')) {
                gridIphonesSeminovos.appendChild(card);
                contSeminovos++;
            } else {
                gridIphonesNovos.appendChild(card);
                contNovos++;
            }
        }
    });

    // Controlar visibilidade dinâmica de cada subseção (Esconde se estiver vazia no filtro/busca)
    document.getElementById('subsecaoImportados').style.display = contImportados > 0 ? 'block' : 'none';
    document.getElementById('subsecaoArabes').style.display = contArabes > 0 ? 'block' : 'none';
    document.getElementById('subsecaoIphonesNovos').style.display = contNovos > 0 ? 'block' : 'none';
    document.getElementById('subsecaoIphonesSeminovos').style.display = contSeminovos > 0 ? 'block' : 'none';

    // Gerenciar exibição dos blocos pai das seções (Perfumes / Celulares)
    document.getElementById('perfumes').style.display = (contImportados + contArabes) > 0 ? 'block' : 'none';
    document.getElementById('celulares').style.display = (contNovos + contSeminovos) > 0 ? 'block' : 'none';

    // Mensagem de Sem Resultados global
    if (produtosFiltrados.length === 0) {
        msgSemResultados.style.display = 'block';
    } else {
        msgSemResultados.style.display = 'none';
    }
}

// ==========================================================================
// 2. Sistema de Busca Difusa (Fuzzy Search) com Levenshtein
// ==========================================================================

function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function calcularDistanciaLevenshtein(a, b) {
    const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,       // Deleção
                dp[i][j - 1] + 1,       // Inserção
                dp[i - 1][j - 1] + cost // Substituição
            );
        }
    }
    return dp[a.length][b.length];
}

function filtrarEOrdenarProdutos() {
    // 1. Normaliza o termo de busca removendo espaços extras
    const buscaRaw = inputBusca.value.trim().toLowerCase();
    let resultados = [...PRODUTOS];

    if (buscaRaw) {
        // Normaliza os termos para ignorar acentos (usando a função que já existe no seu app.js)
        const buscaNorm = normalizarTexto(buscaRaw);
        const termosBusca = buscaNorm.split(/\s+/); // Divide se houver mais de uma palavra

        // TENTATIVA 1: Busca Estrita/Exata (Passa se o produto contiver TODOS os termos digitados)
        const resultadosExatos = PRODUTOS.filter(produto => {
            const nomeNorm = normalizarTexto(produto.nome);
            const catNorm = normalizarTexto(produto.categoria);
            const descNorm = normalizarTexto(produto.descricao);
            const textoCompleto = `${nomeNorm} ${catNorm} ${descNorm}`;

            // Garante que cada palavra digitada existe dentro do texto do produto
            return termosBusca.every(termo => textoCompleto.includes(termo));
        });

        if (resultadosExatos.length > 0) {
            // Se encontrou por termo exato, usa esses resultados e ignora o Levenshtein
            resultados = resultadosExatos;
        } else {
            // TENTATIVA 2: Fuzzy Search inteligente (Apenas para palavras longas e com limite rígido)
            resultados = PRODUTOS.filter(produto => {
                const nomeNorm = normalizarTexto(produto.nome);
                const palavrasProduto = nomeNorm.split(/[\s•,.\-\/]+/);

                return termosBusca.every(termo => {
                    // Se o termo for muito curto (ex: "ca", "11", "pro"), NÃO aceita aproximação por Levenshtein
                    if (termo.length <= 4) return false;

                    // Para palavras maiores, calcula a distância real
                    return palavrasProduto.some(palavraProd => {
                        if (palavraProd.length < 3) return false;
                        
                        // Passa a chamar a função exatamente com o nome correto do seu arquivo
                        const dist = calcularDistanciaLevenshtein(termo, palavraProd);
                        
                        // Margem rígida: erro de no máximo 1 letra para palavras médias, ou 2 para muito longas
                        const limiteMaximoErro = termo.length >= 6 ? 2 : 1;
                        return dist <= limiteMaximoErro;
                    });
                });
            });
        }
    }

    // 2. Filtragem por Gênero (Aba ativa)
    if (filtroGeneroSelecionado !== 'todos') {
        resultados = resultados.filter(produto => {
            if (produto.tipo !== 'perfume') return false;
            const badgeAtiva = produto.badges.find(b => b.active);
            return badgeAtiva && normalizarTexto(badgeAtiva.name) === filtroGeneroSelecionado;
        });
    }

    // 3. Ordenação de Preço e Posição Customizada
    if (ordenacaoSelecionada === 'padrao') {
        // Organiza pelo número da ordem. Se não tiver (undefined), joga para o fim (999)
        resultados.sort((a, b) => {
            const ordemA = a.ordem !== undefined && a.ordem !== null ? parseInt(a.ordem) : 999;
            const ordemB = b.ordem !== undefined && b.ordem !== null ? parseInt(b.ordem) : 999;
            return ordemA - ordemB;
        });
    } else {
        const extrairValorNumerico = (textoPreco) => {
            if (textoPreco.toLowerCase().includes('consulte') || textoPreco.toLowerCase().includes('dia')) {
                return ordenacaoSelecionada === 'menor' ? Infinity : -Infinity;
            }
            return parseFloat(textoPreco.replace('R$', '').replace('.', '').replace(',', '.').replace(/\s/g, '').trim());
        };

        resultados.sort((a, b) => {
            const precoA = extrairValorNumerico(a.preco);
            const precoB = extrairValorNumerico(b.preco);
            return ordenacaoSelecionada === 'menor' ? precoA - precoB : precoB - precoA;
        });
    }

    // 4. Renderiza o resultado final filtrado
    renderizarProdutos(resultados);
}
// Configurar Abas de Filtros de Gênero
const tabsGenero = document.querySelectorAll('.filter-tab');
tabsGenero.forEach(tab => {
    tab.addEventListener('click', function() {
        tabsGenero.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        filtroGeneroSelecionado = this.dataset.genero;
        filtrarEOrdenarProdutos();
    });
});

// Eventos de Busca
inputBusca.addEventListener('input', filtrarEOrdenarProdutos);

// Lógica de Eventos do Custom Select de Ordenação
if (customSelectWrapper) {
    const trigger = customSelectWrapper.querySelector('.custom-select-trigger');
    const triggerText = trigger.querySelector('span');
    const options = customSelectWrapper.querySelectorAll('.custom-option');
    
    trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        customSelectWrapper.classList.toggle('open');
    });
    
    options.forEach(option => {
        option.addEventListener('click', function() {
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            triggerText.textContent = this.textContent;
            ordenacaoSelecionada = this.dataset.value;
            customSelectWrapper.classList.remove('open');
            filtrarEOrdenarProdutos();
        });
    });
    
    document.addEventListener('click', function() {
        customSelectWrapper.classList.remove('open');
    });
}

// ==========================================================================
// 3. Gerenciamento do Modal de Detalhes
// ==========================================================================

function abrirDetalhesProduto(produto) {
    modalNome.textContent = produto.nome;
    modalTexto.textContent = produto.descricao;
    modalPreco.textContent = produto.preco;

    const modalThumbnails = document.getElementById('modalThumbnails');
    const listaImagens = produto.imagens || [produto.imagem]; // Compatibilidade

    if (modalImagem) {
        modalImagem.src = listaImagens[0];
        modalImagem.alt = produto.nome;
        modalImagem.style.display = 'block';
    }

    if (modalThumbnails) {
        modalThumbnails.innerHTML = '';
        if (listaImagens.length > 1) {
            listaImagens.forEach((imgSrc, idx) => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.className = 'thumb-img' + (idx === 0 ? ' active' : '');
                img.onclick = () => {
                    modalImagem.src = imgSrc;
                    document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
                    img.classList.add('active');
                };
                modalThumbnails.appendChild(img);
            });
        }
    }

    const isIndisponivel = produto.status.toLowerCase().includes('indisponível') || produto.status.toLowerCase().includes('indisponivel');

    // Configurar botão de consultar
    let botaoAtual = document.getElementById('btnConsultarDirect');
    if (botaoAtual) {
        // Remover listeners antigos clonando o botão
        const novoBotao = botaoAtual.cloneNode(true);
        botaoAtual.parentNode.replaceChild(novoBotao, botaoAtual);

        if (isIndisponivel) {
            novoBotao.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Item Indisponível`;
            novoBotao.style.pointerEvents = 'none';
            novoBotao.style.opacity = '0.5';
        } else {
            novoBotao.innerHTML = `<i class="fa-brands fa-instagram"></i> Consultar no Direct`;
            novoBotao.style.pointerEvents = 'auto';
            novoBotao.style.opacity = '1';
            
            novoBotao.addEventListener('click', function(e) {
                e.preventDefault();
                const mensagem = `Olá! Vi no catálogo o produto "${produto.nome}" por ${produto.preco}. Gostaria de saber mais sobre a disponibilidade e finalizar a compra.`;
                navigator.clipboard.writeText(mensagem).then(() => {
                    mostrarToast(`✅ Mensagem copiada! Cole no Direct do Instagram.`);
                    modal.style.display = 'none';
                    setTimeout(() => {
                        window.open('https://ig.me/m/doctor.importss', '_blank');
                    }, 1200);
                }).catch(() => {
                    // Fallback: abrir direto se clipboard falhar
                    window.open('https://ig.me/m/doctor.importss', '_blank');
                });
            });
        }
    }

    modal.style.display = 'flex';
}

fecharModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Banner "Fale conosco no Direct para encomendar"
const btnEncomendar = document.getElementById('btnEncomendar');
if (btnEncomendar) {
    btnEncomendar.addEventListener('click', function(e) {
        e.preventDefault();
        const mensagem = `Olá! Gostaria de encomendar um produto que não encontrei no catálogo. Podem me ajudar?`;
        navigator.clipboard.writeText(mensagem).then(() => {
            mostrarToast(`✅ Mensagem copiada! Cole no Direct do Instagram.`);
            setTimeout(() => {
                window.open('https://ig.me/m/doctor.importss', '_blank');
            }, 1200);
        }).catch(() => {
            window.open('https://ig.me/m/doctor.importss', '_blank');
        });
    });
}

// ==========================================================================
// 4. Lógica da Sacola de Compras Flutuante (Local Storage)
// ==========================================================================

function abrirCarrinho() {
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
}

function fecharCarrinho() {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('open');
}

function mostrarToast(mensagem) {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    if (toast && toastMsg) {
        toastMsg.textContent = mensagem;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

function salvarCarrinho() {
    localStorage.setItem('doctor_imports_cart', JSON.stringify(carrinho));
    atualizarUICarrinho();
}

function adicionarAoCarrinho(id) {
    const produto = PRODUTOS.find(p => p.id === id);
    if (!produto) return;

    // Verificar se já está na sacola
    const itemNoCarrinho = carrinho.find(item => item.id === id);
    if (itemNoCarrinho) {
        itemNoCarrinho.quantidade += 1;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagens ? produto.imagens[0] : produto.imagem,
            quantidade: 1
        });
    }

    mostrarToast(`Adicionado à sacola: ${produto.nome}`);
    salvarCarrinho();
}

function alterarQuantidade(id, delta) {
    const item = carrinho.find(item => item.id === id);
    if (!item) return;

    item.quantidade += delta;
    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(item => item.id !== id);
    }

    salvarCarrinho();
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    salvarCarrinho();
}

function formatarPrecoNumerico(textoPreco) {
    if (textoPreco.toLowerCase().includes('consulte') || textoPreco.toLowerCase().includes('dia')) return 0;
    return parseFloat(textoPreco.replace('R$', '').replace('.', '').replace(',', '.').replace(/\s/g, '').trim());
}

function atualizarUICarrinho() {
    cartItemsContainer.innerHTML = '';
    
    let totalItens = 0;
    let totalPreco = 0;
    let temItemConsulte = false;

    if (carrinho.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty-state">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Sua sacola está vazia.</p>
            </div>
        `;
        cartBadge.textContent = '0';
        cartBadge.style.display = 'none';
        cartTotalValue.textContent = 'R$ 0,00';
        btnCheckoutCart.disabled = true;
        btnCheckoutCart.style.opacity = '0.5';
        btnCheckoutCart.style.pointerEvents = 'none';
        return;
    }

    btnCheckoutCart.disabled = false;
    btnCheckoutCart.style.opacity = '1';
    btnCheckoutCart.style.pointerEvents = 'auto';

    carrinho.forEach(item => {
        totalItens += item.quantidade;
        
        const valorItem = formatarPrecoNumerico(item.preco);
        if (valorItem === 0) {
            temItemConsulte = true;
        } else {
            totalPreco += (valorItem * item.quantidade);
        }

        const cartItemHTML = document.createElement('div');
        cartItemHTML.className = 'cart-item';
        cartItemHTML.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.nome}</div>
                <div class="cart-item-price">${item.preco}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn minus-btn" onclick="alterarQuantidade(${item.id}, -1)">-</button>
                    <span class="qty-num">${item.quantidade}</span>
                    <button class="qty-btn plus-btn" onclick="alterarQuantidade(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removerDoCarrinho(${item.id})">
                <i class="fa-regular fa-trash-can"></i>
            </button>
        `;

        cartItemsContainer.appendChild(cartItemHTML);
    });

    // Atualizar badge flutuante
    cartBadge.textContent = totalItens;
    cartBadge.style.display = 'flex';

    // Format total price
    if (temItemConsulte) {
        cartTotalValue.textContent = `A partir de R$ ${totalPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} + Sob Consulta`;
    } else {
        cartTotalValue.textContent = `R$ ${totalPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
}

// Checkout do Carrinho - Copiar Pedido Completo
function finalizarPedido() {
    if (carrinho.length === 0) return;

    let resumo = `🛒 *NOVO PEDIDO - DOCTOR IMPORTS*\n\n`;
    let totalPreco = 0;
    let temItemConsulte = false;

    carrinho.forEach((item, index) => {
        resumo += `${index + 1}x *${item.nome}* (${item.preco}) [Qtd: ${item.quantidade}]\n`;
        const valorItem = formatarPrecoNumerico(item.preco);
        if (valorItem === 0) {
            temItemConsulte = true;
        } else {
            totalPreco += (valorItem * item.quantidade);
        }
    });

    resumo += `\n💰 *Total Estimado:* `;
    if (temItemConsulte) {
        resumo += `R$ ${totalPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} + Itens a Consultar`;
    } else {
        resumo += `R$ ${totalPreco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    resumo += `\n\n `;

    // Copiar
    navigator.clipboard.writeText(resumo).then(() => {
        mostrarToast(`Pedido copiado! Redirecionando para o Direct...`);
        fecharCarrinho();
        
        // Redirecionar para o direct
        setTimeout(() => {
            window.open('https://ig.me/m/doctor.importss', '_blank');
        }, 1500);
    }).catch(err => {
        console.error('Erro ao copiar pedido: ', err);
    });
}

// Vincular Eventos do Carrinho
cartFloatBtn.addEventListener('click', abrirCarrinho);
closeCartBtn.addEventListener('click', fecharCarrinho);
cartBackdrop.addEventListener('click', fecharCarrinho);
btnCheckoutCart.addEventListener('click', finalizarPedido);

// Tornar funções globais para usar em onclicks do HTML dinâmico
window.alterarQuantidade = alterarQuantidade;
window.removerDoCarrinho = removerDoCarrinho;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderizarProdutos(PRODUTOS);
    atualizarUICarrinho();
});

// ==========================================================================
// 5. Acesso Secreto ao Painel Admin (Login com Hash SHA-256)
// ==========================================================================

(function() {
    const adminBtn = document.getElementById('adminSecretBtn');
    const loginModal = document.getElementById('loginModal');
    const loginClose = document.getElementById('loginClose');
    const loginUserInput = document.getElementById('loginUser');
    const loginPassInput = document.getElementById('loginPass');
    const loginError = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');

    if (!adminBtn || !loginModal) return;

    // Hash SHA-256 da senha "doctor2026" — assim a senha nunca aparece em texto puro
    const HASH_USUARIO = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // "admin"
    const HASH_SENHA   = 'ea28150ae9dda211bb227f3f385e9fe3427e8e019c0f6852265b4ce2c7798d99'; // "doctor2026"

    // Função de hash SHA-256 usando Web Crypto API (async)
    async function sha256(texto) {
        const encoder = new TextEncoder();
        const data = encoder.encode(texto);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Abrir modal de login
    adminBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
        loginError.textContent = '';
        loginUserInput.value = '';
        loginPassInput.value = '';
        setTimeout(() => loginUserInput.focus(), 100);
    });

    // Fechar modal
    loginClose.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.remove('active');
    });

    // Tentativa de login
    async function tentarLogin() {
        const user = loginUserInput.value.trim().toLowerCase();
        const pass = loginPassInput.value;

        if (!user || !pass) {
            loginError.textContent = 'Preencha todos os campos.';
            return;
        }

        const hashUser = await sha256(user);
        const hashPass = await sha256(pass);

        if (hashUser === HASH_USUARIO && hashPass === HASH_SENHA) {
            loginError.textContent = '';
            loginModal.classList.remove('active');
            window.location.href = 'admin.html';
        } else {
            loginError.textContent = 'Usuário ou senha incorretos.';
            loginPassInput.value = '';
            loginPassInput.focus();
        }
    }

    loginBtn.addEventListener('click', tentarLogin);

    // Enter para submeter
    loginPassInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') tentarLogin();
    });

    loginUserInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') loginPassInput.focus();
    });
})();

// Navegação do Carrossel do Card
window.navCardCarousel = function(event, button, direction) {
    event.stopPropagation(); // Evita abrir o modal ao clicar na seta
    const carousel = button.parentElement.querySelector('.card-carousel');
    if(carousel) {
        const scrollAmount = carousel.offsetWidth;
        carousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
    }
};
