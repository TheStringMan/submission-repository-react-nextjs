describe('Blog app', function () {
    beforeEach(function () {
        cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)
        const user = {
            name: 'Superuser',
            username: 'root',
            password: 'salainen'
        }
        cy.request('POST', `${Cypress.env('BACKEND')}/users`, user)
        cy.visit('')
    })

    it('Login form is shown', function () {
        cy.contains('login').click()
    })

    describe('Login', function () {
        it('succeeds with correct credentials', function () {
            cy.contains('login').click()
            cy.get('#username').type('root')
            cy.get('#password').type('salainen')
            cy.get('#login-button').click()

            cy.contains('Superuser logged-in')
        })

        it('fails with wrong credentials', function () {
            cy.contains('login').click()
            cy.get('#username').type('root')
            cy.get('#password').type('wrong')
            cy.get('#login-button').click()

            cy.get('.error')
                .should('contain', 'Wrong credentials')
                .and('have.css', 'color', 'rgb(255, 0, 0)')
                .and('have.css', 'border-style', 'solid')

            cy.get('html').should('not.contain', 'Superuser logged-in')
        })
    })

    describe('When logged in', function () {
        beforeEach(function () {
            cy.loginBlog({ username: 'root', password: 'salainen' })
        })

        it('A blog can be created', function () {
            cy.contains('new blog').click()
            cy.get('#title').type('My Cypress Blog')
            cy.get('#author').type('Cypress Tester')
            cy.get('#url').type('http://cypress.io')
            cy.contains('save').click()

            cy.contains('My Cypress Blog by Cypress Tester',)
        })

        describe('and a blog exists', function () {
            beforeEach(function () {
                cy.createBlog({
                    title: 'My Cypress Blog',
                    author: 'Cypress Tester',
                    url: 'http://cypress.io'
                })
            })

            it('User can like a blog', function () {
                // Assumi che ci sia un blog con titolo 'Test Blog'
                cy.contains('My Cypress Blog by Cypress Tester').contains('view').click()

                // Clicca like
                cy.contains('like').click()

                // Controlla likes incrementato
                cy.contains('1 likes')
            })

            it('User who created a blog can delete it', function () {
                // Mostra dettagli blog
                cy.contains('My Cypress Blog by Cypress Tester').contains('view').click()

                // Controlla che il pulsante remove sia visibile
                cy.contains('remove').should('be.visible')

                // Clicca remove
                cy.contains('remove').click()

                // Controlla che il blog non sia più presente
                cy.contains('My Cypress Blog by Cypress Tester').should('not.exist')
            })
        })
    })

    describe('Delete button visibility', function () {
        beforeEach(function () {
            // Reset del database
            cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)

            // Crea primo utente (creatore del blog)
            const user1 = { username: 'creator', name: 'Creator User', password: 'password1' }
            cy.request('POST', `${Cypress.env('BACKEND')}/users`, user1)

            // Crea secondo utente (non creatore)
            const user2 = { username: 'other', name: 'Other User', password: 'password2' }
            cy.request('POST', `${Cypress.env('BACKEND')}/users`, user2)

            // Login primo utente e crea blog
            cy.loginBlog({ username: 'creator', password: 'password1' })
            cy.createBlog({ title: 'Blog da testare', author: 'Author', url: 'http://blog.com' })

            // Logout e login secondo utente
            cy.contains('logout').click()
            cy.loginBlog({ username: 'other', password: 'password2' })

            cy.visit('')
        })

        it('Only the creator sees the delete button', function () {
            // Mostra dettagli blog
            cy.contains('Blog da testare by Author').contains('view').click()

            // Controlla che il pulsante remove NON sia visibile
            cy.contains('remove').should('not.exist')
        })
    })
})