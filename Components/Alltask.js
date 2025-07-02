import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TouchableWithoutFeedback, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const Alltask = () => {
    const [tasks, setTasks] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const BASE_URL = 'http://192.168.18.63:3000/api/v1';
    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInputRef, setSearchInputRef] = useState(null);
    const [updatetoggle, setupdatetoggle] = useState(false);


    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/get-all`);
            setTasks(res.data);
        } catch (error) {
            console.log('Error fetching tasks:', error);
        }
    };


    const addTask = async () => {
        if (newTask.title.trim() === '') return;
        try {
            console.log('Adding new task:', newTask);
            const res = await axios.post(`${BASE_URL}/adddata`, newTask);
            setTasks([...tasks, res.data]);
            setNewTask({ title: '', description: '' });
            setShowAddModal(false);
        } catch (error) {
            console.log('Error adding task:', error);
        }
    };


    const deleteTask = async () => {
        try {
            await axios.delete(`${BASE_URL}/${selectedTaskId}`);
            setTasks(tasks.filter(task => task._id !== selectedTaskId));
            setShowDeleteModal(false);
        } catch (error) {
            console.log('Error deleting task:', error);
        }
    };


    const toggleComplete = async (taskId) => {
        const task = tasks.find(t => t._id === taskId);
        if (!task) return;
        try {
            const res = await axios.put(`${BASE_URL}/complete${taskId}`, {
                completed: !task.completed,
            });
            setTasks(tasks.map(t => (t._id === taskId ? res.data : t)));
        } catch (error) {
            console.log('Error updating task:', error);
        }
    };

    const handleSearchPress = () => {
        if (searchInputRef) {
            searchInputRef.focus();
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Tasks</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={{ padding: 8 }}>
                    <Ionicons name="add-circle-outline" size={30} color="#4CAF50" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchcontainer}>
                <TextInput
                    ref={(ref) => setSearchInputRef(ref)}
                    placeholder='Search tasks...'
                    placeholderTextColor="#999"
                    style={{ flex: 1, padding: 10, fontSize: 16, color: '#333' }}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity onPress={handleSearchPress} style={{ padding: 8 }}>
                    <Ionicons name="search" size={24} color="#1C368E" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.taskItem, item.completed && styles.completedTask]}>
                        <View style={styles.taskInfo}>
                            <Text style={styles.taskTitle}>{item.title}</Text>
                            {item.description && <Text style={styles.taskDescription}>{item.description}</Text>}
                        </View>
                        <View style={styles.taskActions}>
                            <TouchableOpacity
                                onPress={() => toggleComplete(item._id)}
                                style={[styles.completeButton, item.completed && styles.completedButton]}
                            >
                                <Text style={styles.completeButtonText}>{item.completed ? 'Completed' : 'Complete'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { setShowAddModal(true), setupdatetoggle(true); }}
                                style={styles.deleteButton}
                            >
                                <Ionicons name="pencil" size={20} color="#ff6b6b" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedTaskId(item._id);
                                    setShowDeleteModal(true);
                                }}
                                style={styles.deleteButton}
                            >
                                <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<View style={styles.emptyList}><Text style={styles.emptyText}>No tasks found</Text></View>}
            />


            <Modal transparent visible={showDeleteModal} animationType="fade">
                <TouchableWithoutFeedback onPress={() => setShowDeleteModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Delete Task</Text>
                            <Text style={styles.modalMessage}>Are you sure you want to delete this task?</Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDeleteModal(false)}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteButtonModal} onPress={deleteTask}>
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <Modal transparent visible={showAddModal} animationType="fade">
                <TouchableWithoutFeedback onPress={() => { setShowAddModal(false), setupdatetoggle(false); }}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.addModalContent}>
                            <Text style={styles.modalTitle}>{updatetoggle ? "Update Task" : "Add New Task"}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Task title"
                                placeholderTextColor="#999"
                                value={newTask.title}
                                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                            />
                            <TextInput
                                style={[styles.input, styles.descriptionInput]}
                                placeholder="Description (optional)"
                                multiline
                                placeholderTextColor="#999"
                                numberOfLines={3}
                                value={newTask.description}
                                onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setNewTask({ title: '', description: '' });
                                        setShowAddModal(false);
                                        setupdatetoggle(false);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.addButtonModal}
                                    onPress={addTask}
                                    disabled={newTask.title.trim() === ''}
                                >
                                    <Text style={styles.buttonText}>
                                        {updatetoggle ? "Update" : "Add Task"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    header: {
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flex: 1,
    },
    taskItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    completedTask: {
        opacity: 0.7,
        backgroundColor: '#f9f9f9',
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    taskDescription: {
        fontSize: 14,
        color: '#666',
    },
    taskActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    completeButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 10,
    },
    completedButton: {
        backgroundColor: '#4CAF50',
    },
    completeButtonText: {
        color: '#333',
        fontSize: 14,
    },
    deleteButton: {
        padding: 5,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 20,
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        padding: 10,
        marginRight: 10,
    },
    deleteButtonModal: {
        backgroundColor: '#ff6b6b',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'black',
        fontWeight: '500',
    },
    addButton: {
        padding: 8,
    },
    addModalContent: {
        backgroundColor: 'white',
        width: '90%',
        borderRadius: 10,
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    descriptionInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    addButtonModal: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 6,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    searchcontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
});

export default Alltask;