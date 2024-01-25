import { GithubUser } from "./githubUser.js";

export class FavoritesUsers {
  constructor(root) {
    this.root = document.querySelector(root);
    this.tbody = this.root.querySelector('table tbody');

    this.load();
    this.update()
    this.onFavoriteUser();
  }

  // pega o item do localStorage e atribui ao array favorites(se não houver favoritos será atribuído um array vazio)
  load() {
    this.favorites = JSON.parse(localStorage.getItem('@github-favorites:')) || [];// tranforma o JSON no objeto que está dentro dele   
    
    // const noUser = document.querySelector('.no-user');
    // if(this.favorites.length === 0) {      
    //   noUser.classList.remove('hidden');
    // } else {
    //   noUser.classList.add('hidden');
    // }
  }

  //salva no localStorage uma chave(no caso aqui @github-favorites:) e o valor atribuído a ela(no caso o array de favoritos), para que quando a página seja atualizada não se percam os dados
  save() { 
    localStorage.setItem('@github-favorites:', JSON.stringify(this.favorites));
  }  

  removeAllTr() { // limpa a tabela
    this.tbody.querySelectorAll('tr')
    .forEach((tr) => {
      tr.remove();
    })
  }

  createRow() {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/fernandadias9.png" alt="">
        <a href="https://github.com/fernandadias9" target="_blank">
          <p>Fernanda Dias</p>
          <span>fernandadias9</span>
        </a>
      </td>
      <td class="repositories">11</td>
      <td class="followers">54</td>
      <td>
        <button class="remove">Remover</button>
      </td> `

    return tr;
  }

  createNoUsersScreen() {
    const tr = document.createElement('tr');
    tr.classList.add('tr-no-user');

    tr.innerHTML = `
    <td colspan="4">
      <div class="no-user">
        <img src="/assets/Estrela.svg" alt="ícone de uma estrela com uma expressão de surpresa">
        <span>Nenhum favorito ainda</span>
      </div>
    </td> `

    return tr;
  }

  /*função usada para atualizar a tabela, ela é rodada sempre que a página é iniciada/atualizada e quando um usuário é inserido ou deletado */
  update() {     

    this.removeAllTr();

    if(this.favorites.length === 0) {
      const row = this.createNoUsersScreen();

      this.tbody.append(row);
    } else {
      this.favorites.forEach(user => {
        const row = this.createRow();
  
        row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
        row.querySelector('.user img').alt = `Imagem de ${user.name}`;
        row.querySelector('.user a').href = `https://github.com/${user.login}`;
        row.querySelector('.user a p').textContent = user.name;
        row.querySelector('.user span').textContent = user.login;
        row.querySelector('.repositories').textContent = user.public_repos;
        row.querySelector('.followers').textContent = user.followers;
        row.querySelector('.remove').onclick = () => { //chama a função delete() ao clicar em 'remover';
          const isOk = confirm('Tem certeza que deseja remover este favorito?');
  
          if(isOk) {
            this.delete(user);
          }
        }
  
        this.tbody.append(row);
      })
    }
  }

  async favoriteUser(username) {    
    try {
      const userExists = this.favorites.find(entry => entry.login.toLowerCase() === username.toLowerCase());

      if(userExists) {
        throw new Error(`Usuário ${username} já foi adicionado!`)
      }
      const user = await GithubUser.search(username);

      if(user.login === undefined) {
        throw new Error(`Usuário ${username} não encontrado`);
      }
      this.favorites = [user, ...this.favorites]; /*uma forma de colocar um novo elemento no array respeitando o princípio da imutabilidade, assim um novo array é criado com o user novo + as favorites(usuários) que já tinham no outro array*/
      this.update();
      this.save();
    } catch(error) {
      alert(error.message);
    }
  }

  onFavoriteUser() { //chama a função favoriteUser ao clicar no botão 'favoritar'
    const addButton = this.root.querySelector('.btnFavorite');
    const inputSearchUser = this.root.querySelector('#search-user');
    addButton.onclick = () => {
      const { value } = inputSearchUser
      
      this.favoriteUser(value);
      inputSearchUser.value = '';
    }
  }  

  /* primeiro filtra todos os favoritos diferentes do user parâmetro e atribui ao array favorites, ou seja, sem o usuário que foi passado como parâmetro(através do click no 'Remover', depois a tabela é atualizada e o localStorage salvo */
  delete(user) {
    const filteredfavorites = this.favorites.filter(entry => entry.login !== user.login); 
    this.favorites = filteredfavorites;
    this.update();
    this.save();
  }
}