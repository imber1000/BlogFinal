// Inicializar modales
const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
const registerModal = new bootstrap.Modal(document.getElementById("registerModal"));
const postModal = new bootstrap.Modal(document.getElementById("postModal"));
const viewPostModal = new bootstrap.Modal(document.getElementById("viewPostModal"));

// markdown
//function markdownToHtml(text) {
//    if (!text) return '';
    // Convertir **texto** a <strong>texto</strong>
//    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
//}

// Nueva función para formato de texto
function markdownToHtml(text) {
    if (!text) return '';
    // Soporte para negritas (**texto**) y saltos de línea
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Negritas
        .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Cursivas
        .replace(/\n/g, '<br>');                           // Salto de lineas
}

// Mostrar modal de login
document.getElementById("login-btn")?.addEventListener("click", () => {
    loginModal.show();
});

// Mostrar modal de registro
//document.getElementById("register-btn")?.addEventListener("click", () => {
//    registerModal.show();
//});

// Mostrar modal para nuevo post
document.getElementById("nuevo-post-btn")?.addEventListener("click", () => {
    document.getElementById("postModalTitle").textContent = "Nueva Publicación";
    document.getElementById("postForm").reset();
    document.getElementById("postId").value = "";
    document.getElementById("imagePreview").classList.add("d-none");
    postModal.show();
});

// Vista previa de imagen
document.getElementById("postImage")?.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById("imagePreview");
            preview.querySelector("img").src = event.target.result;
            preview.classList.remove("d-none");
        };
        reader.readAsDataURL(file);
    }
});

// Eliminar imagen seleccionada
document.getElementById("removeImage")?.addEventListener("click", function() {
    document.getElementById("postImage").value = "";
    document.getElementById("imagePreview").classList.add("d-none");
});

// Manejar envío del formulario de post
document.getElementById("postForm")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById("submitPostBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
    
    try {
        const postData = {
            title: document.getElementById("postTitle").value,
            category: document.getElementById("postCategory").value,
            content: document.getElementById("postContent").value,
            imageUrl: document.getElementById("imagePreview").classList.contains("d-none") ? '' : 
                     document.getElementById("imagePreview").querySelector("img").src
        };
        
        const postId = document.getElementById("postId").value;
        await savePost(postData, postId || null);
        
        postModal.hide();
        loadPosts(); // Recargar la lista de posts
    } catch (error) {
        alert("Error al guardar el post: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-1"></i> Publicar';
    }
});

// Mostrar post completo en modal
async function showPostInModal(postId) {
    try {
        const post = await getPostById(postId);
        if (!post) {
            throw new Error("Post no encontrado");
        }
        
        document.getElementById("viewPostTitle").textContent = post.title;
        document.getElementById("viewPostCategory").textContent = 
            post.category.charAt(0).toUpperCase() + post.category.replace('-', ' ').slice(1);
        document.getElementById("viewPostCategory").className = `badge bg-${getCategoryClass(post.category)}`;
        document.getElementById("viewPostDate").textContent = post.formattedDate;
        //document.getElementById("viewPostContent").innerHTML = markdownToHtml(post.content);
        const contentElement = document.getElementById("viewPostContent");
        contentElement.innerHTML = markdownToHtml(post.content);
        contentElement.style.whiteSpace = "pre-wrap"; // Conserva saltos de línea
        contentElement.style.maxHeight = "60vh"; // Altura máxima
        contentElement.style.overflowY = "auto"; // Scroll si excede el tamaño
        //aqui termina esta parte
        document.getElementById("viewPostAuthor").textContent = `Publicado por: ${post.author}`;
        
        const imageElement = document.getElementById("viewPostImage");
        if (post.imageUrl) {
            imageElement.src = post.imageUrl;
            imageElement.style.display = "block";
        } else {
            imageElement.style.display = "none";
        }
        
        // Mostrar botones de edición/eliminación solo si el usuario es el autor
        const postActions = document.getElementById("postActions");
        if (currentUser && currentUser.uid === post.userId) {
            postActions.classList.remove("d-none");
            document.getElementById("editPostBtn").onclick = () => editPost(post);
            document.getElementById("deletePostBtn").onclick = () => deletePostAndReload(post.id);
        } else {
            postActions.classList.add("d-none");
        }
        
        viewPostModal.show();
    } catch (error) {
        console.error("Error al mostrar el post:", error);
        alert("Error al cargar el post: " + error.message);
    }
}

// Editar post
function editPost(post) {
    viewPostModal.hide();
    
    document.getElementById("postModalTitle").textContent = "Editar Publicación";
    document.getElementById("postId").value = post.id;
    document.getElementById("postTitle").value = post.title;
    document.getElementById("postCategory").value = post.category;
    document.getElementById("postContent").value = post.content;
    
    const imagePreview = document.getElementById("imagePreview");
    if (post.imageUrl) {
        imagePreview.querySelector("img").src = post.imageUrl;
        imagePreview.classList.remove("d-none");
    } else {
        imagePreview.classList.add("d-none");
    }
    
    postModal.show();
}

// Eliminar post y recargar
async function deletePostAndReload(postId) {
    if (confirm("¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.")) {
        try {
            await deletePost(postId);
            viewPostModal.hide();
            loadPosts(); // Recargar la lista de posts
        } catch (error) {
            alert("Error al eliminar el post: " + error.message);
        }
    }
}

// Obtener clase CSS para la categoría
function getCategoryClass(category) {
    switch(category) {
        case 'tendencias': return 'tendencias';
        case 'nuevas-tecnologias': return 'nuevas-tecnologias';
        case 'noticias-delitos': return 'noticias-delitos';
        case 'tips': return 'tips';
        case 'software': return 'software';
        case 'hardware': return 'hardware';
        default: return 'primary';
    }
}
