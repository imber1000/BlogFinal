// Referencia a la colección de posts
const postsRef = firebase.firestore().collection("posts");

// Subir imagen a ImgBB
async function uploadImageToImgBB(file) {
    const apiKey = '88bbd6e71e2b37dec1a03efcd64587e4'; // Necesitas registrarte en ImgBB para obtener una clave API gratuita
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error('Error al subir la imagen');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Crear o actualizar un post
async function savePost(postData, postId = null) {
    try {
        // Si hay una imagen, subirla primero
        const imageFile = document.getElementById("postImage").files[0];
        if (imageFile) {
            // Verificar tamaño de la imagen (máximo 1MB)
            if (imageFile.size > 1048576) {
                throw new Error('La imagen es demasiado grande. Por favor, sube una imagen menor a 1MB.');
            }
            
            const imageUrl = await uploadImageToImgBB(imageFile);
            postData.imageUrl = imageUrl;
        } else if (postData.imageUrl === '') {
            // Si se eliminó la imagen existente y no se subió una nueva
            postData.imageUrl = null;
        }

        // Validar categoría
        const categoriaSelect = document.getElementById("postCategory");
        if (!categoriaSelect || !categoriaSelect.value) {
            throw new Error('Debes seleccionar una categoría válida');
        }
        
        const categoria = categoriaSelect.value;
        console.log("Guardando post con categoría:", categoria);

        // Estructura de datos del post
        const postToSave = {
            title: postData.title,
            category: categoria,  // Usamos el valor del select directamente
            content: postData.content,
            imageUrl: postData.imageUrl || null,
            userId: currentUser.uid,
            author: currentUser.displayName || document.getElementById("username-display").textContent,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (postId) {
            // Actualizar post existente
            await postsRef.doc(postId).update(postToSave);
        } else {
            // Crear nuevo post
            postToSave.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await postsRef.add(postToSave);
        }
        
        return true;
    } catch (error) {
        console.error("Error al guardar el post:", error);
        throw error;
    }
}

// Eliminar un post
async function deletePost(postId) {
    try {
        await postsRef.doc(postId).delete();
        return true;
    } catch (error) {
        console.error("Error al eliminar el post:", error);
        throw error;
    }
}

// Obtener posts con filtros opcionales
async function getPosts(category = null) {
    try {
        let query = postsRef.orderBy("createdAt", "desc");
        
        // Solo filtrar por categoría si se especifica y no es null/undefined
        if (category) {
            console.log("Filtrando por categoría:", category);
            query = query.where("category", "==", category);
        }
        
        const snapshot = await query.get();
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            formattedDate: doc.data().createdAt?.toDate().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }));
        
        console.log("Posts encontrados:", posts.length);
        return posts;
    } catch (error) {
        console.error("Error en getPosts:", error);
        throw error;
    }
}

// Obtener un post por ID
async function getPostById(postId) {
    try {
        const doc = await postsRef.doc(postId).get();
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data(),
                formattedDate: doc.data().createdAt?.toDate().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            };
        }
        return null;
    } catch (error) {
        console.error("Error al obtener el post:", error);
        throw error;
    }
}