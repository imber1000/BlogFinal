
// Función para obtener parámetros de la URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function loadPost() {
    const postId = getQueryParam("id");
    if (!postId) {
        alert("No se especificó un post.");
        return;
    }

    try {
        const post = await getPostById(postId);
        if (!post) {
            throw new Error("Post no encontrado");
        }

        // Título
        document.getElementById("viewPostTitle").textContent = post.title;

        // Categoría
        document.getElementById("viewPostCategory").textContent =
            post.category.charAt(0).toUpperCase() + post.category.replace('-', ' ').slice(1);
        document.getElementById("viewPostCategory").className = `badge ${getCategoryClass(post.category)}`;

        

        // Fecha
        document.getElementById("viewPostDate").textContent = post.formattedDate;

        // Contenido con soporte markdown
        const contentElement = document.getElementById("viewPostContent");
        contentElement.innerHTML = markdownToHtml(post.content);
        contentElement.style.whiteSpace = "pre-wrap";

        // Autor
        document.getElementById("viewPostAuthor").textContent = `Publicado por: ${post.author}`;

        // Imagen
        const imageElement = document.getElementById("viewPostImage");
        if (post.imageUrl) {
            imageElement.src = post.imageUrl;
            imageElement.style.display = "block";
        } else {
            imageElement.style.display = "none";
        }

        // Mostrar acciones si es el autor
        const postActions = document.getElementById("postActions");
        if (currentUser && currentUser.uid === post.userId) {
            postActions.classList.remove("d-none");
            document.getElementById("editPostBtn").onclick = () => {
                // Usamos la función global editPost de modal.js
                editPost(post);
            };
            document.getElementById("deletePostBtn").onclick = async () => {
                if (confirm("¿Eliminar este post?")) {
                    await deletePost(post.id);
                    window.location.href = "index.html";
                }
            };
        }

    } catch (error) {
        alert("Error al cargar el post: " + error.message);
    }
}

function getCategoryClass(category) {
    const categoryClasses = {
        'tendencias': 'bg-primary',
        'nuevas-tecnologias': 'bg-success',
        'noticias-delitos': 'bg-danger',
        'tips': 'bg-warning text-dark',
        'software': 'bg-info text-dark',
        'hardware': 'bg-secondary'
    };
    return categoryClasses[category] || 'bg-primary';
}

// Ejecutar al cargar la página
loadPost();

