const assert = require("node:assert");
const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require("./test_helper");
const Blog = require("../models/blog");
// api simula richieste HTTP contro app senza avviare un server reale su una porta
const api = supertest(app);

// un unico describe esterno avvolge tutto: ogni test del file gira sotto
// questa stessa premessa comune ("ci sono già dei blog salvati")
describe("when there is initially some blogs saved", () => {
  // gira prima di ogni singolo test (non una volta sola): azzera la collection
  // e reinserisce initialBlogs, così nessun test eredita modifiche fatte da un altro
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
  });

  // verifica solo il "contratto" della risposta (status + content-type), non i dati
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  // il confronto è contro initialBlogs.length, non un numero scritto a mano:
  // resta corretto anche se in futuro cambia quanti blog ci sono nel dataset
  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, helper.initialBlogs.length);
  });

  test("a specific blog is within the returned blogs", async () => {
    const response = await api.get("/api/blogs");

    const contents = response.body.map((e) => e.title);
    assert(contents.includes("React patterns"));
  });

  test("unique identifier property is named id", async () => {
    const response = await api.get("/api/blogs");
    const blog = response.body[0];

    assert(blog.id !== undefined);
    assert.strictEqual(blog._id, undefined);
  });

  // sotto-scenario annidato: tutto ciò che riguarda la visualizzazione di un singolo blog
  describe("viewing a specific blog", () => {
    test("succeeds with a valid id", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToView = blogsAtStart[0];

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.deepStrictEqual(resultBlog.body, blogToView);
    });
  });

  // sotto-scenario annidato: tutto ciò che riguarda la creazione di un nuovo blog
  describe("addition of a new blog", () => {
    let token;

    // crea un utente e ci si logga davvero (via /api/login) prima di ogni test:
    // le POST richiedono ora un token valido, quindi serve procurarselo qui
    beforeEach(async () => {
      await User.deleteMany({});
      const passwordHash = await bcrypt.hash("sekret", 10);
      const user = new User({ username: "blogowner", passwordHash });
      await user.save();

      const loginResponse = await api
        .post("/api/login")
        .send({ username: "blogowner", password: "sekret" });

      token = loginResponse.body.token;
    });

    test("succeeds with valid data", async () => {
      const newBlog = {
        title: "Test Blog",
        author: "Test Author",
        url: "http://test.com",
        likes: 0,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
      const contents = blogsAtEnd.map((b) => b.title);
      assert(contents.includes("Test Blog"));
    });

    test("likes defaults to 0 if missing", async () => {
      const newBlog = {
        title: "Blog without likes",
        author: "Test Author",
        url: "http://test.com",
      };

      const response = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201);

      assert.strictEqual(response.body.likes, 0);
    });

    test("fails with status 400 if title is missing", async () => {
      const newBlog = {
        author: "Test Author",
        url: "http://test.com",
        likes: 0,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    test("fails with status 400 if url is missing", async () => {
      const newBlog = {
        title: "Blog without url",
        author: "Test Author",
        likes: 0,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    // il caso richiesto esplicitamente dall'esercizio 4.23: nessun token, nessuna creazione
    test("fails with status 401 if token is not provided", async () => {
      const newBlog = {
        title: "Blog without token",
        author: "Test Author",
        url: "http://test.com",
        likes: 0,
      };

      await api.post("/api/blogs").send(newBlog).expect(401);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });
  });

  // sotto-scenario annidato: tutto ciò che riguarda la cancellazione di un blog
  describe("deletion of a blog", () => {
    let owner;
    let token;
    let blogToDelete;

    // crea un utente, ci si logga, e crea un blog suo: solo il creatore può cancellarlo
    beforeEach(async () => {
      await User.deleteMany({});
      const passwordHash = await bcrypt.hash("sekret", 10);
      owner = await new User({ username: "blogowner", passwordHash }).save();

      const loginResponse = await api
        .post("/api/login")
        .send({ username: "blogowner", password: "sekret" });
      token = loginResponse.body.token;

      const created = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "To be deleted", author: "Owner", url: "http://x.com" });
      blogToDelete = created.body;
    });

    test("succeeds with status 204 if the creator deletes it", async () => {
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();
      const ids = blogsAtEnd.map((b) => b.id);
      assert(!ids.includes(blogToDelete.id));
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);

      // il riferimento nell'utente non deve restare orfano
      const ownerAtEnd = await User.findById(owner._id);
      const userBlogIds = ownerAtEnd.blogs.map((id) => id.toString());
      assert(!userBlogIds.includes(blogToDelete.id));
    });

    test("fails with status 401 if token is not provided", async () => {
      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    });

    test("fails with status 401 if token is invalid", async () => {
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", "Bearer not-a-real-token")
        .expect(401);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    });

    test("fails with status 403 if the user is not the creator", async () => {
      const passwordHash = await bcrypt.hash("sekret2", 10);
      await new User({ username: "someoneelse", passwordHash }).save();
      const otherLogin = await api
        .post("/api/login")
        .send({ username: "someoneelse", password: "sekret2" });

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${otherLogin.body.token}`)
        .expect(403);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    });
  });

  // sotto-scenario annidato: tutto ciò che riguarda l'aggiornamento di un blog esistente
  describe("update of a blog", () => {
    test("succeeds with valid data", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];

      const updatedBlogData = {
        title: "Updated Title",
        author: "Updated Author",
        url: "http://updated.com",
        likes: 10,
      };

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlogData)
        .expect(200);

      assert.deepStrictEqual(response.body, {
        ...blogToUpdate,
        ...updatedBlogData,
      });
    });
  });
});

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ro',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('shorter than the minimum allowed length'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'validusername',
      name: 'Superuser',
      password: 'ab',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('password must be at least 3 characters long'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

// chiude la connessione al DB a fine suite, altrimenti node --test resta
// in attesa di qualcosa che non si chiuderebbe mai da solo
after(async () => {
  await mongoose.connection.close();
});
