import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
    const [newTitle, setNewTitle] = useState('')
    const [newAuthor, setNewAuthor] = useState('')
    const [newURL, setNewURL] = useState('')

    const addBlog = (event) => {
        event.preventDefault()
        createBlog({
            title: newTitle,
            author: newAuthor,
            url: newURL
        })

        setNewTitle('')
        setNewAuthor('')
        setNewURL('')
    }

    return (
        <div>
            <h2>Create a new blog</h2>

            <form onSubmit={addBlog}>
                <div>
                    <label>
                        Title:
                        <input
                            id="title"
                            type="text"
                            value={newTitle}
                            onChange={(event) => setNewTitle(event.target.value)}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Author:
                        <input
                            id="author"
                            type="text"
                            value={newAuthor}
                            onChange={(event) => setNewAuthor(event.target.value)}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        URL:
                        <input
                            id="url"
                            type="text"
                            value={newURL}
                            onChange={(event) => setNewURL(event.target.value)}
                        />
                    </label>
                </div>

                <div>
                    <button type="submit">save</button>
                </div>
            </form>
        </div>
    )
}

export default BlogForm