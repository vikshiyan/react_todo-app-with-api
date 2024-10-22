import React, { useEffect, useState } from 'react';

import * as todoFromService from './api/todos';
import { Todo } from './types/Todo';
import { getFilteredTodos } from './utils/getFilterdTodos';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { Error } from './components/Error';
import { TypeError } from './types/TypeError';
import { SelectedType } from './types/SelectedType';
import { Header } from './components/Header';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<TypeError>(
    TypeError.DEFAULT,
  );
  const [selectedOption, setSelectedOption] = useState<SelectedType>(
    SelectedType.ALL,
  );
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [temptTodo, setTempTodo] = useState<Todo | null>(null);
  const [loadingTodoId, setLoadingTodoId] = useState<number[]>([]);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);

  const filteredTodos = getFilteredTodos(todos, selectedOption);

  const handleAddTodo = (newTodo: Omit<Todo, 'id'>) => {
    todoFromService
      .createTodo(newTodo)
      .then(addedTodo => {
        setTodos(currentTodos => [...currentTodos, addedTodo]);
        setNewTitle('');
      })
      .catch(() => {
        setErrorMessage(TypeError.ADDING);
      })
      .finally(() => {
        setLoading(false);
        setTempTodo(null);
      });
  };

  const handleDeleteTodo = (todoId: number) => {
    setLoading(true);
    setLoadingTodoId(currentIds => [...currentIds, todoId]);
    todoFromService
      .deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorMessage(TypeError.DELETING);
      })
      .finally(() => {
        setLoading(false);
        setLoadingTodoId([]);
      });
  };

  const updateTodo = (updatedTodo: Todo) => {
    setLoadingTodoId(currentIds => [...currentIds, updatedTodo.id]);
    todoFromService
      .updateTodo(updatedTodo)
      .then(newTodo => {
        setTodos(currentTodos =>
          currentTodos.map(todo => (newTodo.id === todo.id ? newTodo : todo)),
        );
        setEditingTodoId(null);
      })
      .catch(() => {
        setErrorMessage(TypeError.UPDATING);
      })
      .finally(() => {
        setLoadingTodoId([]);
      });
  };

  useEffect(() => {
    todoFromService
      .getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage(TypeError.LOADING));
  }, []);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          setErrorMessage={setErrorMessage}
          onAddTodo={handleAddTodo}
          setLoading={setLoading}
          loading={loading}
          setTempTodo={setTempTodo}
          updateTodo={updateTodo}
        />

        {todos.length > 0 && (
          <>
            <TodoList
              todos={filteredTodos}
              temptTodo={temptTodo}
              onDeleteTodo={handleDeleteTodo}
              loadingTodoId={loadingTodoId}
              updateTodo={updateTodo}
              editingTodoId={editingTodoId}
              setEditingTodoId={setEditingTodoId}
            />

            <Footer
              todos={todos}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              handleDeleteTodo={handleDeleteTodo}
            />
          </>
        )}
      </div>

      <Error errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
    </div>
  );
};
