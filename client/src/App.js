import ListHeader from "./components/ListHeader";
import ListItem from './components/ListItem';
import Auth from './components/Auth';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

const App = () => {
  const [cookies, setCookie, removeCookie] = useCookies(null);
  const authToken = cookies.AuthToken;
  const userEmail = cookies.Email;
  const [tasks, setTasks] = useState(null);
const getData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos/${userEmail}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      if (response.ok) {
        const json = await response.json();
        setTasks(json);
      } else if (response.status === 403) {
        console.error("Forbidden: Access denied");
        // You can handle this error as you see fit, e.g., show an error message, redirect, etc.
      } else {
        console.error("Error fetching data:", response.statusText);
        // Handle other error scenarios here
      }
    } catch (err) {
      console.error("Error fetching data:", err);

    }
  };
  

  useEffect(() => {
    if (authToken) {
      getData();
    }
  }, []);

  console.log(tasks);

  //Sort by date
  const sortedTasks = tasks?.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="app">
      {!authToken && <Auth />}
      {authToken && (
        <>
          <ListHeader listName={'🏝️ TO_DO_LIST 🏝️'} getData={getData} />
          <p className="user-email">Welcome back {userEmail}</p>
          {sortedTasks?.map((task) => (
            <ListItem key={task.id} task={task} getData={getData} />
          ))}
        </>
      )}
      <p className="copyright">© KNEXTA Coding LLC</p>
    </div>
  );
};

export default App;