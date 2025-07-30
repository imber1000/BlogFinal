document.addEventListener("DOMContentLoaded", () => {
    // Inicializar modales solo si existen
    const loginModalEl = document.getElementById("loginModal");
    const registerModalEl = document.getElementById("registerModal");
    const postModalEl = document.getElementById("postModal");
    const viewPostModalEl = document.getElementById("viewPostModal");

    const loginModal = loginModalEl ? new bootstrap.Modal(loginModalEl) : null;
    const registerModal = registerModalEl ? new bootstrap.Modal(registerModalEl) : null;
    const postModal = postModalEl ? new bootstrap.Modal(postModalEl) : null;
    const viewPostModal = viewPostModalEl ? new bootstrap.Modal(viewPostModalEl) : null;

    // Función markdown a HTML (global)
    window.markdownToHtml = function (text) {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    };

    // Mostrar modal de login
    document.getElementById("login-btn")?.addEventListener("click", () => {
        loginModal?.show();
    });

    // Mostrar modal de registro
    document.getElementById("register-btn")?.addEventListener("click", () => {
        registerModal?.show();
    });

    // Mostrar modal para nuevo post
    document.getElementById("nuevo-post-btn")?.addEventListener("click", () => {
        document.getElementById("postModalTitle").textContent = "Nueva Publicación";
        document.getElementById("postForm").reset();
        document.getElementById("postId").value = "";
        document.getElementById("imagePreview").classList.add("d-none");
        postModal?.show();
    });

    // Vista previa de imagen
    document.getElementById("postImage")?.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const preview = document.getElementById("imagePreview");
                preview.querySelector("img").src = event.target.result;
                preview.classList.remove("d-none");
            };
            reader.readAsDataURL(file);
        }
    });

    // Eliminar imagen seleccionada
    document.getElementById("removeImage")?.addEventListener("click", function () {
        document.getElementById("postImage").value = "";
        document.getElementById("imagePreview").classList.add("d-none");
    });

    // Manejar envío del formulario de post
    // Manejar envío del formulario de post
    document.getElementById("postForm")?.addEventListener("submit", async function (e) {
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

            postModal?.hide();

            // ✅ Verifica si la función loadPosts existe antes de llamarla
            if (typeof loadPosts === "function") {
                loadPosts(); 
            } else {
                // Si no está en index.html, recargamos la página actual para mostrar cambios
                location.reload();
            }

        } catch (error) {
            alert("Error al guardar el post: " + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-1"></i> Publicar';
        }
    });

    // Mostrar post completo en nueva pestaña
    window.showPostInModal = function (postId) {
        window.open(`post.html?id=${postId}`, "_blank");
    };

    // Editar post
    window.editPost = function (post) {
        // Oculta el modal de ver post si existe
        if (typeof viewPostModal !== "undefined" && viewPostModal) {
            viewPostModal.hide();
        }

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

        // Abre el modal para editar
        postModal.show();
    };


    // Eliminar post y recargar
    window.deletePostAndReload = async function (postId) {
        if (confirm("¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.")) {
            try {
                await deletePost(postId);
                viewPostModal?.hide();

                // ✅ Verificar si estamos en index.html o post.html
                if (typeof loadPosts === "function") {
                    loadPosts(); 
                } else {
                    // Si no existe loadPosts (estás en post.html), vuelve al index
                    window.location.href = "index.html";
                }

            } catch (error) {
                alert("Error al eliminar el post: " + error.message);
            }
        }
    };

});

// ✅ Definimos las funciones globales inmediatamente
window.getCategoryClass = function (category) {
    switch (category) {
        case 'tendencias': return 'tendencias';
        case 'nuevas-tecnologias': return 'nuevas-tecnologias';
        case 'noticias-delitos': return 'noticias-delitos';
        case 'tips': return 'tips';
        case 'software': return 'software';
        case 'hardware': return 'hardware';
        default: return 'primary';
    }
};

window.markdownToHtml = function (text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
};

