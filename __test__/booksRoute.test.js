const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

process.env.NODE_ENV = "test"

describe("Book Routes Test", function () {
    let book_isbn

    beforeEach(async function () {
        await db.query("DELETE FROM books");
        let result = await db.query(`
        INSERT INTO
          books (isbn, amazon_url,author,language,pages,publisher,title,year)
          VALUES(
            '123432122',
            'https://amazon.com/taco',
            'Elie',
            'English',
            100,
            'Nothing publishers',
            'my first book', 2008)
          RETURNING isbn`);
    
        book_isbn = result.rows[0].isbn
    })

    describe('GET /books', function () {
        test("returns list of books", async function () {
            const response = await request(app)
                .get(`/books`)
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ books: [{
                isbn: '123432122',
                amazon_url: 'https://amazon.com/taco',
                author: 'Elie',
                language: 'English', 
                pages: 100,
                publisher: 'Nothing publishers',
                title: 'my first book', 
                year: 2008
                }]
            });
        });
    });

    describe(" GET /books/:isbn", function () {
        test("returns selected book", async function () {
            const response = await request(app)
                .get(`/books/${book_isbn}`)
            expect(response.statusCode).toBe(200);
            expect(response.body.book.isbn).toBe(book_isbn);
            expect(response.body).toEqual({ book: {
                isbn: '123432122',
                amazon_url: 'https://amazon.com/taco',
                author: 'Elie',
                language: 'English', 
                pages: 100,
                publisher: 'Nothing publishers',
                title: 'my first book', 
                year: 2008
                }
            });
        })
        test("return error with unvalid book", async function () {
            const response = await request(app)
                .get(`/books/9999`)
            expect(response.statusCode).toBe(404);
        })
    })

    describe('POST /books', function () {
        test("creates a book", async function () {
            const response = await request(app)
                .post(`/books`)
                .send({
                    isbn: '32794782',
                    amazon_url: "https://taco.com",
                    author: "mctest",
                    language: "english",
                    pages: 1000,
                    publisher: "yeah right",
                    title: "amazing times",
                    year: 2000
                })
            expect(response.statusCode).toBe(201);
            expect(response.body).toEqual({ book: {
                isbn: '32794782',
                amazon_url: "https://taco.com",
                author: "mctest",
                language: "english",
                pages: 1000,
                publisher: "yeah right",
                title: "amazing times",
                year: 2000
              }
            });
        });

        test("fails creating a book", async function () {
            const response = await request(app)
                .post(`/books`)
                .send({
                    isbn: '32794782',
                    author: "mctest",
                    language: "english",
                    pages: 1000,
                    publisher: "yeah right",
                    title: "amazing times",
                    year: 2000
                })
            expect(response.statusCode).toBe(400);
        });
    });

    describe('PUT/books', function () {
        test("updates the selected book", async function () {
            const response = await request(app)
                .put(`/books/${book_isbn}`)
                .send({
                    isbn: '32794782',
                    amazon_url: "https://taco.com",
                    author: "mctest",
                    language: "english",
                    pages: 1000,
                    publisher: "yeah right",
                    title: "amazing times",
                    year: 2000
                })
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ book: {
                isbn: book_isbn,
                amazon_url: "https://taco.com",
                author: "mctest",
                language: "english",
                pages: 1000,
                publisher: "yeah right",
                title: "amazing times",
                year: 2000
              }
            });
        });

        test("fails updating the book", async function () {
            const response = await request(app)
                .put(`/books/${book_isbn}`)
                .send({
                    isbn: '32794782',
                    amazon_url: "https://taco.com",
                    author: "mctest",
                    pages: 1000,
                    publisher: "yeah right",
                    title: "amazing times",
                    year: 2000
                })
            expect(response.statusCode).toBe(400);
        });

        test("fails updating the book", async function () {
            const response = await request(app)
                .post(`/books/999`)
            expect(response.statusCode).toBe(404);
        });
    });

    
    describe(" DELETE /books/:isbn", function () {
        test("deletes the selected book", async function () {
            const response = await request(app)
                .delete(`/books/${book_isbn}`)
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: "Book deleted" });
        })
        test("returns error deleting with unvalid book", async function () {
            const response = await request(app)
                .delete(`/books/9999`)
            expect(response.statusCode).toBe(404);
        })
    })
})

afterAll(async function () {
    await db.end();
})