// Cargar posts al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    
    // Manejar clic en categorías
    document.querySelectorAll('.categoria, .categoria-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const categoria = this.getAttribute('data-categoria') || this.dataset.categoria;
            console.log("Categoría seleccionada:", categoria); // Para debug
            loadPosts(categoria);
            
            // Actualizar título de la sección
            const tituloSeccion = document.getElementById('titulo-seccion');
            tituloSeccion.textContent = `Publicaciones de ${formatCategoryName(categoria)}`;
        });
    });
    
    // Volver al inicio
    document.getElementById('inicio-link').addEventListener('click', function(e) {
        e.preventDefault();
        loadPosts();
        document.getElementById('titulo-seccion').textContent = 'Últimas Publicaciones';
    });
});

//convertir el formato a markdown
function markdownToHtml(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Negritas
        .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Cursivas
        .replace(/\n/g, '<br>')                          // Saltos de línea
        //.replace(/  /g, ' &nbsp;');
}

// Formatear nombre de categoría para mostrar
function formatCategoryName(category) {
    return category
        .replace('-', ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Cargar posts
async function loadPosts(category = null) {
    const container = document.getElementById('publicaciones-container');
    container.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div><p class="mt-2">Cargando publicaciones...</p></div>';
    
    try {
        console.log("Cargando posts para categoría:", category); // Debug
        
        const posts = await getPosts(category);
        console.log("Posts recibidos:", posts); // Debug

        if (posts.length === 0) {
            showNoPostsMessage(category);
            return;
        }

        container.innerHTML = '';
        posts.forEach(post => {
            // Asegurar que la categoría existe y está normalizada
            if (!post.category) {
                console.warn("Post sin categoría:", post.id);
                post.category = 'tendencias';
            }
            
            // Normalizar categoría para comparación
            post.normalizedCategory = post.category.toLowerCase().replace(' ', '-');
            
            // Filtrar por categoría si se especificó
            if (!category || post.normalizedCategory === category) {
                const postElement = createPostElement(post);
                container.appendChild(postElement);
            }
        });

        // Si después de filtrar no hay posts
        if (container.innerHTML === '') {
            showNoPostsMessage(category);
        }

    } catch (error) {
        console.error("Error detallado:", error);
        showErrorMessage();
    }
}

// Mostrar mensaje cuando no hay posts
function showNoPostsMessage(category) {
    const container = document.getElementById('publicaciones-container');
    container.innerHTML = `
        <div class="no-posts fade-in">
            <i class="fas fa-newspaper"></i>
            <h3>No hay publicaciones</h3>
            <p>${category ? `No se encontraron publicaciones en "${formatCategoryName(category)}".` 
                          : 'Aún no hay publicaciones en el blog.'}</p>
            ${currentUser ? '<button class="btn btn-primary mt-3" id="nuevo-post-btn-empty">Crear primera publicación</button>' : ''}
        </div>
    `;
    
    if (currentUser) {
        document.getElementById('nuevo-post-btn-empty').addEventListener('click', () => {
            document.getElementById('nuevo-post-btn').click();
        });
    }
}

// Mostrar mensaje de error
function showErrorMessage() {
    const container = document.getElementById('publicaciones-container');
    container.innerHTML = `
        <div class="alert alert-danger fade-in">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Error al cargar las publicaciones. Por favor, intenta nuevamente.
        </div>
        <div class="text-center mt-3">
            <button class="btn btn-outline-primary" onclick="window.location.reload()">
                <i class="fas fa-sync-alt me-2"></i> Recargar página
            </button>
        </div>
    `;
}

// Crear elemento HTML para un post (versión mejorada)
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post-card card mb-4 fade-in';
    postElement.style.animationDelay = `${Math.random() * 0.3}s`;
    
    // Asegurar que la categoría existe
    const category = post.category || 'tendencias';
    const categoryDisplay = formatCategoryName(category);
    
    // Diseño mejorado con imagen a la izquierda
    postElement.innerHTML = `
        <div class="row g-0 h-100">
            ${post.imageUrl ? `
            <div class="col-md-4 post-image-container">
                <img src="${post.imageUrl}" class="img-fluid rounded-start h-100" alt="${post.title}" style="object-fit: cover;">
            </div>
            ` : ''}
            <div class="${post.imageUrl ? 'col-md-8' : 'col-12'} post-content-container">
                <div class="card-body h-100 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge ${getCategoryClass(category)}">
                            ${categoryDisplay}
                        </span>
                        <small class="text-muted">${post.formattedDate}</small>
                    </div>
                    <h5 class="card-title">${post.title}</h5>
                    <div class="card-text-container" style="max-height: 120px; overflow: hidden;">
    <div class="card-text-content" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
        ${markdownToHtml(post.content)}
    </div>
</div>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <small class="text-muted">Por: ${post.author}</small>
                        <button class="btn btn-sm btn-outline-primary read-more-btn" data-post-id="${post.id}">
                            Leer más <i class="fas fa-arrow-right ms-1"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar evento al botón "Leer más"
    postElement.querySelector('.read-more-btn').addEventListener('click', () => {
        showPostInModal(post.id);
    });
    
    return postElement;
}

// Función para obtener clase CSS de categoría (mejorada)
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

// Acortar texto para la vista previa
function truncateText(html, maxLength) {
    if (!html) return '';
    
    // Crear elemento temporal para medir el texto
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Obtener texto plano (sin etiquetas) para medir longitud
    const plainText = temp.textContent || temp.innerText || '';
    
    if (plainText.length <= maxLength) return html; // Devolver HTML original si no necesita truncarse
    
    // Encontrar la posición donde cortar (último espacio antes del maxLength)
    const lastSpace = plainText.substring(0, maxLength).lastIndexOf(' ');
    const truncatedText = plainText.substring(0, lastSpace > 0 ? lastSpace : maxLength);
    
    // Mantener las etiquetas HTML en el texto truncado
    let truncatedHtml = '';
    let charCount = 0;
    let insideTag = false;
    
    for (let i = 0; i < html.length && charCount < truncatedText.length; i++) {
        if (html[i] === '<') insideTag = true;
        if (!insideTag) charCount++;
        if (html[i] === '>') insideTag = false;
        truncatedHtml += html[i];
    }
    
    return truncatedHtml + '...';
}