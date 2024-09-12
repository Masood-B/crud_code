import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Client, Databases, ID } from 'appwrite';

// Initialize the Appwrite client
const client = new Client();
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('66bb60f200190fe2bd78');

const databases = new Databases(client);

const App = () => {
    // Product states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [items, setItems] = useState([]);

    // Category states
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [categories, setCategories] = useState([]);
    const [, setIsEditingCategory] = useState(false);
    const [currentCategoryId, setCurrentCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [editingCategoryDescription, setEditingCategoryDescription] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const itemsResponse = await databases.listDocuments('66bb619a002c135728a9', '66e01279001449d1654a');
            setItems(itemsResponse.documents);

            const categoriesResponse = await databases.listDocuments('66bb619a002c135728a9', '66e14e0c00256bad769a');
            setCategories(categoriesResponse.documents);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await updateItem(currentItemId);
        } else {
            await createItem();
        }
        closeModal();
    };

    const createItem = async () => {
        try {
            const productId = ID.unique();
            const response = await databases.createDocument(
                '66bb619a002c135728a9',
                '66e01279001449d1654a',
                productId,
                {
                    productId,
                    name,
                    description,
                    price: parseFloat(price),
                    categories: [categoryId]
                }
            );
            setItems([...items, response]);
            clearForm();
        } catch (error) {
            console.error('Error creating item:', error);
        }
    };

    const createCategory = async (e) => {
        e.preventDefault();
        try {
            const categoryId = ID.unique();
            const response = await databases.createDocument(
                '66bb619a002c135728a9',
                '66e14e0c00256bad769a',
                categoryId,
                {
                    categoryId,
                    name: categoryName,
                    description: categoryDescription,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );
            setCategories([...categories, response]);
            clearCategoryForm();
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const updateItem = async (itemId) => {
        try {
            const response = await databases.updateDocument(
                '66bb619a002c135728a9',
                '66e01279001449d1654a',
                itemId,
                {
                    name,
                    description,
                    price: parseFloat(price),
                    categories: [categoryId]
                }
            );
            setItems(items.map((item) => (item.$id === itemId ? response : item)));
            clearForm();
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const deleteItem = async (itemId) => {
        try {
            await databases.deleteDocument('66bb619a002c135728a9', '66e01279001449d1654a', itemId);
            setItems(items.filter((item) => item.$id !== itemId));
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const clearForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setCategoryId('');
        setIsEditing(false);
        setCurrentItemId(null);
    };

    const clearCategoryForm = () => {
        setCategoryName('');
        setCategoryDescription('');
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setCategoryId(item.categories[0]);
        setCurrentItemId(item.$id);
        openModal();
    };

    const handleEditCategory = (category) => {
        setIsEditingCategory(true);
        setEditingCategoryName(category.name);
        setEditingCategoryDescription(category.description);
        setCurrentCategoryId(category.$id);
        openCategoryModal();
    };

    const updateCategory = async () => {
        try {
            await databases.updateDocument(
                '66bb619a002c135728a9',
                '66e14e0c00256bad769a',
                currentCategoryId,
                {
                    name: editingCategoryName,
                    description: editingCategoryDescription,
                    updatedAt: new Date().toISOString()
                }
            );
            setCategories(categories.map((cat) =>
                cat.$id === currentCategoryId ? { ...cat, name: editingCategoryName, description: editingCategoryDescription } : cat
            ));
            closeCategoryModal();
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const deleteCategory = async (categoryId) => {
        try {
            await databases.deleteDocument('66bb619a002c135728a9', '66e14e0c00256bad769a', categoryId);
            setCategories(categories.filter((cat) => cat.$id !== categoryId));
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const openModal = () => {
        setCategoryId('');
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

    const openCategoryModal = () => {setIsCategoryModalOpen(true)};
    const closeCategoryModal = () => setIsCategoryModalOpen(false);

    return (
        <div>
            <h1>Appwrite CRUD System</h1>

            <h2>Create Product</h2>
            <button onClick={() => {
                setIsEditing(false);
                openModal();
            }}>
                Create Product
            </button>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Product Form"
                ariaHideApp={false}
            >
                <h2>{isEditing ? 'Edit Product' : 'Create Product'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Product Name"
                        required
                    />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Product Description"
                        required
                    />
                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Price"
                        required
                    />
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select Category</option>
                        {categories.map((category) => (
                            <option key={category.$id} value={category.$id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <button type="submit">{isEditing ? 'Update' : 'Create'} Product</button>
                    <button type="button" onClick={closeModal}>Cancel</button>
                </form>
            </Modal>

            <hr />

            <h2>Create Category</h2>
            <form onSubmit={createCategory}>
                <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Category Name"
                    required
                />
                <input
                    type="text"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Category Description"
                    required
                />
                <button type="submit">Create Category</button>
            </form>

            <h2>Product List</h2>
            <ul>
                {items.map((item) => (
                    <li key={item.$id}>
                        <strong>{item.productId}</strong> - {item.name} - {item.description} - ${item.price} - 
                        {/* Ensure the category exists and display its name */}
                        Category: {item.categories && item.categories[0]?.name ? item.categories[0].name : 'No Category'}
                        <button onClick={() => handleEdit(item)}>Edit</button>
                        <button onClick={() => deleteItem(item.$id)}>Delete</button>
                    </li>
                ))}
            </ul>

            <h2>Category List</h2>
            <ul>
                {categories.map((category) => (
                    <li key={category.$id}>
                        {category.name} - {category.description}
                        <button onClick={() => handleEditCategory(category)}>Edit</button>
                        <button onClick={() => deleteCategory(category.$id)}>Delete</button>
                    </li>
                ))}
            </ul>

            <Modal
                isOpen={isCategoryModalOpen}
                onRequestClose={closeCategoryModal}
                contentLabel="Category Form"
                ariaHideApp={false}
            >
                <h2>Edit Category</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    updateCategory();
                }}>
                    <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        placeholder="Category Name"
                        required
                    />
                    <input
                        type="text"
                        value={editingCategoryDescription}
                        onChange={(e) => setEditingCategoryDescription(e.target.value)}
                        placeholder="Category Description"
                        required
                    />
                    <button type="submit">Update Category</button>
                    <button type="button" onClick={closeCategoryModal}>Cancel</button>
                </form>
            </Modal>
        </div>
    );
};

export default App;
