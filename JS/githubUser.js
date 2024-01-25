export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    return fetch(endpoint)
    .then(data => data.json()) //o dado vem como String e é transformado em JSON
    .then(({login, name, public_repos, followers }) => ({ /*desestruturação, passando os argumentos entre {} para que os valores de mesmo nome sejam atribuídos a eles */
      login, 
      name, 
      public_repos, 
      followers
    }))
  }
}
