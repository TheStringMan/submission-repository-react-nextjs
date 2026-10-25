const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro
 */

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "Demons",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

/*
  you can remove the placeholder query once your first one has been implemented
*/

const typeDefs = /* GraphQL */ `
  # author è una stringa (il nome), non un oggetto Author collegato:
  # rispecchia come i libri sono salvati davvero nell'array "books" sopra.
  type Book {
    title: String!
    published: Int!
    author: String!
    id: String!
    genres: [String!]!
  }

  # bookCount non esiste nei dati reali di "authors": va calcolato
  # (vedi il resolver Author.bookCount sotto), non lo fornisce il default resolver.
  type Author {
    name: String!
    id: String!
    born: Int
    bookCount: Int!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    // author e genre sono entrambi opzionali (nessun "!" nello schema):
    // senza nessuno dei due, ritorna semplicemente tutti i libri.
    allBooks: (root, args) => {
      if (!args.author && !args.genre) {
        return books;
      }
      let filteredBooks = books;
      if (args.author) {
        filteredBooks = filteredBooks.filter(
          (book) => book.author === args.author,
        );
      }
      // i due filtri si combinano: se sono presenti entrambi i parametri,
      // il secondo filtra ulteriormente il risultato già ridotto dal primo.
      if (args.genre) {
        filteredBooks = filteredBooks.filter((book) =>
          book.genres.includes(args.genre),
        );
      }
      return filteredBooks;
    },
    allAuthors: () => authors,
  },
  Mutation: {
    addBook: (root, args) => {
      // se l'autore del nuovo libro non è ancora in "authors", lo creiamo al volo
      // (born resta null: lo si imposta più avanti con la mutation editAuthor)
      const authorExists = authors.some(
        (author) => author.name === args.author,
      );
      if (!authorExists) {
        const newAuthor = {
          name: args.author,
          id: uuid(),
          born: null,
        };
        authors.push(newAuthor);
      }
      const newBook = {
        title: args.title,
        published: args.published,
        author: args.author,
        id: uuid(),
        genres: args.genres,
      };
      books.push(newBook);
      return newBook;
    },
    // null (non un errore) se il nome non corrisponde a nessun autore salvato
    editAuthor: (root, args) => {
      const author = authors.find((author) => author.name === args.name);
      if (!author) {
        return null;
      }
      // author è lo stesso oggetto referenziato dentro l'array "authors":
      // modificarlo qui aggiorna già l'array, non serve un .map() per riscriverlo
      author.born = args.setBornTo;
      return author;
    }
  },
  Author: {
    // resolver custom perché "bookCount" non è un campo salvato sugli autori:
    // va ricavato contando i libri di "books" con lo stesso nome d'autore
    bookCount: (root) => {
      const authorName = root.name;
      const booksByAuthor = books.filter((book) => book.author === authorName);
      return booksByAuthor.length;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
